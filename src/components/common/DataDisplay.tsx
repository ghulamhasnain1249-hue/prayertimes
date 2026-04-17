import React from 'react';

interface DataRowProps {
  label: string;
  value: string;
}

export function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-[var(--text-dim)]/10 hover:bg-white/[0.02] px-2 rounded-lg transition-colors group">
      <span className="text-[var(--text-dim)]/40 group-hover:text-[var(--text-dim)]/60 transition-colors uppercase text-[10px] font-bold tracking-widest">{label}</span>
      <span className="text-[var(--text-main)] font-mono font-bold text-xs tabular-nums">{value}</span>
    </div>
  );
}

interface ManualInputProps {
  label: string;
  value: number;
  onChange: (v: string) => void;
}

export function ManualInput({ label, value, onChange }: ManualInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-[var(--text-dim)]/40 uppercase font-black tracking-[0.25em] ml-1">{label}</label>
      <input 
        type="number" 
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-sm text-[var(--text-main)] font-bold focus:outline-none focus:border-[var(--accent-primary)] transition-all shadow-inner"
      />
    </div>
  );
}
