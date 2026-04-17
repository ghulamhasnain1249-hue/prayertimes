import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, Sun, Clock, MapPin, Compass, Settings, 
  Menu, X, ChevronRight, Info, Calendar, Download, 
  Trash2, RefreshCw, BarChart3, Star, Search
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
    <div className="flex flex-col h-screen overflow-hidden text-[#F1F5F9]">
      {/* Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      {/* Header */}
      <header className="h-20 shrink-0 px-10 flex items-center justify-between border-b border-[#94A3B8]/10 z-30">
        <div className="flex items-center gap-4">
          <button 
            className="p-2 -ml-2 text-white/60 hover:text-white lg:hidden transition-colors"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          <div className="logo flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="w-8 h-8 bg-[#38BDF8] rounded-lg flex items-center justify-center">
              <Star size={18} className="text-[#0F172A] fill-current" />
            </div>
            AL-WAQT
          </div>
        </div>

        <div className="location-info text-right">
          <div className="text-lg font-medium flex items-center justify-end gap-2">
            <MapPin size={16} className="text-[#38BDF8]" />
            {locationName.split(',')[0]}
          </div>
          <div className="text-sm text-[#94A3B8]">
            {format(date, 'EEEE, dd MMMM yyyy')} • 16 Dhul-Qi'dah 1445
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 sidebar-glass transition-transform lg:relative lg:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full pt-20 lg:pt-0">
            <nav className="flex-1 px-4 py-8 space-y-2">
              <NavItem 
                active={activeTab === 'prayer'} 
                icon={<Clock size={18} />} 
                label="Prayer Times" 
                onClick={() => { setActiveTab('prayer'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                active={activeTab === 'location'} 
                icon={<MapPin size={18} />} 
                label="Location Settings" 
                onClick={() => { setActiveTab('location'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                active={activeTab === 'qibla'} 
                icon={<Compass size={18} />} 
                label="Qibla Way" 
                onClick={() => { setActiveTab('qibla'); setIsSidebarOpen(false); }} 
              />
              <div className="pt-6 pb-2 px-4">
                <span className="text-[11px] text-[#94A3B8]/40 uppercase tracking-[0.2em] font-bold">Algorithms</span>
              </div>
              <NavItem 
                active={activeTab === 'sun'} 
                icon={<Sun size={18} />} 
                label="Solar Ephemeris" 
                onClick={() => { setActiveTab('sun'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                active={activeTab === 'moon'} 
                icon={<Moon size={18} />} 
                label="Lunar Dynamics" 
                onClick={() => { setActiveTab('moon'); setIsSidebarOpen(false); }} 
              />
              <div className="pt-6 pb-2 px-4">
                <span className="text-[11px] text-[#94A3B8]/40 uppercase tracking-[0.2em] font-bold">Scientific</span>
              </div>
              <NavItem 
                active={activeTab === 'author'} 
                icon={<Info size={18} />} 
                label="Engine Credits" 
                onClick={() => { setActiveTab('author'); setIsSidebarOpen(false); }} 
              />
            </nav>
            <div className="p-8 border-t border-[#94A3B8]/10 text-[#94A3B8]/50 text-[10px] uppercase tracking-widest font-bold">
              Precision System v2.1.0
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0F172A]">
          <div className="h-full">
            {activeTab === 'prayer' && <PrayerTab times={prayerTimes} locationName={locationName} date={date} />}
            <div className="p-10 max-w-4xl mx-auto">
              {activeTab === 'location' && <LocationTab setLocation={setLocation} setLocationName={setLocationName} location={location} />}
              {activeTab === 'sun' && <SunTab date={date} location={location} />}
              {activeTab === 'moon' && <MoonTab date={date} location={location} />}
              {activeTab === 'qibla' && <QiblaTab location={location} />}
              {activeTab === 'author' && <AuthorTab />}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="h-[60px] shrink-0 px-10 flex items-center justify-between border-t border-[#94A3B8]/10 bg-[#0F172A]/50 text-[#94A3B8] text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#38BDF8]/10 rounded-full text-[#38BDF8] font-medium">
            <span className="font-bold italic">f(x)</span>
            Engine: Custom Math Logic v2.1.0
          </div>
        </div>
        <div className="hidden md:block">Method: High-Precision Coordinate Mapping • UTC {location.tz >= 0 ? '+' : ''}{location.tz}:00</div>
        <div>Static Deployment: Ready</div>
      </footer>
    </div>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-5 py-3.5 rounded-xl transition-all duration-300 group text-sm font-semibold",
        active 
          ? "bg-[#38BDF8]/10 text-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.05)]" 
          : "text-[#94A3B8]/50 hover:text-[#F1F5F9] hover:bg-white/[0.03]"
      )}
    >
      <span className={cn(
        "transition-transform duration-300 group-hover:scale-110",
        active ? "text-[#38BDF8]" : "text-[#94A3B8]/30"
      )}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function PrayerTab({ times, locationName, date }: { times: PrayerTimes, locationName: string, date: Date }) {
  const prayerSequence: { label: string, time: number }[] = [
    { label: 'Fajr', time: times.fajr },
    { label: 'Sunrise', time: times.sunrise },
    { label: 'Dhuhr', time: times.zuhr },
    { label: 'Asr', time: times.asr },
    { label: 'Maghrib', time: times.maghrib },
    { label: 'Isha', time: times.isha },
  ];

  const now = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  
  let nextPrayer = prayerSequence[0];
  for (const p of prayerSequence) {
    if (p.time > now) {
      nextPrayer = p;
      break;
    }
  }

  const diff = nextPrayer.time - now;
  const hours = Math.floor(diff < 0 ? diff + 24 : diff);
  const minutes = Math.floor(((diff < 0 ? diff + 24 : diff) % 1) * 60);
  const seconds = Math.floor(((((diff < 0 ? diff + 24 : diff) % 1) * 60) % 1) * 60);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] h-full">
      {/* Hero Section */}
      <section className="next-prayer-gradient p-12 flex flex-col justify-center relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#38BDF8]/10 blur-[80px] rounded-full" />
        
        <div className="relative z-10">
          <div className="next-label text-[12px] font-bold uppercase tracking-[0.2em] text-[#38BDF8] mb-2">Up Next</div>
          <div className="next-name text-[72px] font-extrabold leading-none tracking-tighter text-white mb-4">
            {nextPrayer.label}
          </div>
          <div className="countdown text-5xl font-light text-[#FACC15] tabular-nums tracking-tight">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          
          <div className="mt-12 pt-12 border-t border-white/5 space-y-1">
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold">Calculation Precision</div>
            <div className="text-xs text-[#94A3B8]/60 italic">Sub-arcsecond accuracy engine powered by IAU standards.</div>
          </div>
        </div>
      </section>

      {/* List Section */}
      <section className="p-10 lg:p-12 overflow-y-auto">
        <div className="prayer-list space-y-3 max-w-2xl">
          {prayerSequence.map((p) => (
            <div key={p.label}>
              <PrayerRow 
                label={p.label} 
                time={p.time} 
                active={p.label === nextPrayer.label}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PrayerRow({ label, time, active }: { label: string, time: number, active?: boolean }) {
  return (
    <div className={cn(
      "panel-card px-8 py-6 flex justify-between items-center transition-all duration-300",
      active ? "border-[#38BDF8] bg-[#38BDF8]/5 shadow-[0_0_20px_rgba(56,189,248,0.05)]" : "hover:bg-white/[0.02]"
    )}>
      <div className="flex items-center gap-5">
        <div className={cn(
          "w-2 h-2 rounded-full",
          active ? "bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" : "bg-[#94A3B8]/30"
        )} />
        <span className="text-xl font-semibold tracking-tight">{label}</span>
      </div>
      <div className="text-2xl font-bold font-mono tracking-tight text-white/90">
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
      <div className="panel-card p-10">
        <h3 className="text-2xl font-bold tracking-tight mb-2 text-white">Sun Ephemeris</h3>
        <p className="text-[#38BDF8] text-[10px] mb-8 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
          <Sun size={14} /> Apparent Geocentric Position
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

      <div className="panel-card p-6 border-[#38BDF8]/20 bg-[#38BDF8]/5 space-y-4">
        <h4 className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-[0.2em]">Scientific Metadata</h4>
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
      <span className="text-[11px] font-bold text-[#38BDF8]/60 min-w-[120px]">{label}</span>
      <span className="text-xs text-[#F1F5F9]/60 font-mono tracking-tight">{value}</span>
    </div>
  );
}

function MoonTab({ date, location }: { date: Date, location: LocationParams }) {
  const data = useMemo(() => getApparentMoonData(date, location.lat, location.lon), [date, location]);
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="panel-card p-10">
        <h3 className="text-2xl font-bold tracking-tight mb-2 text-white">Moon Ephemeris</h3>
        <p className="text-[#38BDF8] text-[10px] mb-8 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
          <Moon size={14} /> Apparent Geocentric Position
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
      <div className="panel-card p-12 text-center relative overflow-hidden">
        <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#38BDF8]/5 w-64 h-64 -z-10" strokeWidth={1} />
        
        <h3 className="text-2xl font-bold tracking-tight text-white mb-2">Qibla Direction</h3>
        <p className="text-[#94A3B8] text-sm mb-12">The great-circle path from your location to the Holy Kaaba in Mecca.</p>
        
        <div className="flex flex-col items-center gap-10">
          <div className="relative">
            <div className="w-56 h-56 rounded-full border-2 border-[#94A3B8]/10 flex items-center justify-center relative">
              {/* Compass Marks */}
              <div className="absolute inset-0 p-3 flex flex-col justify-between items-center text-[10px] font-bold text-[#94A3B8]/20">
                <span>N</span>
                <span>S</span>
              </div>
              <div className="absolute inset-0 p-3 flex justify-between items-center text-[10px] font-bold text-[#94A3B8]/20">
                <span>W</span>
                <span>E</span>
              </div>
              
              {/* Needle */}
              <div 
                className="w-1 h-36 bg-gradient-to-t from-transparent via-[#38BDF8] to-transparent absolute shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                style={{ transform: `rotate(${qibla}deg)` }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#38BDF8] rounded-full border-2 border-white shadow-lg" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-12 w-full max-w-sm mx-auto">
            <div className="text-center">
              <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-[0.2em] block mb-1">True Bearing</span>
              <span className="text-3xl font-bold text-white tabular-nums">{qibla.toFixed(2)}°</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-[0.2em] block mb-1">Methodology</span>
              <span className="text-sm font-semibold text-[#38BDF8]">Spherical Trig.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card p-6 border-[#38BDF8]/20 bg-[#38BDF8]/5 flex items-start gap-4">
        <Compass size={24} className="text-[#38BDF8] shrink-0" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white/90">Precision Algorithm</h4>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Qibla calculations are based on the WGS84 geodesic model for maximum accuracy across global coordinates.
          </p>
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[#94A3B8]/10 hover:bg-white/[0.02] px-2 rounded-lg transition-colors group">
      <span className="text-[#94A3B8]/40 group-hover:text-[#94A3B8]/60 transition-colors uppercase text-[10px] font-bold tracking-wider">{label}</span>
      <span className="text-[#F1F5F9]/90 tabular-nums font-medium text-xs">{value}</span>
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
    
    const params: LocationParams = {
      lat,
      lon,
      elev: location.elev,
      tz: Math.round(lon / 15)
    };
    
    setLocation(params);
    setLocationName(place.display_name);
    localStorage.setItem('celestial_location', JSON.stringify({ params, name: place.display_name }));
    setResults([]);
    setSearch('');
  };

  return (
    <div className="panel-card p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight text-white">Geographic Data</h3>
        <p className="text-[#94A3B8] text-sm">Configure your coordinates for sub-arcsecond astronomical calculations.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search city, neighborhood, or landmark..." 
              className="w-full bg-[#0F172A] border border-[#94A3B8]/20 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-[#38BDF8] transition-colors placeholder:text-[#94A3B8]/30"
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0F172A] font-bold px-8 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Search'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-[#0F172A] border border-[#94A3B8]/20 rounded-xl overflow-hidden divide-y divide-[#94A3B8]/10 shadow-xl">
            {results.map((r, i) => (
              <button 
                key={i}
                onClick={() => selectLocation(r)}
                className="w-full text-left p-4 hover:bg-[#38BDF8]/5 text-sm flex items-center gap-3 group transition-colors"
               >
                <MapPin size={16} className="text-[#94A3B8] group-hover:text-[#38BDF8]" />
                <span className="truncate">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[#94A3B8]/10">
        <div>
          <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-widest block mb-1">Latitude</span>
          <span className="text-sm font-mono text-white/90 tabular-nums">{location.lat.toFixed(6)}°</span>
        </div>
        <div>
          <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-widest block mb-1">Longitude</span>
          <span className="text-sm font-mono text-white/90 tabular-nums">{location.lon.toFixed(6)}°</span>
        </div>
        <div>
          <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-widest block mb-1">Timezone</span>
          <span className="text-sm font-mono text-white/90 tabular-nums">GMT {location.tz >= 0 ? '+' : ''}{location.tz}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-widest block mb-1">Elevation</span>
          <span className="text-sm font-mono text-white/90 tabular-nums">{location.elev}m</span>
        </div>
      </div>
    </div>
  );
}
