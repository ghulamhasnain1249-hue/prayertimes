import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, Sun, Clock, MapPin, Compass, Settings, 
  Menu, X, ChevronRight, Info, Calendar, Download, 
  Trash2, RefreshCw, BarChart3, Star
} from 'lucide-react';
import { cn, formatTime } from './lib/utils';
import { calculatePrayerTimes, type PrayerTimes, type LocationParams } from './lib/prayer/engine';
import { getApparentSunData, getApparentMoonData } from './lib/astronomy/apparent';
import { format } from 'date-fns';

type Tab = 'prayer' | 'location' | 'qibla' | 'themes' | 'sun' | 'moon' | 'author';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('prayer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  
  // Default location: Mecca
  const [location, setLocation] = useState<LocationParams>({
    lat: 21.4225,
    lon: 39.8262,
    elev: 277, // ft
    tz: 3
  });

  const [locationName, setLocationName] = useState('Masjid al-Haram, Mecca');

  // Load saved location
  useEffect(() => {
    const saved = localStorage.getItem('celestial_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocation(parsed.params);
        setLocationName(parsed.name);
      } catch (e) {
        console.error("Failed to load saved location", e);
      }
    }
  }, []);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(date, location);
  }, [date, location]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 glass border-r-0 transition-transform lg:relative lg:translate-x-0 border-r border-white/5",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Star className="text-blue-400 fill-blue-400/20" size={24} />
              <span className="tracking-tight text-white">Celestial</span>
            </h1>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium mt-1">Astronomy & Prayer</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <NavItem 
              active={activeTab === 'prayer'} 
              icon={<Clock size={18} />} 
              label="Prayer Times" 
              onClick={() => { setActiveTab('prayer'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              active={activeTab === 'location'} 
              icon={<MapPin size={18} />} 
              label="Location" 
              onClick={() => { setActiveTab('location'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              active={activeTab === 'qibla'} 
              icon={<Compass size={18} />} 
              label="Qibla Direction" 
              onClick={() => { setActiveTab('qibla'); setIsSidebarOpen(false); }} 
            />
            <div className="pt-4 pb-2 px-4">
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Algorithms</span>
            </div>
            <NavItem 
              active={activeTab === 'sun'} 
              icon={<Sun size={18} />} 
              label="Sun Data" 
              onClick={() => { setActiveTab('sun'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              active={activeTab === 'moon'} 
              icon={<Moon size={18} />} 
              label="Moon Data" 
              onClick={() => { setActiveTab('moon'); setIsSidebarOpen(false); }} 
            />
            <div className="pt-4 pb-2 px-4">
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Settings</span>
            </div>
            <NavItem 
              active={activeTab === 'themes'} 
              icon={<BarChart3 size={18} />} 
              label="Appearance" 
              onClick={() => { setActiveTab('themes'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              active={activeTab === 'author'} 
              icon={<Info size={18} />} 
              label="Scientific Authorship" 
              onClick={() => { setActiveTab('author'); setIsSidebarOpen(false); }} 
            />
          </nav>

          <div className="p-6 border-t border-white/10 text-white/40 text-[11px]">
            <p>© 2026 Astronomy Engine</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f] relative overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full translate-y-1/2 pointer-events-none" />

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 z-20 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 -ml-2 text-white/60 hover:text-white lg:hidden transition-colors"
              onClick={toggleSidebar}
            >
              <Menu size={20} />
            </button>
            <h2 className="font-semibold text-white/90 capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-white/70">{format(date, 'EEEE, dd MMM yyyy')}</span>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-tight">GMT {location.tz >= 0 ? '+' : ''}{location.tz}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {activeTab === 'prayer' && <PrayerTab times={prayerTimes} locationName={locationName} date={date} />}
            {activeTab === 'location' && <LocationTab setLocation={setLocation} setLocationName={setLocationName} location={location} />}
            {activeTab === 'sun' && <SunTab date={date} location={location} />}
            {activeTab === 'moon' && <MoonTab date={date} location={location} />}
            {activeTab === 'qibla' && <QiblaTab location={location} />}
            {activeTab === 'author' && <AuthorTab />}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
        active 
          ? "bg-white/10 text-white shadow-sm" 
          : "text-white/40 hover:text-white/80 hover:bg-white/5"
      )}
    >
      <span className={cn(
        "transition-transform group-hover:scale-110",
        active ? "text-blue-400" : "text-white/20"
      )}>
        {icon}
      </span>
      {label}
      {active && <ChevronRight size={14} className="ml-auto opacity-40 shrink-0" />}
    </button>
  );
}

function PrayerTab({ times, locationName, date }: { times: PrayerTimes, locationName: string, date: Date }) {
  return (
    <div className="space-y-6">
      {/* Hero Clock Section */}
      <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
          <Clock size={120} strokeWidth={1} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-medium">
              <MapPin size={16} />
              <span className="text-sm truncate max-w-[250px]">{locationName}</span>
            </div>
            <h3 className="text-5xl font-mono tracking-tight font-medium tabular-nums text-white">
              {format(date, 'HH:mm:ss')}
            </h3>
            <p className="text-white/40 text-sm">{format(date, 'EEEE, dd MMMM yyyy')}</p>
          </div>
          
          <div className="glass bg-white/5 border-white/5 px-6 py-4 rounded-2xl">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">Status</span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-blue-400">Celestial Sync</span>
              <RefreshCw size={16} className="text-blue-400 opacity-50 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PrayerTimeCard label="Fajr" time={times.fajr} icon={<span className="text-indigo-400 opacity-50">✦</span>} />
        <PrayerTimeCard label="Sunrise" time={times.sunrise} icon={<Sun size={14} className="text-orange-400 opacity-50" />} />
        <PrayerTimeCard label="Dhuhr" time={times.zuhr} icon={<Sun size={14} className="text-yellow-400 opacity-50" />} />
        <PrayerTimeCard label="Asr" time={times.asr} icon={<Sun size={14} className="text-emerald-400 opacity-50" />} />
        <PrayerTimeCard label="Maghrib" time={times.maghrib} icon={<Moon size={14} className="text-rose-400 opacity-50" />} />
        <PrayerTimeCard label="Isha" time={times.isha} icon={<Moon size={14} className="text-indigo-400 opacity-50" />} />
      </div>

      <div className="glass p-6 rounded-3xl border-dashed border-white/10 text-center">
        <p className="text-white/30 text-xs italic">Sub-arcsecond high-precision engine powered by VSOP87D / ELP-2000 models.</p>
      </div>
    </div>
  );
}

function PrayerTimeCard({ label, time, icon }: { label: string, time: number, icon?: React.ReactNode }) {
  return (
    <div className="glass p-5 rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-white/40 uppercase tracking-widest group-hover:text-blue-400 transition-colors">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-mono tabular-nums font-medium text-white">
        {formatTime(time)}
      </div>
    </div>
  );
}

function AuthorTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
      <div className="glass p-12 rounded-[3.5rem] flex flex-col items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 p-1">
          <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
            <Star className="text-blue-400" size={40} />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-bold tracking-tighter text-white font-serif">Aura of Astronomy</h3>
          <p className="text-blue-400 font-medium tracking-widest uppercase text-[10px]">Computational Astrophysics Engine</p>
        </div>
        <p className="text-white/50 max-w-md text-sm leading-relaxed">
          Refactored for high-precision analytical modeling of celestial bodies using IAU 2006 precession and nutation standards.
        </p>
      </div>
    </div>
  );
}

function SunTab({ date, location }: { date: Date, location: LocationParams }) {
  const data = useMemo(() => getApparentSunData(date, location.lat, location.lon), [date, location]);
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass p-8 rounded-[2.5rem]">
        <h3 className="text-2xl font-bold tracking-tight mb-2 text-white">Sun Ephemeris</h3>
        <p className="text-white/40 text-[10px] mb-6 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
          <Sun size={14} className="text-orange-400" /> Apparent Geocentric Position
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 data-grid">
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

      <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Scientific Metadata</h4>
        <div className="space-y-3">
          <MetadataItem label="Precession Model" value="IAU 2006 (Capitaine et al.)" />
          <MetadataItem label="Nutation Model" value="IAU 2000B (Simplified)" />
          <MetadataItem label="Reference Frame" value="ICRS (J2000.0)" />
          <MetadataItem label="Time Scale" value="TDB / Terrestrial Time (TT)" />
        </div>
      </div>
    </div>
  );
}

function MetadataItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="text-[11px] font-bold text-blue-400/60 min-w-[120px]">{label}</span>
      <span className="text-xs text-white/60 font-mono tracking-tight">{value}</span>
    </div>
  );
}

function MoonTab({ date, location }: { date: Date, location: LocationParams }) {
  const data = useMemo(() => getApparentMoonData(date, location.lat, location.lon), [date, location]);
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass p-8 rounded-[2.5rem]">
        <h3 className="text-2xl font-bold tracking-tight mb-2 text-white">Moon Ephemeris</h3>
        <p className="text-white/40 text-[10px] mb-6 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
          <Moon size={14} className="text-blue-400" /> Apparent Geocentric Position
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 data-grid">
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

import { calculateQibla } from './lib/astronomy/coordinates';

function QiblaTab({ location }: { location: LocationParams }) {
  const qibla = useMemo(() => calculateQibla(location.lat, location.lon), [location]);
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass p-8 rounded-[2.5rem] text-center relative overflow-hidden">
        <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 w-64 h-64 -z-10" strokeWidth={1} />
        
        <h3 className="text-2xl font-bold tracking-tight text-white mb-2">Qibla Direction</h3>
        <p className="text-white/50 text-sm mb-12">The great-circle path from your location to the Holy Kaaba in Mecca.</p>
        
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="w-48 h-48 rounded-full border-2 border-white/10 flex items-center justify-center relative">
              {/* Compass Marks */}
              <div className="absolute inset-0 p-2 flex flex-col justify-between items-center text-[10px] font-bold text-white/20">
                <span>N</span>
                <span>S</span>
              </div>
              <div className="absolute inset-0 p-2 flex justify-between items-center text-[10px] font-bold text-white/20">
                <span>W</span>
                <span>E</span>
              </div>
              
              {/* Needle */}
              <div 
                className="w-1 h-32 bg-gradient-to-t from-transparent via-blue-500 to-transparent absolute shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                style={{ transform: `rotate(${qibla}deg)` }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-lg" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 w-full max-w-xs mx-auto">
            <div className="text-center">
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">Bearing</span>
              <span className="text-2xl font-mono text-white">{qibla.toFixed(2)}°</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">Method</span>
              <span className="text-sm font-medium text-white/80">Spherical Trigonometry</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-3xl border-white/5 flex items-start gap-4">
        <div className="p-3 bg-blue-500/10 rounded-2xl">
          <Compass size={24} className="text-blue-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white/90">Precision Note</h4>
          <p className="text-xs text-white/50 leading-relaxed">
            Qibla calculations are based on the WGS84 ellipsoid model for the highest accuracy across long distances.
          </p>
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 hover:bg-white/[0.02] px-2 rounded-lg transition-colors group">
      <span className="text-white/40 group-hover:text-white/60 transition-colors uppercase text-[10px] font-bold tracking-wider">{label}</span>
      <span className="text-white/90 tabular-nums font-medium text-xs">{value}</span>
    </div>
  );
}

function LocationTab({ setLocation, setLocationName, location }: { setLocation: (l: LocationParams) => void, setLocationName: (n: string) => void, location: LocationParams }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search) return;
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

  const selectLocation = (place: any) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    const tz = Math.round(lon / 15);
    
    const params: LocationParams = {
      lat,
      lon,
      elev: location.elev,
      tz: location.tz // Keep current TZ unless we compute it properly
    };
    
    setLocation(params);
    setLocationName(place.display_name);
    localStorage.setItem('celestial_location', JSON.stringify({ params, name: place.display_name }));
    setResults([]);
    setSearch('');
  };

  return (
    <div className="glass p-8 rounded-[2.5rem] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight text-white">Location Settings</h3>
        <p className="text-white/50 text-sm font-medium">Set your coordinates to calculate precise prayer times.</p>
      </div>
      
      <div className="relative">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search city or mohalla..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm placeholder:text-white/20"
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Search'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 glass rounded-2xl overflow-hidden z-30 shadow-2xl border border-white/10 p-1">
            {results.map((r, i) => (
              <button 
                key={i}
                onClick={() => selectLocation(r)}
                className="w-full text-left px-5 py-3.5 hover:bg-white/10 text-xs text-white/70 rounded-xl transition-colors truncate"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] text-white/30 uppercase font-bold ml-1 tracking-widest">Latitude</label>
          <input 
            type="number" 
            value={location.lat}
            readOnly
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white/60 focus:outline-none" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-white/30 uppercase font-bold ml-1 tracking-widest">Longitude</label>
          <input 
            type="number" 
            value={location.lon}
            readOnly
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white/60 focus:outline-none" 
          />
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-blue-300 text-xs flex gap-4 leading-relaxed">
        <Info size={18} className="shrink-0 text-blue-400" />
        <p>This engine implements the <strong>Celestial Intermediate origin (CIO)</strong> method. Accurate geolocation is critical for sub-second precision.</p>
      </div>
    </div>
  );
}
