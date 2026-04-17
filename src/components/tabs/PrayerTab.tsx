import React from 'react';
import { Moon, Menu, Info, MapPin, Circle, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatTime } from '../../lib/utils';
import { PrayerTimes, LocationParams } from '../../lib/prayer/engine';
import { Tab } from '../../types';

interface PrayerTabProps {
  times: PrayerTimes;
  locationName: string;
  date: Date;
  hijriDate: any;
  locationParams: LocationParams;
  toggleSidebar: () => void;
  setActiveTab: (t: Tab) => void;
}

export function PrayerTab({ 
  times, 
  locationName, 
  date, 
  hijriDate, 
  locationParams,
  toggleSidebar,
  setActiveTab
}: PrayerTabProps) {
  const prayerSequence = [
    { label: 'Fajr', time: times.fajr, icon: <div className="w-1.5 h-1.5 rounded-full bg-current" /> },
    { label: 'Sunrise', time: times.sunrise, icon: null, isStandalone: true },
    { label: 'Zuhr', time: times.zuhr, icon: <div className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center"><div className="w-1 h-1 bg-current rounded-full" /></div> },
    { label: 'Asr', time: times.asr, icon: <div className="w-3 h-3 border-2 border-current rounded-full" /> },
    { label: 'Maghrib', time: times.maghrib, icon: <Circle size={12} className="text-current" /> },
    { label: 'Isha', time: times.isha, icon: <Moon size={14} className="text-current" /> },
  ];

  const displayList = prayerSequence.filter(p => p.label !== 'Sunrise');
  const now = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  
  let currentPrayerIndex = -1;
  const lastIndex = prayerSequence.length - 1;
  
  if (now >= prayerSequence[lastIndex].time || now < prayerSequence[0].time) {
    currentPrayerIndex = lastIndex; // Isha
  } else {
    for (let i = 0; i < lastIndex; i++) {
      if (now >= prayerSequence[i].time && now < prayerSequence[i+1].time) {
        currentPrayerIndex = i;
        break;
      }
    }
  }

  const currentPrayer = prayerSequence[currentPrayerIndex];
  const nextPrayerIndex = (currentPrayerIndex + 1) % prayerSequence.length;
  const nextEvent = prayerSequence[nextPrayerIndex];

  const diff = nextEvent.time - now;
  const totalSeconds = (diff < 0 ? diff + 24 : diff) * 3600;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = ((60 - seconds) / 60) * 100;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col min-h-full relative bg-[var(--bg-color)]">
      {/* Scrollable Hero Section */}
      <section className="relative h-[55vh] min-h-[450px] w-full z-10 shrink-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1920')` }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 h-full flex flex-col p-6 text-white">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={toggleSidebar}
              className="p-3 bg-white/10 rounded-2xl lg:hidden active:scale-90 transition-transform"
            >
              <Menu size={20} />
            </button>
            <div className="flex gap-3">
              <button 
                onClick={() => setActiveTab('themes')}
                className="px-4 py-2 bg-[var(--accent-primary)] text-[var(--bg-color)] rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Themes
              </button>
              <button 
                onClick={() => setActiveTab('author')}
                className="p-2 bg-white/10 rounded-full border border-white/20 active:scale-90 transition-transform"
              >
                <Info size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-12 px-4 pb-10">
            {/* Circular Progress */}
            <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72 shrink-0 transition-all duration-700">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle 
                  className="text-white/5" 
                  strokeWidth="4" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r={radius} 
                  cx="100" 
                  cy="100" 
                />
                <circle
                  className="text-[var(--accent-primary)] transition-all duration-1000"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius} 
                  cx="100" 
                  cy="100" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <span className="text-[#EF4444] text-2xl sm:text-3xl font-black tracking-widest leading-none mb-1 uppercase">
                  {currentPrayer.label}
                </span>
                <span className="text-[10px] sm:text-xs text-white/50 uppercase font-black tracking-[0.4em] mb-4">Time Left</span>
                <span className="text-3xl sm:text-4xl font-mono font-black tabular-nums text-[var(--accent-primary)] drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                   {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Meta Info */}
            <div className="text-center sm:text-right space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-end gap-2 text-base font-bold text-[var(--accent-gold)]">
                  {hijriDate.day} {hijriDate.monthName} {hijriDate.year} <Moon size={18} className="fill-current" />
                </div>
                <div className="text-xs font-semibold text-white/50 tracking-wide uppercase">
                  {format(date, 'EEEE, dd MMMM yyyy')}
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-center sm:justify-end gap-2 text-base font-black">
                  {locationName.split(',')[0]} <MapPin size={18} className="text-[var(--accent-primary)]" />
                </div>
                <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">
                  {locationParams.lat.toFixed(4)}°N • {locationParams.lon.toFixed(4)}°E
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main List */}
      <section className="flex-1 -mt-8 rounded-t-[3rem] bg-[var(--bg-color)] z-20 px-6 pt-12 pb-10 shadow-2xl relative overflow-hidden">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="panel-card bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border-color)] px-8 py-4 space-y-1">
            {displayList.map((p) => (
              <React.Fragment key={p.label}>
                <PrayerRow 
                  label={p.label} 
                  time={p.time} 
                  icon={p.icon}
                  active={p.label === currentPrayer.label}
                  times={times}
                />
              </React.Fragment>
            ))}
          </div>
          <div className="text-center pt-8 opacity-20 text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-dim)]">
             Computational Astrophysics Engine v2.5.4
          </div>
        </div>
      </section>
    </div>
  );
}

function PrayerRow({ 
  label, 
  time, 
  icon, 
  active, 
  times 
}: { 
  label: string, 
  time: number, 
  icon?: React.ReactNode, 
  active?: boolean, 
  times: PrayerTimes 
}) {
  const isFajr = label === 'Fajr';
  const isAsr = label === 'Asr';
  const isIsha = label === 'Isha';

  return (
    <div className={cn(
      "flex justify-between items-center py-5 transition-all duration-500 border-b border-[var(--border-color)]/20 last:border-0",
      active && "bg-[var(--accent-primary)]/5 -mx-8 px-12 border-b-0 rounded-[2rem] transform scale-[1.02] shadow-sm"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
          active ? "bg-[var(--accent-primary)] text-[var(--bg-color)]" : "bg-[var(--bg-color)] text-[var(--text-main)] border border-[var(--border-color)]"
        )}>
          {icon || <Sun size={18} />}
        </div>
        <div className="flex flex-col">
          <span className="text-sm sm:text-lg font-black text-[var(--text-main)] tracking-tighter uppercase">
            {label}
          </span>
          {(isAsr || isIsha) && <span className="text-[var(--text-dim)] font-black text-[7px] uppercase tracking-[0.2em] opacity-40">Hanafi Method</span>}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-1">
        <div className="font-mono text-base font-black tracking-tight text-[var(--text-main)] tabular-nums">
          {formatTime(time)}
        </div>
        {isFajr && (
          <div className="flex items-center gap-2 text-[var(--text-dim)]/50 text-[9px] font-black uppercase tracking-tight">
            <span>Sunrise</span>
            <span className="font-mono text-[10px] text-[var(--text-main)]/60">{formatTime(times.sunrise)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
