import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus } from './types';
import { 
  getStoredComplaints, 
  saveStoredComplaints, 
  getAdminAuthState, 
  setAdminAuthState,
  addMyComplaintId,
  removeMyComplaintId,
  getMyComplaintIds
} from './utils/storage';
import {
  subscribeToComplaints,
  addComplaintToFirestore,
  updateComplaintInFirestore,
  updateComplaintStatusInFirestore,
  updateComplaintAdminNoteInFirestore,
  toggleUpvoteInFirestore,
  addCommentToFirestore,
  deleteComplaintFromFirestore
} from './services/complaintsService';
import {
  notifyOnUpvote,
  notifyOnComment,
  notifyOnStatusChange,
  notifyOnAdminNote
} from './services/notificationService';
import { Navbar } from './components/Navbar';
import { SecretTerminal } from './components/SecretTerminal';
import { ComplaintFormModal, CATEGORIES } from './components/ComplaintFormModal';
import { EditComplaintModal } from './components/EditComplaintModal';
import { ComplaintCard } from './components/ComplaintCard';
import { MyComplaintsView } from './components/MyComplaintsView';
import { AdminPanel } from './components/AdminPanel';
import { PhotoLightbox } from './components/PhotoLightbox';
import { StatsBanner } from './components/StatsBanner';
import { 
  Search, 
  ArrowUpDown, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  HeartHandshake,
  MessageSquarePlus,
  RotateCcw,
  UserCheck,
  Cloud,
  Mail
} from 'lucide-react';

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(() => getStoredComplaints());
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => getAdminAuthState());
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [myUpvotedIds, setMyUpvotedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('sikayetimizvar_my_upvotes');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  
  // Navigation View: 'feed' | 'my-complaints' | 'resolved' | 'stats' | 'admin'
  const [activeView, setActiveView] = useState<'feed' | 'my-complaints' | 'resolved' | 'stats' | 'admin'>('feed');

  // Modals state
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isNewComplaintModalOpen, setIsNewComplaintModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Filters & Sorting state for feed
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'top' | 'newest' | 'oldest'>('top');

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Subscribe to real-time Firestore complaints
  useEffect(() => {
    const unsubscribe = subscribeToComplaints(
      (remoteComplaints) => {
        setIsFirebaseConnected(true);
        const myIds = getMyComplaintIds();
        
        // Merge with local upvote state and ownership
        const merged = remoteComplaints.map((c) => ({
          ...c,
          isMine: myIds.includes(c.id) || !!c.isMine,
          upvotedByMe: myUpvotedIds.includes(c.id),
        }));

        setComplaints(merged);
        saveStoredComplaints(merged);
      },
      (err) => {
        console.warn('Firestore subscription notice, fallback active:', err);
      }
    );

    return () => unsubscribe();
  }, [myUpvotedIds]);

  // Sync admin login state
  useEffect(() => {
    setAdminAuthState(isAdminLoggedIn);
  }, [isAdminLoggedIn]);

  // Sync upvoted IDs
  useEffect(() => {
    try {
      localStorage.setItem('sikayetimizvar_my_upvotes', JSON.stringify(myUpvotedIds));
    } catch (e) {
      console.error('Error saving upvoted IDs:', e);
    }
  }, [myUpvotedIds]);

  // Admin login success from secret terminal
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setActiveView('admin');
    showToast('Yönetici girişi başarılı!');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    if (activeView === 'admin') {
      setActiveView('feed');
    }
    showToast('Yönetici oturumu kapatıldı.');
  };

  // Upvoting action with Firestore sync & Email trigger
  const handleUpvote = async (id: string) => {
    const target = complaints.find((c) => c.id === id);
    if (!target) return;

    const isCurrentlyUpvoted = myUpvotedIds.includes(id);
    const newUpvotes = isCurrentlyUpvoted ? Math.max(0, target.upvotes - 1) : target.upvotes + 1;

    // Optimistic UI update
    setMyUpvotedIds((prev) =>
      isCurrentlyUpvoted ? prev.filter((item) => item !== id) : [...prev, id]
    );

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            upvotes: newUpvotes,
            upvotedByMe: !isCurrentlyUpvoted,
          };
        }
        return c;
      })
    );

    try {
      await toggleUpvoteInFirestore(id, newUpvotes);
      
      // If user voted (not unvoted), send email notification to author
      if (!isCurrentlyUpvoted && target.authorEmail) {
        notifyOnUpvote(target);
      }
    } catch (e) {
      console.warn('Firestore upvote sync note:', e);
    }
  };

  // Adding comment with Firestore sync & Email trigger
  const handleAddComment = async (
    complaintId: string,
    text: string,
    author: string,
    isAnonymous: boolean
  ) => {
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newComment = {
      id: 'cm-' + Date.now(),
      author,
      isAnonymous,
      text,
      createdAt: formattedDate,
    };

    const updatedComments = [...target.comments, newComment];

    // Optimistic update
    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, comments: updatedComments } : c))
    );

    showToast('Yorumunuz eklendi.');

    try {
      await addCommentToFirestore(complaintId, updatedComments);
      
      // Send email notification to author
      if (target.authorEmail) {
        notifyOnComment(target, newComment);
      }
    } catch (e) {
      console.warn('Firestore comment sync note:', e);
    }
  };

  // Creating new complaint with Firestore persistence
  const handleCreateComplaint = async (
    data: Omit<Complaint, 'id' | 'status' | 'upvotes' | 'comments'>
  ) => {
    const newId = 'c-' + Date.now();
    const newComplaint: Complaint = {
      ...data,
      id: newId,
      status: 'İnceleniyor',
      upvotes: 1,
      upvotedByMe: true,
      isMine: true,
      comments: [],
    };

    addMyComplaintId(newId);
    setMyUpvotedIds((prev) => [...prev, newId]);
    setComplaints((prev) => [newComplaint, ...prev]);
    showToast('✓ Şikayetiniz başarıyla iletildi ve Firebase veritabanına kaydedildi.');

    try {
      await addComplaintToFirestore(data, newId);
    } catch (e) {
      console.warn('Firestore add complaint note:', e);
    }
  };

  // Editing existing complaint (by user) with Firestore sync
  const handleSaveEditedComplaint = async (updated: Complaint) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...updated, isMine: true } : c))
    );
    showToast('✓ Şikayetiniz güncellendi.');

    try {
      await updateComplaintInFirestore(updated);
    } catch (e) {
      console.warn('Firestore edit note:', e);
    }
  };

  // Deleting user's own complaint with Firestore sync
  const handleDeleteMyComplaint = async (id: string) => {
    removeMyComplaintId(id);
    setComplaints((prev) => prev.filter((c) => c.id !== id));
    showToast('Şikayetiniz silindi.');

    try {
      await deleteComplaintFromFirestore(id);
    } catch (e) {
      console.warn('Firestore delete note:', e);
    }
  };

  // Admin status update with Firestore sync & Email trigger
  const handleUpdateStatus = async (id: string, newStatus: ComplaintStatus) => {
    const today = new Date().toISOString().split('T')[0];
    const target = complaints.find((c) => c.id === id);

    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus, adminUpdatedAt: today } : c))
    );
    showToast(`Şikayet durumu "${newStatus}" olarak güncellendi.`);

    try {
      await updateComplaintStatusInFirestore(id, newStatus, today);
      
      // Notify author of status change via email
      if (target && target.authorEmail) {
        notifyOnStatusChange(target, newStatus, target.adminNote);
      }
    } catch (e) {
      console.warn('Firestore status update note:', e);
    }
  };

  // Admin note update with Firestore sync & Email trigger
  const handleUpdateAdminNote = async (id: string, note: string) => {
    const today = new Date().toISOString().split('T')[0];
    const target = complaints.find((c) => c.id === id);

    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, adminNote: note || undefined, adminUpdatedAt: today } : c))
    );
    showToast('Resmi idare yanıtı kaydedildi.');

    try {
      await updateComplaintAdminNoteInFirestore(id, note, today);
      
      // Notify author of official admin note via email
      if (target && target.authorEmail && note) {
        notifyOnAdminNote(target, note);
      }
    } catch (e) {
      console.warn('Firestore admin note note:', e);
    }
  };

  // Admin delete complaint with Firestore sync
  const handleDeleteComplaint = async (id: string) => {
    removeMyComplaintId(id);
    setComplaints((prev) => prev.filter((c) => c.id !== id));
    showToast('Şikayet silindi.');

    try {
      await deleteComplaintFromFirestore(id);
    } catch (e) {
      console.warn('Firestore admin delete note:', e);
    }
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedStatus !== 'all' || sortBy !== 'top';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('top');
  };

  const myComplaintsCount = complaints.filter((c) => c.isMine).length;

  // Filtered & Sorted complaints for student views
  const filteredComplaints = complaints
    .filter((c) => {
      if (activeView === 'resolved') {
        if (c.status !== 'Çözüldü') return false;
      }

      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || c.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'all' || c.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'top') {
        return b.upvotes - a.upvotes;
      }
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900/95 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        onOpenTerminal={() => setIsTerminalOpen(true)}
        onOpenNewComplaintModal={() => setIsNewComplaintModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
        activeView={activeView}
        setActiveView={setActiveView}
        complaintCount={complaints.length}
        myComplaintCount={myComplaintsCount}
      />

      {/* Main Container with TV, PC, Tablet, Phone Optimizations */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {activeView === 'admin' ? (
          <AdminPanel
            complaints={complaints}
            onUpdateStatus={handleUpdateStatus}
            onUpdateAdminNote={handleUpdateAdminNote}
            onDeleteComplaint={handleDeleteComplaint}
            onBackToFeed={() => setActiveView('feed')}
            onOpenNewComplaintModal={() => setIsNewComplaintModalOpen(true)}
            onOpenLightbox={(url, title) => setLightboxImage({ url, title })}
          />
        ) : activeView === 'my-complaints' ? (
          <MyComplaintsView
            complaints={complaints}
            onUpvote={handleUpvote}
            onAddComment={handleAddComment}
            onOpenLightbox={(url, title) => setLightboxImage({ url, title })}
            onEditComplaint={(complaint) => setEditingComplaint(complaint)}
            onDeleteMyComplaint={handleDeleteMyComplaint}
            onOpenNewComplaintModal={() => setIsNewComplaintModalOpen(true)}
          />
        ) : (
          <div className="space-y-6">
            {/* Hero / Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800/80">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300 mb-3">
                  <HeartHandshake className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Şeffaf & Katılımcı Okul Yönetimi</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Okulumuz İçin Fikrin, Sorunun veya Talebin mi Var?
                </h1>
                <p className="mt-2.5 text-xs sm:text-base text-slate-300 leading-relaxed">
                  "Şikayetimiz Var" ile okul ortamındaki eksiklikleri (Kütüphane, Spor Tesisleri, Yemekhane, Kantin, Derslikler vb.) isimli ya da tamamen anonim olarak paylaşabilir; arkadaşlarınızın taleplerine oy vererek destek olabilirsiniz.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsNewComplaintModalOpen(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Hemen Şikayet / Talep Bildir</span>
                  </button>

                  <button
                    onClick={() => setActiveView('my-complaints')}
                    className="px-4 py-2.5 bg-violet-900/80 hover:bg-violet-800 text-violet-100 font-medium text-xs sm:text-sm rounded-xl border border-violet-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-violet-300" />
                    <span>Şikayetlerim ({myComplaintsCount})</span>
                  </button>

                  <button
                    onClick={() => setActiveView('resolved')}
                    className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs sm:text-sm rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Çözülen Talepler</span>
                  </button>
                </div>
              </div>

              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
            </div>

            {/* Statistics Banner */}
            <StatsBanner complaints={complaints} />

            {/* Feed Filter & Search Controls */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Şikayet başlığı, detay veya kategori ara..."
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 placeholder-slate-400"
                  />
                </div>

                {/* Filters & Sorting */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                    >
                      <option value="all">Tüm Kategoriler</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  {activeView !== 'resolved' && (
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                    >
                      <option value="all">Tüm Durumlar</option>
                      <option value="İnceleniyor">⏳ İnceleniyor</option>
                      <option value="Çözüm Aşamasında">🔧 Çözüm Aşamasında</option>
                      <option value="Çözüldü">✅ Çözüldü</option>
                      <option value="Reddedildi">❌ Reddedildi</option>
                    </select>
                  )}

                  {/* Sort Selection (Popularity & Date) */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'top' | 'newest' | 'oldest')}
                      className="bg-transparent outline-none cursor-pointer"
                    >
                      <option value="top">En Çok Oy Alan (Popüler)</option>
                      <option value="newest">Yeniden Eskiye (En Yeni)</option>
                      <option value="oldest">Eskiden Yeniye (En Eski)</option>
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="p-2 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      title="Filtreleri Sıfırla"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sıfırla</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Complaints Feed Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-bold text-slate-900">
                  {activeView === 'resolved' ? 'Çözüme Kavuşturulan Talepler' : 'Şikayet ve Talepler'}
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {filteredComplaints.length} kayıt
                </span>
              </div>

              {filteredComplaints.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-10 sm:p-14 text-center space-y-4 shadow-xs">
                  <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto">
                    <MessageSquarePlus className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {complaints.length === 0
                        ? 'Henüz bildirilmiş bir şikayet veya talep bulunmuyor.'
                        : 'Kriterlerinize uygun bildirim bulunamadı.'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                      {complaints.length === 0
                        ? 'Okul ortamındaki sorunları, kütüphane, spor salonu, kantin veya derslik ihtiyaçlarını ilk siz bildirin.'
                        : 'Filtrelerinizi temizleyerek tüm şikayetleri görüntüleyebilirsiniz.'}
                    </p>
                  </div>
                  <div>
                    {complaints.length === 0 ? (
                      <button
                        onClick={() => setIsNewComplaintModalOpen(true)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>İlk Şikayeti / Öneriyi Bildir</span>
                      </button>
                    ) : (
                      <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Filtreleri Sıfırla
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredComplaints.map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onUpvote={handleUpvote}
                      onAddComment={handleAddComment}
                      onOpenLightbox={(url, title) => setLightboxImage({ url, title })}
                      isAdminLoggedIn={isAdminLoggedIn}
                      onUpdateStatus={handleUpdateStatus}
                      onUpdateAdminNote={handleUpdateAdminNote}
                      onDeleteComplaint={handleDeleteComplaint}
                      onEditComplaint={(item) => setEditingComplaint(item)}
                      onDeleteMyComplaint={handleDeleteMyComplaint}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Şikayetimiz Var</span>
            <span>&bull;</span>
            <span>Okul Geri Bildirim ve Çözüm Sistemi</span>
          </div>
          
          <div className="text-slate-400 text-[11px] flex flex-wrap items-center justify-center gap-2">
            <span className="flex items-center gap-1 text-emerald-600">
              <Cloud className="w-3.5 h-3.5" />
              <span>Firebase Canlı</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-indigo-600">
              <Mail className="w-3.5 h-3.5" />
              <span>E-posta Bildirimleri Aktif</span>
            </span>
            <span>&bull;</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SecretTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onAdminLoginSuccess={handleAdminLoginSuccess}
      />

      <ComplaintFormModal
        isOpen={isNewComplaintModalOpen}
        onClose={() => setIsNewComplaintModalOpen(false)}
        onSubmit={handleCreateComplaint}
      />

      <EditComplaintModal
        isOpen={!!editingComplaint}
        complaint={editingComplaint}
        onClose={() => setEditingComplaint(null)}
        onSave={handleSaveEditedComplaint}
      />

      <PhotoLightbox
        imageUrl={lightboxImage ? lightboxImage.url : null}
        title={lightboxImage ? lightboxImage.title : ''}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
