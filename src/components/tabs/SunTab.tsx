import React, { useMemo } from 'react';
import { Sun, X } from 'lucide-react';
import { LocationParams } from '../../lib/prayer/engine';
import { getApparentSunData } from '../../lib/astronomy/apparent';
import { DataRow } from '../common/DataDisplay';

export function SunTab({ date, location, onClose }: { date: Date, location: LocationParams, onClose?: () => void }) {
  const data = useMemo(() => getApparentSunData(date, location.lat, location.lon), [date, location]);
  
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
           <Sun size={120} />
        </div>
        <h3 className="text-3xl font-black tracking-tighter mb-2 text-[var(--text-main)] italic uppercase">Solar Dynamics</h3>
        <p className="text-[var(--accent-primary)] text-[11px] mb-12 uppercase tracking-[0.3em] font-black flex items-center gap-2">
          <Sun size={14} className="fill-current" /> Apparent Geocentric Position
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
          <DataRow label="Equation of Time" value={(data.eot * 60).toFixed(2) + 'm'} />
          <DataRow label="GHA Aries" value={data.ghaAries.toFixed(4) + '°'} />
        </div>
      </div>

      <div className="panel-card p-8 border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/5 space-y-6">
        <h4 className="text-[11px] font-black text-[var(--accent-primary)] uppercase tracking-[0.3em] border-b border-[var(--accent-primary)]/10 pb-4">Scientific Reference Models</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <MetadataItem label="Precession" value="IAU 2006 Standards" />
          <MetadataItem label="Nutation" value="IAU 2000B Abbreviated" />
          <MetadataItem label="Frame" value="ICRS / J2000.0" />
          <MetadataItem label="Time Scale" value="TDB / TT Reference" />
        </div>
      </div>
    </div>
  );
}

function MetadataItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black text-[var(--text-dim)]/40 uppercase tracking-widest">{label}</span>
      <span className="text-xs text-[var(--text-main)] font-bold tracking-tight">{value}</span>
    </div>
  );
}
