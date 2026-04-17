import React from 'react';
import { MapPin, X } from 'lucide-react';

export function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[var(--bg-color)] p-8 text-center space-y-8 animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-[var(--accent-primary)]/10 rounded-[2.5rem] flex items-center justify-center animate-pulse shadow-inner">
        <MapPin size={48} className="text-[var(--accent-primary)]" />
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter italic uppercase">Synchronizing</h1>
        <p className="text-[var(--text-dim)] text-sm max-w-xs font-medium opacity-60">Triangulating satellite coordinates for high-precision astrophysical calculations...</p>
      </div>
    </div>
  );
}

export function DeniedView({ onMecca }: { onMecca: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[var(--bg-color)] p-8 text-center space-y-10 animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center shadow-inner">
        <X size={48} className="text-red-500" />
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter italic uppercase">Signal Lost</h1>
        <p className="text-[var(--text-dim)] text-sm max-w-xs font-medium opacity-60">Location access is required for exact prayer timings. Please provide a manual coordinate set.</p>
      </div>
      <button 
        onClick={onMecca}
        className="bg-[var(--accent-primary)] text-[var(--bg-color)] px-10 py-4 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 shadow-2xl hover:brightness-110"
      >
        Origin Point (Mecca)
      </button>
    </div>
  );
}
