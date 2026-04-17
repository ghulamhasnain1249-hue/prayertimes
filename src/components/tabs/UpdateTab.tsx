import React from 'react';
import { Download, RefreshCw, X, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface UpdateTabProps {
  isStandalone: boolean;
  deferredPrompt: any;
  onInstall: () => void;
  onUpdate: () => void;
  onClose: () => void;
}

export function UpdateTab({ isStandalone, deferredPrompt, onInstall, onUpdate, onClose }: UpdateTabProps) {
  return (
    <div className="panel-card p-8 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-[var(--text-dim)]"
      >
        <X size={20} />
      </button>

      <div className="space-y-2">
        <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-[var(--text-main)] uppercase italic">System Synchronizer</h3>
        <p className="text-[var(--text-dim)] text-xs md:text-sm font-medium opacity-60">Ensuring zero-drift precision with the latest celestial algorithms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="panel-card p-8 bg-[var(--bg-color)] border-[var(--border-color)]/30 flex flex-col gap-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
            {isStandalone ? <ShieldCheck size={24} /> : <Download size={24} />}
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black text-[var(--text-main)] uppercase italic">Deployment Status</h4>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              {isStandalone 
                ? "The application is currently running as a standalone Progressive Web App with local buffer priority."
                : "Install Al-Waqt to your device for offline precision, ultra-fast boot times, and full-screen immersion."}
            </p>
          </div>
          
          {!isStandalone ? (
            <button 
              onClick={onInstall}
              disabled={!deferredPrompt}
              className={cn(
                "mt-2 w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all transition-all shadow-lg active:scale-95",
                deferredPrompt 
                  ? "bg-[var(--accent-primary)] text-[var(--bg-color)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)]" 
                  : "bg-white/5 text-[var(--text-dim)]/40 cursor-not-allowed"
              )}
            >
              {deferredPrompt ? 'Install Application' : 'Initialization Pending...'}
            </button>
          ) : (
            <div className="mt-2 py-4 px-6 bg-[var(--accent-primary)]/5 rounded-xl border border-[var(--accent-primary)]/20 text-center">
              <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck size={14} /> Installed Successfully
              </span>
            </div>
          )}
          
          {!isStandalone && !deferredPrompt && (
            <p className="text-[9px] text-[var(--text-dim)]/40 italic text-center">
              Note: If button is disabled, please use "Add to Home Screen" from your browser's sharing menu.
            </p>
          )}
        </div>

        <div className="panel-card p-8 bg-[var(--bg-color)] border-[var(--border-color)]/30 flex flex-col gap-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-gold)]/10 flex items-center justify-center text-[var(--accent-gold)]">
            <RefreshCw size={24} />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black text-[var(--text-main)] uppercase italic">Engine Pulse</h4>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              Verify the integrity of local astrophysical constants and synchronize with the primary Al-Waqt relay.
            </p>
          </div>
          <button 
            onClick={onUpdate}
            className="mt-2 w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-[var(--text-main)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
          >
            Check Update
          </button>
          <div className="flex items-center gap-3 text-[9px] font-black text-[var(--text-dim)]/30 uppercase tracking-[0.2em] justify-center mt-2">
             <Zap size={10} className="text-[var(--accent-gold)]" /> System v2.5.4 Optimized
          </div>
        </div>
      </div>
    </div>
  );
}
