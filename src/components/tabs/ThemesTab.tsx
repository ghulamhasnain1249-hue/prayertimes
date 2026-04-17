import React from 'react';
import { Star, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeType } from '../../types';
import { THEMES } from '../../constants';

interface ThemesTabProps {
  currentTheme: ThemeType;
  setTheme: (t: ThemeType) => void;
  onClose?: () => void;
}

export function ThemesTab({ currentTheme, setTheme, onClose }: ThemesTabProps) {
  return (
    <div className="panel-card p-8 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-[var(--text-dim)]"
        >
          <X size={20} />
        </button>
      )}

      <div className="space-y-2">
        <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-[var(--text-main)] uppercase italic">Visual Styles</h3>
        <p className="text-[var(--text-dim)] text-xs md:text-sm font-medium opacity-60">Personalize your astronomical observation deck.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "group relative flex flex-col items-center gap-4 p-5 rounded-[2.5rem] border transition-all duration-500",
              currentTheme === t.id 
                ? "bg-white/10 border-[var(--accent-primary)] shadow-[0_10px_30px_rgba(56,189,248,0.2)] scale-[1.05]" 
                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95"
            )}
          >
            <div 
              className="w-full aspect-square rounded-[2rem] shadow-inner flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: t.bg }}
            >
               {/* Mini Preview Mockup */}
               <div className="absolute inset-4 flex flex-col gap-2.5 opacity-30">
                  <div className="w-1/2 h-4 rounded-xl" style={{ backgroundColor: t.accent }} />
                  <div className="w-full h-2 bg-white/30 rounded-full" />
                  <div className="w-2/3 h-2 bg-white/30 rounded-full" />
               </div>
               
               {currentTheme === t.id && (
                 <div className="absolute inset-0 bg-[var(--accent-primary)]/20 flex items-center justify-center animate-in zoom-in-50 duration-300">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Star size={24} className="text-[var(--accent-primary)] fill-current" />
                    </div>
                 </div>
               )}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
              currentTheme === t.id ? "text-[var(--accent-primary)]" : "text-[var(--text-dim)]/40 group-hover:text-white"
            )}>
              {t.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
