import React, { useState, useRef } from 'react';
import { Complaint, ComplaintCategory } from '../types';
import { X, Upload, Trash2, User, UserX, AlertCircle, Mail, Bell } from 'lucide-react';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newComplaint: Omit<Complaint, 'id' | 'status' | 'upvotes' | 'comments'>) => void;
}

export const CATEGORIES: ComplaintCategory[] = [
  'Kütüphane',
  'Spor Tesisleri',
  'Yemekhane',
  'Kantin',
  'Temizlik',
  'Tesis & Tamirat',
  'Derslikler',
  'Bilişim & İnternet',
  'Ulaşım & Servis',
  'Diğer',
];

export const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Kütüphane');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState(() => {
    try {
      return localStorage.getItem('sikayetimizvar_saved_email') || '';
    } catch {
      return '';
    }
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

    if (!title.trim()) {
      setErrorMsg('Lütfen şikayet başlığını belirtiniz.');
      return;
    }

    if (title.trim().length < 5) {
      setErrorMsg('Şikayet başlığı en az 5 karakter olmalıdır.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg('Lütfen durumu en az 10 karakterle detaylı açıklayınız.');
      return;
    }

    if (!isAnonymous && !authorName.trim()) {
      setErrorMsg('Lütfen adınızı giriniz veya "Anonim olarak paylaş" seçeneğini işaretleyiniz.');
      return;
    }

    if (authorEmail.trim() && !authorEmail.includes('@')) {
      setErrorMsg('Lütfen geçerli bir e-posta adresi giriniz (örnek: isim@gmail.com).');
      return;
    }

    const finalAuthor = isAnonymous ? 'Anonim Öğrenci' : authorName.trim();
    const finalEmail = authorEmail.trim();

    if (finalEmail) {
      try {
        localStorage.setItem('sikayetimizvar_saved_email', finalEmail);
      } catch (err) {
        console.warn('Could not cache email:', err);
      }
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      date,
      isAnonymous,
      author: finalAuthor,
      authorEmail: finalEmail || undefined,
      notificationsEnabled,
      imageUrl: imagePreview || undefined,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('Kütüphane');
    setDate(new Date().toISOString().split('T')[0]);
    setIsAnonymous(false);
    setAuthorName('');
    setImagePreview(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Yeni Şikayet / Talep Bildir</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Okul ortamını iyileştirmek için şikayet veya önerinizi paylaşın.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Şikayet / Talep Başlığı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Kütüphanede ders çalışma alanlarındaki aydınlatma yetersiz"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 placeholder-slate-400"
              maxLength={120}
              required
            />
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 cursor-pointer font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Olay / Bildirim Tarihi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800"
                required
              />
            </div>
          </div>

          {/* Detailed Description */}
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
              placeholder="Sorunun nerede ve ne zaman yaşandığını, talebinizi detaylı olarak belirtiniz..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 placeholder-slate-400 resize-none"
              maxLength={1000}
              required
            />
          </div>

          {/* Email for Notifications */}
          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800">
                  E-posta Bildirimi (Önerilen)
                </label>
                <p className="text-[11px] text-slate-500">
                  Şikayetinize yeni yorum yapıldığında veya destek oyu verildiğinde haberdar olun.
                </p>
              </div>
            </div>

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="ornek@ogrenci.meb.gov.tr veya email@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 placeholder-slate-400"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-[11px] font-medium text-slate-700">
                Gelişmelerde bana e-posta ile anlık bildirim gönder
              </span>
            </label>
          </div>

          {/* Photo Upload & Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fotoğraf Yükleme (Önizlemeli)
            </label>

            {imagePreview ? (
              <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-900 group">
                <img
                  src={imagePreview}
                  alt="Yüklenen Görsel Önizleme"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Fotoğrafı Kaldır</span>
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
                <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-medium text-slate-700">
                    Fotoğraf seçmek için tıklayın veya sürükleyin
                  </div>
                  <div className="text-[11px] text-slate-400">
                    PNG, JPG veya WebP (Maksimum 5MB)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Anonymity Section */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  {isAnonymous ? <UserX className="w-4 h-4 text-amber-600" /> : <User className="w-4 h-4 text-indigo-600" />}
                  Şikayeti Anonim Olarak Paylaş
                </span>
              </label>
              <span className="text-[11px] text-slate-500">
                {isAnonymous ? 'İsminiz gizlenecek' : 'İsimli paylaşım'}
              </span>
            </div>

            {!isAnonymous ? (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Adınız Soyadınız / Sınıfınız <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Örn: Eren Yılmaz (11-B)"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">
                Şikayetiniz sistemde <strong>"Anonim Öğrenci"</strong> olarak yayınlanacaktır (e-posta adresiniz gizli kalır).
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
            >
              Şikayeti Yayınla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
