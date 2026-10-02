import React from 'react';
import { 
  ShieldCheck, 
  Plus, 
  LogOut, 
  MessageSquareWarning, 
  BarChart3, 
  CheckCircle2, 
  UserCheck, 
  LayoutGrid
} from 'lucide-react';

interface NavbarProps {
  onOpenTerminal: () => void;
  onOpenNewComplaintModal: () => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
  activeView: 'feed' | 'my-complaints' | 'resolved' | 'stats' | 'admin';
  setActiveView: (view: 'feed' | 'my-complaints' | 'resolved' | 'stats' | 'admin') => void;
  complaintCount: number;
  myComplaintCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTerminal,
  onOpenNewComplaintModal,
  isAdminLoggedIn,
  onAdminLogout,
  activeView,
  setActiveView,
  complaintCount,
  myComplaintCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Zone 1: Brand Title (Double-click secretly triggers terminal) */}
          <div className="flex items-center gap-3">
            <div
              onDoubleClick={onOpenTerminal}
              className="flex items-center gap-2.5 py-1 px-1 sm:px-2 rounded-xl cursor-pointer select-none"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
                <MessageSquareWarning className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 font-sans leading-tight">
                  Şikayetimiz Var
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:inline-block">
                  Okul Şikayet ve Talep Portalı
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 text-xs lg:text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('feed')}
              className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'feed'
                  ? 'bg-slate-100 text-indigo-700 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Şikayet Akışı</span>
              <span className="text-xs bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-md font-mono">
                {complaintCount}
              </span>
            </button>

            {/* "Şikayetlerim" Tab */}
            <button
              onClick={() => setActiveView('my-complaints')}
              className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'my-complaints'
                  ? 'bg-violet-50 text-violet-700 font-bold border border-violet-200/80'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-violet-600" />
              <span>Şikayetlerim</span>
              {myComplaintCount > 0 && (
                <span className="text-xs bg-violet-200/80 text-violet-800 px-1.5 py-0.2 rounded-md font-mono font-bold">
                  {myComplaintCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('resolved')}
              className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'resolved'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Çözülen Talepler</span>
            </button>

            <button
              onClick={() => setActiveView('stats')}
              className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'stats'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>İstatistikler</span>
            </button>

            {isAdminLoggedIn && (
              <button
                onClick={() => setActiveView('admin')}
                className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-indigo-200 cursor-pointer ${
                  activeView === 'admin'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Yönetici Masası</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={onAdminLogout}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Yönetici oturumunu kapat"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            )}

            <button
              onClick={onOpenNewComplaintModal}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Şikayet Ekle</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Scrollbar (Phone & Small screens) */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-2.5 pt-1 no-scrollbar border-t border-slate-100">
          <button
            onClick={() => setActiveView('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'feed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Şikayet Akışı ({complaintCount})
          </button>

          <button
            onClick={() => setActiveView('my-complaints')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
              activeView === 'my-complaints'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-violet-50 text-violet-800 border border-violet-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Şikayetlerim ({myComplaintCount})</span>
          </button>

          <button
            onClick={() => setActiveView('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
              activeView === 'resolved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Çözülenler</span>
          </button>

          <button
            onClick={() => setActiveView('stats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
              activeView === 'stats'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>İstatistik</span>
          </button>

          {isAdminLoggedIn && (
            <button
              onClick={() => setActiveView('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
                activeView === 'admin'
                  ? 'bg-indigo-900 text-white'
                  : 'bg-indigo-50 text-indigo-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Yönetici</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
