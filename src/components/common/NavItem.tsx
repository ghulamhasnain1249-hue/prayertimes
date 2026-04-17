import React from 'react';
import { cn } from '../../lib/utils';

interface NavItemProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function NavItem({ active, icon, label, onClick }: NavItemProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-300 group text-sm font-bold tracking-tight",
        active 
          ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-[0_4px_20px_rgba(56,189,248,0.1)] scale-[1.02]" 
          : "text-[var(--text-dim)]/50 hover:text-[var(--text-main)] hover:bg-white/[0.03]"
      )}
    >
      <span className={cn(
        "transition-transform duration-300 group-hover:scale-110 shrink-0",
        active ? "text-[var(--accent-primary)]" : "text-[var(--text-dim)]/30"
      )}>
        {icon}
      </span>
      {label}
    </button>
  );
}
