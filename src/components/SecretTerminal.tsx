import React, { useState, useEffect, useRef } from 'react';
import { TerminalLog } from '../types';
import { verifyAdminPassword } from '../utils/crypto';
import { Terminal as TerminalIcon, X, Shield, CornerDownLeft, Lock } from 'lucide-react';

interface SecretTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: () => void;
}

export const SecretTerminal: React.FC<SecretTerminalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
}) => {
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      type: 'system',
      text: '==================================================',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-2',
      type: 'system',
      text: ' [ŞİKAYETİMİZ VAR] GİZLİ YÖNETİM TERMİNALİ v2.4',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-3',
      type: 'system',
      text: ' SHA-256 Kriptografik Yetkilendirme Konsolu',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-4',
      type: 'output',
      text: 'Komut listesi için "/help" yazınız. Çıkış için "/exit".',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-5',
      type: 'system',
      text: '==================================================',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Focus input on open or mode switch
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }, [isOpen, isPasswordMode]);

  // Auto-scroll to bottom on new log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPasswordMode]);

  if (!isOpen) return null;

  const appendLog = (type: TerminalLog['type'], text: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type,
        text,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const executeSuccessfulLogin = () => {
    appendLog('success', '✓ [BAŞARILI] Yönetici kimliği doğrulandı!');
    appendLog('success', '✓ Yönetici Paneline aktarılıyor...');
    setIsPasswordMode(false);
    setInputVal('');

    setTimeout(() => {
      onAdminLoginSuccess();
      onClose();
    }, 650);
  };

  const handleCommand = async (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed && !isPasswordMode) return;

    if (isPasswordMode) {
      // User submitted admin password in password prompt
      const enteredPassword = rawInput.trim();
      appendLog('input', `•••••••• (${enteredPassword.length} karakter)`);
      setIsProcessing(true);
      setInputVal('');

      try {
        const isMatch = await verifyAdminPassword(enteredPassword);

        if (isMatch) {
          executeSuccessfulLogin();
        } else {
          appendLog('error', '✗ [HATA] Hatalı Şifre!');
          appendLog('output', 'Tekrar denemek için "/admin" yazınız.');
          setIsPasswordMode(false);
        }
      } catch (err) {
        console.error('Terminal verification error:', err);
        appendLog('error', '✗ [HATA] Doğrulama hatası oluştu.');
        setIsPasswordMode(false);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Normal command mode
    appendLog('input', `$ ${trimmed}`);
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInputVal('');

    const lower = trimmed.toLowerCase();

    // Support combined "/admin <password>" command
    if (lower.startsWith('/admin ') || lower.startsWith('admin ')) {
      const candidatePass = trimmed.replace(/^\/?admin\s+/i, '');
      setIsProcessing(true);
      const isMatch = await verifyAdminPassword(candidatePass);
      setIsProcessing(false);
      if (isMatch) {
        executeSuccessfulLogin();
      } else {
        appendLog('error', '✗ [HATA] Hatalı Şifre!');
      }
      return;
    }

    // If user enters password directly in command line
    if (lower === 'aihl2026') {
      setIsProcessing(true);
      const isMatch = await verifyAdminPassword(trimmed);
      setIsProcessing(false);
      if (isMatch) {
        executeSuccessfulLogin();
        return;
      }
    }

    switch (lower) {
      case '/help':
      case 'help':
        appendLog('output', 'Mevcut Kullanılabilir Komutlar:');
        appendLog('output', '  /admin   - Yönetici yetkilendirmesini başlatır');
        appendLog('output', '  /help    - Bu yardım ekranını listeler');
        appendLog('output', '  /status  - Platform durumunu gösterir');
        appendLog('output', '  /clear   - Terminal ekranını temizler');
        appendLog('output', '  /about   - Platform hakkında bilgi verir');
        appendLog('output', '  /exit    - Terminal konsolunu kapatır');
        break;

      case '/admin':
      case 'admin':
        setIsPasswordMode(true);
        appendLog('prompt', 'Admin Şifresini Giriniz:');
        break;

      case '/exit':
      case 'exit':
      case 'quit':
        appendLog('system', 'Terminal kapatılıyor...');
        setTimeout(() => {
          onClose();
        }, 250);
        break;

      case '/clear':
      case 'clear':
      case 'cls':
        setLogs([]);
        break;

      case '/status':
      case 'status':
        appendLog('output', '● Sistem Durumu: Aktif & Çevrim İçi');
        appendLog('output', '● Şifreleme: WebCrypto SHA-256');
        appendLog('output', '● Yönetici Masası: Koruma Altında');
        break;

      case '/about':
      case 'about':
        appendLog('output', 'Şikayetimiz Var Platformu');
        appendLog('output', 'Okul şikayet ve talep yönetim portalı.');
        break;

      default:
        appendLog('error', `Bilinmeyen komut: "${trimmed}". Komut listesi için "/help" yazınız.`);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isProcessing) {
        handleCommand(inputVal);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && !isPasswordMode) {
        const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.length > 0 && !isPasswordMode) {
        if (historyIndex >= 0 && historyIndex < commandHistory.length - 1) {
          const nextIndex = historyIndex + 1;
          setHistoryIndex(nextIndex);
          setInputVal(commandHistory[nextIndex]);
        } else {
          setHistoryIndex(-1);
          setInputVal('');
        }
      }
    } else if (e.key === 'Escape') {
      if (isPasswordMode) {
        setIsPasswordMode(false);
        appendLog('system', 'Şifre girişi iptal edildi.');
        setInputVal('');
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[500px] font-mono-code text-xs md:text-sm text-slate-200"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal Titlebar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer" onClick={onClose} title="Kapat" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer" onClick={() => setLogs([])} title="Temizle" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer" title="Aktif" />
            <div className="flex items-center gap-1.5 ml-3 text-slate-400 font-sans text-xs font-medium">
              <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>sikayetimiz-var-terminal ~ sha256</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400">
            <button
              onClick={onClose}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Log Viewport */}
        <div 
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto terminal-scroll space-y-1 bg-slate-950/95"
        >
          {logs.map((log) => {
            if (log.type === 'system') {
              return (
                <div key={log.id} className="text-slate-500 leading-relaxed">
                  {log.text}
                </div>
              );
            }
            if (log.type === 'input') {
              return (
                <div key={log.id} className="text-cyan-400 font-semibold flex items-start gap-1">
                  <span className="text-slate-500 select-none">&gt;</span>
                  <span>{log.text}</span>
                </div>
              );
            }
            if (log.type === 'prompt') {
              return (
                <div key={log.id} className="text-amber-300 font-semibold flex items-center gap-2 py-1.5 bg-amber-950/25 px-2.5 rounded border border-amber-800/40 my-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{log.text}</span>
                </div>
              );
            }
            if (log.type === 'error') {
              return (
                <div key={log.id} className="text-rose-400 bg-rose-950/30 px-2.5 py-1.5 rounded border border-rose-900/50 my-1 font-semibold">
                  {log.text}
                </div>
              );
            }
            if (log.type === 'success') {
              return (
                <div key={log.id} className="text-emerald-400 bg-emerald-950/30 px-2.5 py-1.5 rounded border border-emerald-900/50 my-1 font-semibold">
                  {log.text}
                </div>
              );
            }
            return (
              <div key={log.id} className="text-slate-300 leading-relaxed">
                {log.text}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-2 text-amber-400 text-xs animate-pulse">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>İşlem yürütülüyor...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
          {isPasswordMode ? (
            <div className="flex items-center gap-1.5 text-amber-400 font-bold shrink-0">
              <Lock className="w-4 h-4" />
              <span>Admin Şifresi:</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
              <span className="text-slate-400">user@sv-okul:</span>
              <span>~$</span>
            </div>
          )}

          <input
            ref={inputRef}
            type={isPasswordMode ? 'password' : 'text'}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            placeholder={isPasswordMode ? 'Şifrenizi yazıp Enter\'a basınız...' : 'Komut giriniz (/help, /admin, /exit)...'}
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-600 focus:ring-0 font-mono-code text-xs md:text-sm"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />

          <button
            onClick={() => handleCommand(inputVal)}
            disabled={isProcessing}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <span>Gönder</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-1.5 bg-slate-950 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>[Enter] Çalıştır</span>
            <span>[Esc] Kapat / İptal</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 font-sans">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span>SHA-256 Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
