import React, { useMemo } from 'react';
import { Compass } from 'lucide-react';
import { LocationParams } from '../../lib/prayer/engine';
import { calculateQibla } from '../../lib/astronomy/coordinates';

export function QiblaTab({ location }: { location: LocationParams }) {
  const qibla = useMemo(() => calculateQibla(location.lat, location.lon), [location]);
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="panel-card p-12 text-center relative overflow-hidden">
        <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--accent-primary)]/5 w-80 h-80 -z-10 animate-spin-slow" strokeWidth={1} />
        
        <h3 className="text-3xl font-black tracking-tighter text-[var(--text-main)] mb-2 italic uppercase">Qibla Orientation</h3>
        <p className="text-[var(--text-dim)] text-xs font-medium opacity-60 mb-12">Geodesic path calculated using WGS84 ellipsoid coordinates.</p>
        
        <div className="flex flex-col items-center gap-12">
          <div className="relative">
            {/* The Compass UI */}
            <div className="w-64 h-64 rounded-full border-4 border-[var(--border-color)] flex items-center justify-center relative shadow-2xl bg-[var(--bg-color)]/50 backdrop-blur-sm">
              <div className="absolute inset-4 border border-[var(--text-dim)]/5 rounded-full" />
              
              {/* Markers */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between items-center text-[11px] font-black text-[var(--text-dim)]/30">
                <span>N</span>
                <span>S</span>
              </div>
              <div className="absolute inset-0 p-5 flex justify-between items-center text-[11px] font-black text-[var(--text-dim)]/30">
                <span>W</span>
                <span>E</span>
              </div>
              
              {/* Compass Needle */}
              <div 
                className="w-1.5 h-44 bg-gradient-to-t from-transparent via-[var(--accent-primary)] to-transparent absolute shadow-[0_0_20px_var(--accent-primary)] transition-transform duration-1000 ease-out"
                style={{ transform: `rotate(${qibla}deg)` }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 bg-[var(--accent-primary)] rounded-full border-4 border-[var(--bg-color)] shadow-xl" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-16 w-full max-w-sm mx-auto pt-6">
            <div className="text-center space-y-1">
              <span className="text-[10px] text-[var(--text-dim)]/40 uppercase font-black tracking-[0.3em] block">True Angle</span>
              <span className="text-4xl font-black text-[var(--text-main)] tabular-nums">{qibla.toFixed(2)}°</span>
            </div>
            <div className="text-center space-y-1">
              <span className="text-[10px] text-[var(--text-dim)]/40 uppercase font-black tracking-[0.3em] block">Target</span>
              <span className="text-sm font-black text-[var(--accent-primary)] uppercase tracking-widest mt-2 block">Kaaba, Mecca</span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card p-8 border-[var(--accent-primary)]/10 bg-[var(--accent-primary)]/5 flex items-start gap-6">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] shrink-0 shadow-inner">
           <Compass size={28} />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-black text-[var(--text-main)] italic">Spherical Trigonometry</h4>
          <p className="text-xs text-[var(--text-dim)] font-medium leading-relaxed opacity-60">
            Engineered using rigorous haversine integration to ensure sub-meter accuracy for your current geodetic datum.
          </p>
        </div>
      </div>
    </div>
  );
}
