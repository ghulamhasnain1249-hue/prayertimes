import React from 'react';
import { Star } from 'lucide-react';

export function AuthorTab() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 text-center">
      <div className="panel-card p-16 rounded-[4rem] flex flex-col items-center gap-8 relative overflow-hidden">
        {/* Decorative background star */}
        <Star className="absolute -top-10 -right-10 text-[var(--accent-primary)]/5 w-64 h-64 -rotate-12" />
        
        <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-gold)] p-1 shadow-2xl rotate-3">
          <div className="w-full h-full rounded-[2.3rem] bg-[var(--bg-color)] flex items-center justify-center rotate-[-3deg]">
            <Star className="text-[var(--accent-primary)]" size={48} />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-4xl font-black tracking-tighter text-[var(--text-main)] italic font-serif">Aura of Astronomy</h3>
          <p className="text-[var(--accent-primary)] font-black tracking-[0.4em] uppercase text-[11px] opacity-80">Computational Astrophysics Engine</p>
        </div>
        <p className="text-[var(--text-dim)] max-w-lg text-sm font-medium leading-[1.8] opacity-70">
          Engineered for high-precision analytical modeling of celestial bodies using IAU 2006 precession and nutation standards. Optimized for real-time mobile calculation of sub-arcsecond astronomical data.
        </p>
        
        <div className="pt-8 flex gap-4">
           <div className="px-4 py-2 border border-[var(--border-color)] rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">v2.5.4 Stable</div>
           <div className="px-4 py-2 border border-[var(--border-color)] rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">IAU Standard</div>
        </div>
      </div>
    </div>
  );
}
