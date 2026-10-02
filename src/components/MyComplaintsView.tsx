import React, { useState } from 'react';
import { Complaint } from '../types';
import { ComplaintCard } from './ComplaintCard';
import { 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  XCircle,
  MessageSquarePlus
} from 'lucide-react';

interface MyComplaintsViewProps {
  complaints: Complaint[];
  onUpvote: (id: string) => void;
  onAddComment: (complaintId: string, text: string, author: string, isAnonymous: boolean) => void;
  onOpenLightbox: (imageUrl: string, title: string) => void;
  onEditComplaint: (complaint: Complaint) => void;
  onDeleteMyComplaint: (id: string) => void;
  onOpenNewComplaintModal: () => void;
}

export const MyComplaintsView: React.FC<MyComplaintsViewProps> = ({
  complaints,
  onUpvote,
  onAddComment,
  onOpenLightbox,
  onEditComplaint,
  onDeleteMyComplaint,
  onOpenNewComplaintModal,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const myComplaints = complaints.filter((c) => c.isMine);

  const total = myComplaints.length;
  const inReview = myComplaints.filter((c) => c.status === 'İnceleniyor').length;
  const inProgress = myComplaints.filter((c) => c.status === 'Çözüm Aşamasında').length;
  const resolved = myComplaints.filter((c) => c.status === 'Çözüldü').length;

  const handleConfirmDelete = () => {
    if (deletingId) {
      onDeleteMyComplaint(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-violet-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 px-3 py-1 rounded-full text-xs font-semibold text-violet-300 mb-2">
              <UserCheck className="w-3.5 h-3.5 text-violet-400" />
              <span>Kişisel Bildirim Yönetimi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Şikayetlerim & Taleplerim
            </h1>
            <p className="text-violet-200 text-xs sm:text-sm mt-1 max-w-2xl">
              Paylaştığınız tüm şikayet ve talepleri buradan takip edebilir, güncelleyebilir veya silebilirsiniz.
            </p>
          </div>

          <button
            onClick={onOpenNewComplaintModal}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Şikayet Bildir</span>
          </button>
        </div>

        {/* Status Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-violet-800/60">
          <div className="p-3 bg-violet-950/40 rounded-xl border border-violet-800/40">
            <span className="text-[11px] text-violet-300 font-medium">Toplam Bildirimim</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5 tabular-nums">
              {total}
            </div>
          </div>

          <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-800/40">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-medium">
              <span>İnceleniyor</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-200 mt-0.5 tabular-nums">
              {inReview}
            </div>
          </div>

          <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-800/40">
            <div className="flex items-center justify-between text-[11px] text-indigo-300 font-medium">
              <span>Çözüm Aşamasında</span>
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-200 mt-0.5 tabular-nums">
              {inProgress}
            </div>
          </div>

          <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/40">
            <div className="flex items-center justify-between text-[11px] text-emerald-300 font-medium">
              <span>Çözüldü</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-200 mt-0.5 tabular-nums">
              {resolved}
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Grid or Empty State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-900">
            Kayıtlı Bildirimleriniz
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {myComplaints.length} adet
          </span>
        </div>

        {myComplaints.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 mx-auto">
              <MessageSquarePlus className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Henüz kendi oluşturduğunuz bir şikayet bulunmuyor
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Okul ortamındaki eksiklikleri, kütüphane, spor tesisleri, yemekhane veya derslik ihtiyaçlarını ilk siz bildirin ve idareden çözüm talep edin.
              </p>
            </div>
            <div>
              <button
                onClick={onOpenNewComplaintModal}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-violet-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Hemen İlk Şikayetinizi Oluşturun</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onUpvote={onUpvote}
                onAddComment={onAddComment}
                onOpenLightbox={onOpenLightbox}
                isAdminLoggedIn={false}
                onEditComplaint={onEditComplaint}
                onDeleteMyComplaint={(id) => setDeletingId(id)}
              />
            ))}
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
              <h3 className="text-base font-bold text-slate-900">Şikayetinizi Silmek İstiyor musunuz?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bu bildirim ve ilişkili tüm oylar/yorumlar kalıcı olarak silinecektir. Bu işlemi onaylıyor musunuz?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Evet, Şikayeti Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
