import React, { useState, useEffect } from 'react';
import { Search, MapPin, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LocationParams } from '../../lib/prayer/engine';
import { ManualInput } from '../common/DataDisplay';

interface LocationTabProps {
  setLocation: (l: LocationParams) => void;
  setLocationName: (n: string) => void;
  location: LocationParams | null;
  locationName: string | null;
}

export function LocationTab({ setLocation, setLocationName, location, locationName }: LocationTabProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search && search.length > 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=5`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const params: LocationParams = {
          lat: latitude, lon: longitude, elev: 0, tz: Math.round(longitude / 15), pressure: 1013.25, temperature: 20
        };
        setLocation(params);
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.suburb || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          setLocationName(city);
          localStorage.setItem('celestial_location', JSON.stringify({ params, name: city }));
        } catch (e) {
          const fallback = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          setLocationName(fallback);
          localStorage.setItem('celestial_location', JSON.stringify({ params, name: fallback }));
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
        alert("Unable to retrieve your location");
      }
    );
  };

  const selectLocation = (place: any) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    const params: LocationParams = {
      lat, lon, elev: location?.elev || 0, tz: Math.round(lon / 15), pressure: location?.pressure || 1013.25, temperature: location?.temperature || 20
    };
    setLocation(params);
    const name = place.display_name;
    setLocationName(name);
    localStorage.setItem('celestial_location', JSON.stringify({ params, name }));
    setResults([]);
    setSearch('');
  };

  const updateManual = (field: keyof LocationParams, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    const newParams = { ...location, [field]: num } as LocationParams;
    setLocation(newParams);
    localStorage.setItem('celestial_location', JSON.stringify({ params: newParams, name: locationName }));
  };

  return (
    <div className="panel-card p-10 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h3 className="text-3xl font-black tracking-tighter text-[var(--text-main)] italic uppercase">Spatial Positioning</h3>
          <p className="text-[var(--text-dim)] font-medium text-sm opacity-60">Synchronize your exact coordinates for astrophysical precision.</p>
        </div>
        <button 
          onClick={() => setIsManual(!isManual)}
          className={cn(
            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all w-full sm:w-auto shadow-lg",
            isManual ? "bg-[var(--accent-primary)] text-[var(--bg-color)]" : "bg-white/5 text-[var(--text-dim)] hover:bg-white/10"
          )}
        >
          {isManual ? 'Smart Search' : 'Manual Entry'}
        </button>
      </div>
      
      {!isManual ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={20} />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search worldwide city or landmark..." 
                className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl py-4 pl-14 pr-4 text-sm font-bold focus:outline-none focus:border-[var(--accent-primary)] transition-all shadow-inner"
              />
              {loading && <RefreshCw size={16} className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-[var(--accent-primary)]" />}
            </div>
            <button 
              onClick={detectLocation}
              disabled={loading}
              className="bg-white/5 border border-white/5 hover:bg-white/10 text-[var(--text-main)] py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 shrink-0 shadow-sm"
            >
              <MapPin size={18} className="text-[var(--accent-primary)]" />
              <span className="text-[10px] font-black uppercase tracking-widest">Auto Detect</span>
            </button>
          </div>

          {results.length > 0 && (
            <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[2rem] overflow-hidden divide-y divide-[var(--text-dim)]/5 shadow-2xl max-h-[400px] overflow-y-auto animate-in zoom-in-95 duration-200">
              {results.map((r, i) => (
                <button 
                  key={i}
                  onClick={() => selectLocation(r)}
                  className="w-full text-left p-5 hover:bg-[var(--accent-primary)]/5 text-sm font-bold flex items-center gap-4 transition-all"
                 >
                  <MapPin size={18} className="text-[var(--text-dim)]/30 shrink-0" />
                  <span className="truncate">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="space-y-3">
            <label className="text-[10px] text-[var(--text-dim)]/40 uppercase font-bold tracking-[0.25em] ml-1">Custom Label</label>
            <input 
              type="text" 
              value={locationName || ''}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Primary Observatory..." 
              className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-sm font-black text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)] shadow-inner"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <ManualInput label="Latitude" value={location?.lat || 0} onChange={(v) => updateManual('lat', v)} />
            <ManualInput label="Longitude" value={location?.lon || 0} onChange={(v) => updateManual('lon', v)} />
            <ManualInput label="Timezone" value={location?.tz || 0} onChange={(v) => updateManual('tz', v)} />
          </div>
        </div>
      )}

      {/* Advanced Parameters */}
      <div className="pt-10 border-t border-[var(--border-color)]/30">
        <h4 className="text-[11px] font-black text-[var(--accent-primary)] uppercase tracking-[0.3em] mb-8">Atmospheric Corrections</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <ManualInput label="Elevation (m)" value={location?.elev || 0} onChange={(v) => updateManual('elev', v)} />
          <ManualInput label="Pressure (mbr)" value={location?.pressure ?? 1013.25} onChange={(v) => updateManual('pressure', v)} />
          <ManualInput label="Temperature (°C)" value={location?.temperature ?? 20} onChange={(v) => updateManual('temperature', v)} />
        </div>
      </div>
    </div>
  );
}
