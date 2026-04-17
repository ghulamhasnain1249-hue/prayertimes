import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a decimal hour into a string HH:MM:SS AM/PM
 */
export function formatTime(decimalHours: number): string {
    if (isNaN(decimalHours)) return "--:--:--";
    
    let h = Math.floor(decimalHours) % 24;
    let m = Math.floor((decimalHours * 60) % 60);
    let s = Math.floor((decimalHours * 3600) % 60);
    
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    
    return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} ${ampm}`;
}
