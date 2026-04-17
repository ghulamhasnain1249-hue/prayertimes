import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Printer, FileDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, setMonth, setYear } from 'date-fns';
import { cn, formatTime } from '../../lib/utils';
import { calculatePrayerTimes, type LocationParams } from '../../lib/prayer/engine';

interface MonthlyTabProps {
  locationParams: LocationParams;
  locationName: string;
  onClose: () => void;
  juristicMethod: 'hanafi' | 'shaafi';
}

export function MonthlyTab({ locationParams, locationName, onClose, juristicMethod }: MonthlyTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthData = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const asrFactor = juristicMethod === 'hanafi' ? 2 : 1;
      const ishaAngle = juristicMethod === 'hanafi' ? 18 : 12;
      const times = calculatePrayerTimes(day, locationParams, asrFactor, ishaAngle);
      return {
        date: day,
        times
      };
    });
  }, [currentDate, locationParams, juristicMethod]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      return next;
    });
  };

  return (
    <div className="panel-card p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative max-h-[90vh] overflow-hidden flex flex-col">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-[var(--text-dim)]"
      >
        <X size={20} />
      </button>

      {/* Header logic */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-[var(--accent-primary)] mb-1">
            <Calendar size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Chronological Atlas</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-[var(--text-main)] uppercase italic">
            Monthly Ephemeris
          </h3>
          <p className="text-[var(--text-dim)] text-[10px] md:text-xs font-medium opacity-60 uppercase tracking-widest">
            {locationName.split(',')[0]} • {format(currentDate, 'MMMM yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-dim)]"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 flex items-center justify-center min-w-[140px]">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">
                {format(currentDate, 'MMM yyyy')}
              </span>
            </div>
            <button 
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-dim)]"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto rounded-2xl border border-white/5 bg-black/20 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--bg-color)]/80 backdrop-blur-md border-b border-white/10">
              <th className="p-4 text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] opacity-40 sticky left-0 bg-[var(--bg-color)]/80 z-20">Date</th>
              <th className="p-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-primary)]">Fajr</th>
              <th className="p-4 text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]/60">Sunrise</th>
              <th className="p-4 text-[9px] font-black uppercase tracking-widest text-orange-400">Dhahwa</th>
              <th className="p-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-primary)]">Zuhr</th>
              <th className="p-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-primary)]">Asr</th>
              <th className="p-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-primary)]">Maghrib</th>
              <th className="p-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-primary)]">Isha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {monthData.map((day, idx) => {
              const itemDate = day.date;
              const isToday = format(itemDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              const t = day.times;

              return (
                <tr 
                  key={idx} 
                  className={cn(
                    "group hover:bg-white/[0.02] transition-colors",
                    isToday && "bg-[var(--accent-primary)]/5"
                  )}
                >
                  <td className={cn(
                    "p-4 sticky left-0 z-10",
                    isToday ? "bg-[var(--accent-primary)]/10 backdrop-blur-sm" : "bg-[var(--bg-color)]/80 backdrop-blur-sm"
                  )}>
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-xs font-black tracking-tighter uppercase italic",
                        isToday ? "text-[var(--accent-primary)]" : "text-[var(--text-main)]"
                      )}>
                        {format(itemDate, 'dd MMM')}
                      </span>
                      <span className="text-[8px] font-bold text-[var(--text-dim)]/40 uppercase tracking-widest">
                        {format(itemDate, 'EEEE')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs font-bold tabular-nums text-[var(--text-main)]/80 group-hover:text-[var(--text-main)] transition-colors">
                    {formatTime(t.fajr)}
                  </td>
                  <td className="p-4 font-mono text-[10px] font-medium tabular-nums text-[var(--text-dim)]/40 italic">
                    {formatTime(t.sunrise)}
                  </td>
                  <td className="p-4 font-mono text-[10px] font-black tabular-nums text-orange-400/60">
                    {formatTime(t.dhahwa)}
                  </td>
                  <td className="p-4 font-mono text-xs font-bold tabular-nums text-[var(--text-main)]/80 group-hover:text-[var(--text-main)] transition-colors">
                    {formatTime(t.zuhr)}
                  </td>
                  <td className="p-4 font-mono text-xs font-bold tabular-nums text-[var(--text-main)]/80 group-hover:text-[var(--text-main)] transition-colors">
                    {formatTime(t.asr)}
                  </td>
                  <td className="p-4 font-mono text-xs font-bold tabular-nums text-[var(--text-main)]/80 group-hover:text-[var(--text-main)] transition-colors">
                    {formatTime(t.maghrib)}
                  </td>
                  <td className="p-4 font-mono text-xs font-bold tabular-nums text-[var(--text-main)]/80 group-hover:text-[var(--text-main)] transition-colors">
                    {formatTime(t.isha)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 px-2 opacity-40">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">
          Precision Atlas Generated by Stellar Logic Engine
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition-colors">
            <Printer size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Print Grid</span>
          </button>
          <button className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition-colors">
            <FileDown size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Export Dataset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
