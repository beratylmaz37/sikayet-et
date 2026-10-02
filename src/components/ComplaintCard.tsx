import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { 
  ThumbsUp, 
  MessageSquare, 
  Calendar, 
  User, 
  UserX, 
  ExternalLink, 
  ShieldCheck, 
  Trash2, 
  Send, 
  ChevronDown, 
  ChevronUp,
  Tag,
  FileCheck,
  Edit3,
  UserCheck
} from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  onUpvote: (id: string) => void;
  onAddComment: (complaintId: string, text: string, author: string, isAnonymous: boolean) => void;
  onOpenLightbox: (imageUrl: string, title: string) => void;
  isAdminLoggedIn: boolean;
  onUpdateStatus?: (id: string, newStatus: ComplaintStatus) => void;
  onUpdateAdminNote?: (id: string, note: string) => void;
  onDeleteComplaint?: (id: string) => void;
  onEditComplaint?: (complaint: Complaint) => void;
  onDeleteMyComplaint?: (id: string) => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onUpvote,
  onAddComment,
  onOpenLightbox,
  isAdminLoggedIn,
  onUpdateStatus,
  onUpdateAdminNote,
  onDeleteComplaint,
  onEditComplaint,
  onDeleteMyComplaint,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentIsAnonymous, setCommentIsAnonymous] = useState(false);
  
  const [isEditingAdminNote, setIsEditingAdminNote] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState(complaint.adminNote || '');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const finalAuthor = commentIsAnonymous ? 'Anonim Öğrenci' : (commentAuthor.trim() || 'Öğrenci');
    onAddComment(complaint.id, commentText.trim(), finalAuthor, commentIsAnonymous);
    setCommentText('');
  };

  const handleSaveAdminNote = () => {
    if (onUpdateAdminNote) {
      onUpdateAdminNote(complaint.id, adminNoteInput.trim());
      setIsEditingAdminNote(false);
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
      {/* Card Header & Metadata */}
      <div className="p-5 pb-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md font-semibold">
              <Tag className="w-3 h-3 text-indigo-500" />
              {complaint.category}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3" />
              {complaint.date}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-slate-600">
              {complaint.isAnonymous ? (
                <>
                  <UserX className="w-3 h-3 text-amber-600" />
                  <span>Anonim</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-slate-500" />
                  <span>{complaint.author}</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {complaint.isMine && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-md">
                <UserCheck className="w-3 h-3 text-violet-600" />
                <span className="hidden sm:inline">Senin</span>
              </span>
            )}
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight mb-2">
          {complaint.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-4 mb-3 flex-1">
          {complaint.description}
        </p>

        {/* Image Attachment (if present) */}
        {complaint.imageUrl && (
          <div className="mb-3">
            <div 
              onClick={() => onOpenLightbox(complaint.imageUrl!, complaint.title)}
              className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-52 cursor-pointer"
            >
              <img
                src={complaint.imageUrl}
                alt={complaint.title}
                referrerPolicy="no-referrer"
                className="w-full h-44 sm:h-48 object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-900/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]">
                <ExternalLink className="w-4 h-4" />
                <span>Fotoğrafı Büyüt</span>
              </div>
            </div>
          </div>
        )}

        {/* Official Admin Note Box */}
        {complaint.adminNote && (
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Okul İdaresi Yanıtı</span>
              {complaint.adminUpdatedAt && (
                <span className="text-[10px] font-normal text-emerald-600 ml-auto">
                  {complaint.adminUpdatedAt}
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              {complaint.adminNote}
            </p>
          </div>
        )}

        {/* Author Control Bar (If user owns this complaint) */}
        {complaint.isMine && (
          <div className="flex items-center justify-between p-2.5 bg-violet-50/70 border border-violet-200/80 rounded-xl mb-3 text-xs">
            <span className="text-[11px] font-semibold text-violet-800 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-violet-600" />
              <span>Bildiriminiz</span>
            </span>

            <div className="flex items-center gap-2">
              {onEditComplaint && (
                <button
                  onClick={() => onEditComplaint(complaint)}
                  className="px-2.5 py-1 text-xs font-semibold text-violet-700 hover:text-violet-900 bg-white hover:bg-violet-100 border border-violet-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Düzenle</span>
                </button>
              )}

              {onDeleteMyComplaint && (
                <button
                  onClick={() => onDeleteMyComplaint(complaint.id)}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Sil</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Admin Quick Control Bar (Visible when Admin is logged in) */}
        {isAdminLoggedIn && (
          <div className="p-3 bg-slate-900 text-slate-100 rounded-xl mb-3 space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="font-semibold text-indigo-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Yönetici Masası:
              </span>

              {onUpdateStatus && (
                <div className="flex items-center gap-1.5">
                  <select
                    value={complaint.status}
                    onChange={(e) => onUpdateStatus(complaint.id, e.target.value as ComplaintStatus)}
                    className="bg-slate-800 text-white text-xs px-2 py-1 rounded-md border border-slate-700 outline-none"
                  >
                    <option value="İnceleniyor">İnceleniyor</option>
                    <option value="Çözüm Aşamasında">Çözüm Aşamasında</option>
                    <option value="Çözüldü">Çözüldü</option>
                    <option value="Reddedildi">Reddedildi</option>
                  </select>
                </div>
              )}
            </div>

            {isEditingAdminNote ? (
              <div className="space-y-1.5 pt-1">
                <textarea
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Okul idaresi resmi açıklamasını yazınız..."
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-slate-100 text-xs focus:ring-1 focus:ring-indigo-400 outline-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingAdminNote(false)}
                    className="px-2 py-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSaveAdminNote}
                    className="px-3 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setIsEditingAdminNote(true)}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] underline underline-offset-2 flex items-center gap-1"
                >
                  <FileCheck className="w-3 h-3" />
                  {complaint.adminNote ? 'Yanıtı Düzenle' : '+ İdare Yanıtı Ekle'}
                </button>

                {onDeleteComplaint && (
                  <button
                    onClick={() => onDeleteComplaint(complaint.id)}
                    className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1 hover:bg-rose-950/40 px-2 py-0.5 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Sil
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Upvote & Comments toggle */}
      <div className="mt-auto px-5 py-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => onUpvote(complaint.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            complaint.upvotedByMe
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200'
          }`}
          title={complaint.upvotedByMe ? 'Desteği geri al' : 'Bu şikayeti destekle (Oy Ver)'}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${complaint.upvotedByMe ? 'fill-current' : ''}`} />
          <span>Destekle</span>
          <span className="font-mono tabular-nums bg-black/10 px-1.5 py-0.2 rounded text-[11px] ml-0.5">
            {complaint.upvotes}
          </span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors py-1.5 px-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>Yorumlar ({complaint.comments.length})</span>
          {showComments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Comments Section */}
      {showComments && (
        <div className="p-4 bg-slate-100/70 border-t border-slate-200/80 space-y-3 animate-in fade-in duration-150">
          <div className="space-y-2">
            {complaint.comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-2">
                Henüz yorum yapılmamış. İlk yorumu siz yapın!
              </p>
            ) : (
              complaint.comments.map((comment) => (
                <div key={comment.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      {comment.isAnonymous ? (
                        <>
                          <UserX className="w-3 h-3 text-amber-600" />
                          <span>Anonim</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{comment.author}</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                  </div>
                  <p className="text-slate-700 leading-normal">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleCommentSubmit} className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Fikrinizi veya ek bilginizi yazınız..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                required
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span className="hidden sm:inline">Gönder</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={commentIsAnonymous}
                  onChange={(e) => setCommentIsAnonymous(e.target.checked)}
                  className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300"
                />
                <span>Anonim Yorum</span>
              </label>

              {!commentIsAnonymous && (
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="İsminiz (opsiyonel)"
                  className="px-2 py-0.5 text-[11px] bg-white border border-slate-300 rounded text-slate-700 w-32 focus:outline-none"
                />
              )}
            </div>
          </form>
        </div>
      )}
    </article>
  );
};
