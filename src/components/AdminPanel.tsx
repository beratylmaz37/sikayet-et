import React, { useState } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../types';
import { 
  ShieldCheck, 
  Trash2, 
  Search, 
  Filter, 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Plus
} from 'lucide-react';
import { CATEGORIES } from './ComplaintFormModal';

interface AdminPanelProps {
  complaints: Complaint[];
  onUpdateStatus: (id: string, newStatus: ComplaintStatus) => void;
  onUpdateAdminNote: (id: string, note: string) => void;
  onDeleteComplaint: (id: string) => void;
  onBackToFeed: () => void;
  onOpenNewComplaintModal: () => void;
  onOpenLightbox: (imageUrl: string, title: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  complaints,
  onUpdateStatus,
  onUpdateAdminNote,
  onDeleteComplaint,
  onBackToFeed,
  onOpenNewComplaintModal,
  onOpenLightbox,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Delete confirmation modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered complaints
  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate stats
  const totalCount = complaints.length;
  const inReviewCount = complaints.filter((c) => c.status === 'İnceleniyor').length;
  const inProgressCount = complaints.filter((c) => c.status === 'Çözüm Aşamasında').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Çözüldü').length;
  const rejectedCount = complaints.filter((c) => c.status === 'Reddedildi').length;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(complaints, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sikayetimiz_var_rapor_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleStartEditingNote = (c: Complaint) => {
    setEditingNoteId(c.id);
    setTempNoteText(c.adminNote || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateAdminNote(id, tempNoteText.trim());
    setEditingNoteId(null);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      onDeleteComplaint(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-2 tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Okul Yönetim Konsolu &bull; Yetkili Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Şikayet & Talep Yönetim Masası
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Öğrencilerden gelen tüm bildirimleri inceleyin, durumlarını güncelleyin ve resmi idare yanıtları yayınlayın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onBackToFeed}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Öğrenci Akışına Dön</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>JSON Rapor İndir</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Counter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-medium">Toplam Bildirim</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5 tabular-nums">
              {totalCount}
            </div>
          </div>

          <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-900/40">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-medium">
              <span>İnceleniyor</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-200 mt-0.5 tabular-nums">
              {inReviewCount}
            </div>
          </div>

          <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-900/40">
            <div className="flex items-center justify-between text-[11px] text-indigo-300 font-medium">
              <span>Çözüm Aşamasında</span>
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-200 mt-0.5 tabular-nums">
              {inProgressCount}
            </div>
          </div>

          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-900/40">
            <div className="flex items-center justify-between text-[11px] text-emerald-300 font-medium">
              <span>Çözüldü</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-200 mt-0.5 tabular-nums">
              {resolvedCount}
            </div>
          </div>

          <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-900/40 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[11px] text-rose-300 font-medium">
              <span>Reddedildi</span>
              <XCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-200 mt-0.5 tabular-nums">
              {rejectedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Başlık, açıklama veya kişi ara..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Tüm Durumlar ({complaints.length})</option>
              <option value="İnceleniyor">İnceleniyor ({inReviewCount})</option>
              <option value="Çözüm Aşamasında">Çözüm Aşamasında ({inProgressCount})</option>
              <option value="Çözüldü">Çözüldü ({resolvedCount})</option>
              <option value="Reddedildi">Reddedildi ({rejectedCount})</option>
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Tüm Kategoriler</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints Table / Management List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-semibold">Görüntülenecek bildirim bulunamadı.</p>
            <p className="text-xs text-slate-400">Öğrencilerden yeni bir şikayet geldiğinde burada listelenecektir.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Şikayet & Açıklama</th>
                  <th className="py-3.5 px-3">Kategori & Tarih</th>
                  <th className="py-3.5 px-3">Bildiren</th>
                  <th className="py-3.5 px-3">Durum Yönetimi</th>
                  <th className="py-3.5 px-3">Resmi Yanıt (İdare)</th>
                  <th className="py-3.5 px-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Title & Description */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                      <div className="font-bold text-slate-900 mb-1 leading-snug">
                        {item.title}
                      </div>
                      <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      {item.imageUrl && (
                        <button
                          onClick={() => onOpenLightbox(item.imageUrl!, item.title)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Fotoğraf Eki</span>
                        </button>
                      )}
                    </td>

                    {/* Category & Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{item.category}</div>
                      <div className="text-[11px] text-slate-400">{item.date}</div>
                      <div className="text-[10px] text-indigo-600 mt-0.5">
                        {item.upvotes} Destek &bull; {item.comments.length} Yorum
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {item.isAnonymous ? (
                        <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                          Anonim
                        </span>
                      ) : (
                        <span className="font-medium text-slate-800">{item.author}</span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateStatus(item.id, e.target.value as ComplaintStatus)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                          item.status === 'İnceleniyor'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : item.status === 'Çözüm Aşamasında'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : item.status === 'Çözüldü'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="İnceleniyor">⏳ İnceleniyor</option>
                        <option value="Çözüm Aşamasında">🔧 Çözüm Aşamasında</option>
                        <option value="Çözüldü">✅ Çözüldü</option>
                        <option value="Reddedildi">❌ Reddedildi</option>
                      </select>
                    </td>

                    {/* Admin Response Note */}
                    <td className="py-3.5 px-3 max-w-xs">
                      {editingNoteId === item.id ? (
                        <div className="space-y-1.5">
                          <textarea
                            value={tempNoteText}
                            onChange={(e) => setTempNoteText(e.target.value)}
                            placeholder="Okul idaresi resmi yanıtını giriniz..."
                            className="w-full p-1.5 text-xs bg-white border border-indigo-400 rounded-md outline-none"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-800"
                            >
                              İptal
                            </button>
                            <button
                              onClick={() => handleSaveNote(item.id)}
                              className="px-2.5 py-0.5 text-[10px] bg-indigo-600 text-white rounded font-medium"
                            >
                              Kaydet
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {item.adminNote ? (
                            <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded border border-emerald-200">
                              <p className="line-clamp-2">{item.adminNote}</p>
                              <button
                                onClick={() => handleStartEditingNote(item)}
                                className="text-[10px] text-indigo-600 hover:underline mt-1 block font-medium"
                              >
                                Düzenle
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditingNote(item)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded border border-dashed border-indigo-300 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Yanıt Ekle</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setDeletingId(item.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Şikayeti sil"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Sil</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Şikayeti Silmek İstiyor musunuz?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bu bildirim ve ilişkili tüm oylar ve yorumlar kalıcı olarak silinecektir.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
