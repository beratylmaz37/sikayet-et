import React, { useState, useEffect, useRef } from 'react';
import { Complaint, ComplaintCategory } from '../types';
import { CATEGORIES } from './ComplaintFormModal';
import { X, Upload, Trash2, User, UserX, AlertCircle, Save, Mail, Bell } from 'lucide-react';

interface EditComplaintModalProps {
  isOpen: boolean;
  complaint: Complaint | null;
  onClose: () => void;
  onSave: (updatedComplaint: Complaint) => void;
}

export const EditComplaintModal: React.FC<EditComplaintModalProps> = ({
  isOpen,
  complaint,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Kütüphane');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (complaint) {
      setTitle(complaint.title);
      setDescription(complaint.description);
      setCategory(complaint.category);
      setIsAnonymous(complaint.isAnonymous);
      setAuthorName(complaint.isAnonymous ? '' : complaint.author);
      setAuthorEmail(complaint.authorEmail || '');
      setNotificationsEnabled(complaint.notificationsEnabled !== false);
      setImagePreview(complaint.imageUrl || null);
      setErrorMsg(null);
    }
  }, [complaint, isOpen]);

  if (!isOpen || !complaint) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Lütfen geçerli bir görsel dosyası seçiniz (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Görsel boyutu maksimum 5MB olmalıdır.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || title.trim().length < 5) {
      setErrorMsg('Şikayet başlığı en az 5 karakter olmalıdır.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg('Lütfen durumu en az 10 karakterle açıklayınız.');
      return;
    }

    if (!isAnonymous && !authorName.trim()) {
      setErrorMsg('Lütfen adınızı giriniz veya "Anonim olarak paylaş" seçeneğini işaretleyiniz.');
      return;
    }

    if (authorEmail.trim() && !authorEmail.includes('@')) {
      setErrorMsg('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    const finalAuthor = isAnonymous ? 'Anonim Öğrenci' : authorName.trim();

    onSave({
      ...complaint,
      title: title.trim(),
      description: description.trim(),
      category,
      isAnonymous,
      author: finalAuthor,
      authorEmail: authorEmail.trim() || undefined,
      notificationsEnabled,
      imageUrl: imagePreview || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Şikayeti / Talebi Düzenle</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Paylaştığınız bildirimin detaylarını güncelleyebilirsiniz.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Şikayet Başlığı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800"
              maxLength={120}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Detaylı Açıklama <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{description.length}/1000</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 resize-none"
              maxLength={1000}
              required
            />
          </div>

          {/* Notification Email */}
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Bell className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bildirim E-posta Adresi</span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="ornek@ogrenci.meb.gov.tr"
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300"
              />
              <span className="text-[11px] text-slate-700">
                Şikayetime gelen oylar ve yorumlar için bana e-posta gönder
              </span>
            </label>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fotoğraf Eki
            </label>

            {imagePreview ? (
              <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-900 group">
                <img
                  src={imagePreview}
                  alt="Önizleme"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Görseli Kaldır</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl p-4 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700">Fotoğraf eklemek için tıklayın</span>
                </div>
              </div>
            )}
          </div>

          {/* Anonymity */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                {isAnonymous ? <UserX className="w-4 h-4 text-amber-600" /> : <User className="w-4 h-4 text-indigo-600" />}
                Anonim Olarak Paylaş
              </span>
            </label>

            {!isAnonymous && (
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Adınız Soyadınız / Sınıfınız"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
