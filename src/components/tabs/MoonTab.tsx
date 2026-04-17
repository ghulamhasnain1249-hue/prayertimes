import React, { useMemo } from 'react';
import { Moon, X } from 'lucide-react';
import { LocationParams } from '../../lib/prayer/engine';
import { getApparentMoonData } from '../../lib/astronomy/apparent';
import { DataRow } from '../common/DataDisplay';

export function MoonTab({ date, location, onClose }: { date: Date, location: LocationParams, onClose?: () => void }) {
  const data = useMemo(() => getApparentMoonData(date, location.lat, location.lon), [date, location]);
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="panel-card p-12 relative overflow-hidden">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-[var(--text-dim)] z-30"
          >
            <X size={20} />
          </button>
        )}
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Moon size={120} />
        </div>
        <h3 className="text-3xl font-black tracking-tighter mb-2 text-[var(--text-main)] italic uppercase">Lunar Ephemeris</h3>
        <p className="text-[var(--accent-primary)] text-[11px] mb-12 uppercase tracking-[0.3em] font-black flex items-center gap-2">
          <Moon size={14} className="fill-current" /> ELP-2000 Theory Integration
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
          <DataRow label="Right Ascension" value={data.ra.toFixed(6) + '°'} />
          <DataRow label="Declination" value={data.dec.toFixed(6) + '°'} />
          <DataRow label="Altitude" value={data.alt.toFixed(4) + '°'} />
          <DataRow label="Azimuth" value={data.az.toFixed(4) + '°'} />
          <DataRow label="GHA" value={data.gha.toFixed(4) + '°'} />
          <DataRow label="LHA" value={data.lha.toFixed(4) + '°'} />
          <DataRow label="SHA" value={data.sha.toFixed(4) + '°'} />
          <DataRow label="Distance (km)" value={Math.round(data.dist).toLocaleString()} />
          <DataRow label="Semi-Diameter" value={(data.sd * 3600).toFixed(2) + '"'} />
          <DataRow label="Horiz. Parallax" value={(data.hp * 3600).toFixed(2) + '"'} />
          <DataRow label="GHA Aries" value={data.ghaAries.toFixed(4) + '°'} />
        </div>
      </div>
    </div>
  );
}
