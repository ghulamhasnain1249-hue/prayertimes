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
import { getHijriDate } from './lib/astronomy/hijri';

type Tab = 'prayer' | 'location' | 'qibla' | 'themes' | 'sun' | 'moon' | 'author';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('prayer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  
  // Default location: Mecca
  const [location, setLocation] = useState<LocationParams>({
    lat: 21.4225,
    lon: 39.8262,
    elev: 277,
    tz: 3,
    pressure: 1013.25,
    temperature: 20
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

  const hijriDate = useMemo(() => getHijriDate(date), [date]);

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
            {activeTab === 'prayer' && (
              <PrayerTab 
                times={prayerTimes} 
                locationName={locationName} 
                date={date} 
                hijriDate={hijriDate} 
                locationParams={location} 
                toggleSidebar={toggleSidebar}
              />
            )}
            <div className="p-4 md:p-10 max-w-4xl mx-auto">
              {activeTab === 'location' && (
                <LocationTab 
                  setLocation={setLocation} 
                  setLocationName={setLocationName} 
                  location={location} 
                  locationName={locationName}
                />
              )}
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

function PrayerTab({ 
  times, 
  locationName, 
  date, 
  hijriDate, 
  locationParams,
  toggleSidebar
}: { 
  times: PrayerTimes, 
  locationName: string, 
  date: Date, 
  hijriDate: any, 
  locationParams: LocationParams,
  toggleSidebar: () => void
}) {
  const prayerSequence: { label: string, time: number, icon?: React.ReactNode }[] = [
    { label: 'Fajr', time: times.fajr, icon: <Moon size={18} /> },
    { label: 'Sunrise', time: times.sunrise, icon: <Sun size={18} /> },
    { label: 'Dhuhr', time: times.zuhr, icon: <Sun size={18} /> },
    { label: 'Asr', time: times.asr, icon: <Sun size={18} /> },
    { label: 'Maghrib', time: times.maghrib, icon: <Sun size={18} /> },
    { label: 'Isha', time: times.isha, icon: <Moon size={18} /> },
  ];

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

  // Circular progress math
  const progressPercent = ((60 - seconds) / 60) * 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col h-full bg-[#F1F5F9]">
      {/* Hero Section with Image Background */}
      <section className="relative h-[45vh] min-h-[380px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1920')` }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 h-full flex flex-col p-6 text-white">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleSidebar}
                className="p-2 bg-white/10 rounded-lg lg:hidden"
              >
                <Menu size={20} />
              </button>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20">
                Change Theme
              </button>
              <button className="p-1.5 bg-white/10 rounded-full border border-white/20">
                <Info size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-between">
            {/* Circular Indicator */}
            <div className="relative flex items-center justify-center w-36 h-36">
              <svg className="w-full h-full -rotate-90">
                <circle
                  className="text-white/10"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="72"
                  cy="72"
                />
                <circle
                  className="text-[#38BDF8] transition-all duration-1000"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="72"
                  cy="72"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[#FACC15] text-xs font-black uppercase tracking-widest leading-tight">{currentPrayer.label}</span>
                <span className="text-[#38BDF8] text-[8px] font-bold uppercase tracking-widest mt-0.5">Time Remaining</span>
              </div>
            </div>

            {/* Date and Location Panel */}
            <div className="text-right space-y-4 max-w-[200px]">
              <div className="flex items-center justify-end gap-2 text-sm">
                <span className="font-bold text-[#FACC15]">{hijriDate.day}, {hijriDate.monthName}, {hijriDate.year}</span>
                <Moon size={16} className="text-[#FACC15]" />
              </div>
              <div className="flex items-center justify-end gap-2 text-sm font-medium">
                <span>{format(date, 'eee d MMMM yyyy')}</span>
                <Calendar size={16} className="text-white/60" />
              </div>
              <div className="flex items-center justify-end gap-2 text-[10px] text-white/60 font-medium">
                <span>GMT: {locationParams.tz.toFixed(1)}, Height: {locationParams.elev} feet</span>
                <BarChart3 size={14} />
              </div>
              <div className="flex items-center justify-end gap-2 text-sm font-bold">
                <span className="truncate">{locationName.split(',')[0]}</span>
                <MapPin size={16} className="text-[#38BDF8]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alert Banner */}
      <div className="bg-[#B91C1C] text-white text-[10px] font-bold py-2 text-center uppercase tracking-widest z-20">
        Use Auto Location for more accuracy!
      </div>

      {/* Main Content Area */}
      <section className="flex-1 -mt-6 rounded-t-[2.5rem] bg-[#F1F5F9] z-30 overflow-y-auto px-6 py-8">
        {/* Ad/Featured Section */}
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between mb-8 shadow-sm border border-slate-200 overflow-hidden relative group cursor-pointer">
          <div className="relative z-10">
            <div className="text-[#059669] text-xl font-bold tracking-tight">DUROOD</div>
            <div className="text-[#059669] text-2xl font-black tracking-tighter leading-none">SECTION</div>
          </div>
          <div className="flex flex-col items-end z-10">
             <span className="text-[#059669] text-2xl font-urdu font-bold">درود سیکشن</span>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-[#059669]/5 -skew-x-12 translate-x-12" />
        </div>

        {/* Prayer List */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 space-y-2">
          {prayerSequence.map((p) => (
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

        <div className="mt-8 text-center pb-12">
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-[0.2em] font-bold mb-1">Time Remaining to {nextEvent.label}</div>
            <div className="text-2xl font-bold font-mono text-[#0F172A]">
               {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
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
  // For Fajr we show range Sunrise
  const isFajr = label === 'Fajr';
  const displayTime = isFajr 
    ? `${formatTime(time)} AM — ${formatTime(times.sunrise)} AM` 
    : formatTime(time);

  return (
    <div className={cn(
      "flex justify-between items-center py-5 transition-all duration-300 border-b border-slate-50 last:border-0",
      active && "bg-slate-50/50 -mx-6 px-14 border-b-0"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
          active ? "bg-[#0F172A] text-white scale-110 shadow-lg" : "bg-slate-100 text-[#94A3B8]"
        )}>
          {icon}
        </div>
        <span className={cn(
          "text-sm font-bold tracking-tight transition-colors",
          active ? "text-[#0F172A]" : "text-slate-600"
        )}>
          {label} {label === 'Asr' && '— Hanafi'} {label === 'Isha' && '— Hanafi'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className={cn(
          "text-sm font-bold font-mono tracking-tight tabular-nums",
          active ? "text-[#0F172A]" : "text-slate-500"
        )}>
          {displayTime}
        </div>
        <ChevronRight size={14} className={cn(
          "transition-all",
          active ? "text-[#0F172A]" : "text-slate-300"
        )} />
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

function LocationTab({ setLocation, setLocationName, location, locationName }: { setLocation: (l: LocationParams) => void, setLocationName: (n: string) => void, location: LocationParams, locationName: string }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isManual, setIsManual] = useState(false);

  // Real-time search with debounce
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
      (position) => {
        const { latitude, longitude } = position.coords;
        const params: LocationParams = {
          ...location,
          lat: latitude,
          lon: longitude,
          tz: Math.round(longitude / 15)
        };
        setLocation(params);
        setLocationName(`Detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        localStorage.setItem('celestial_location', JSON.stringify({ params, name: `Detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
        alert("Unable to retrieve your location");
      }
    );
  };

  const selectLocation = (place: any) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    
    const params: LocationParams = {
      ...location,
      lat,
      lon,
      tz: Math.round(lon / 15)
    };
    
    setLocation(params);
    setLocationName(place.display_name);
    localStorage.setItem('celestial_location', JSON.stringify({ params, name: place.display_name }));
    setResults([]);
    setSearch('');
  };

  const updateManual = (field: keyof LocationParams, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    const newParams = { ...location, [field]: num };
    setLocation(newParams);
    localStorage.setItem('celestial_location', JSON.stringify({ params: newParams, name: locationName }));
  };

  return (
    <div className="panel-card p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight text-white">Geographic Data</h3>
          <p className="text-[#94A3B8] text-sm">Configure your coordinates for sub-arcsecond astronomical calculations.</p>
        </div>
        <button 
          onClick={() => setIsManual(!isManual)}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
            isManual ? "bg-[#38BDF8] text-[#0F172A]" : "bg-white/5 text-[#94A3B8] hover:bg-white/10"
          )}
        >
          {isManual ? 'Hide Manual' : 'Manual Entry'}
        </button>
      </div>
      
      {!isManual ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city, neighborhood, or landmark..." 
                className="w-full bg-[#0F172A] border border-[#94A3B8]/20 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-[#38BDF8] transition-colors placeholder:text-[#94A3B8]/30"
              />
              {loading && <RefreshCw size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#38BDF8]" />}
            </div>
            <button 
              onClick={detectLocation}
              disabled={loading}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 rounded-xl transition-all flex items-center gap-2 group"
            >
              <MapPin size={16} className="text-[#38BDF8] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Detect</span>
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
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <label className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-[0.2em] ml-1">Location Label</label>
            <input 
              type="text" 
              value={locationName}
              onChange={(e) => {
                setLocationName(e.target.value);
                localStorage.setItem('celestial_location', JSON.stringify({ params: location, name: e.target.value }));
              }}
              placeholder="e.g. My Home, Karachi..." 
              className="w-full bg-[#0F172A] border border-[#94A3B8]/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#38BDF8] transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <ManualInput label="Latitude" value={location.lat} onChange={(v) => updateManual('lat', v)} />
            <ManualInput label="Longitude" value={location.lon} onChange={(v) => updateManual('lon', v)} />
            <ManualInput label="Timezone" value={location.tz} onChange={(v) => updateManual('tz', v)} />
          </div>
        </div>
      )}

      {/* Advanced Parameters */}
      <div className="pt-8 border-t border-[#94A3B8]/10">
        <h4 className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-[0.2em] mb-6">In-Situ Parameters</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ManualInput label="Elevation (m)" value={location.elev} onChange={(v) => updateManual('elev', v)} />
          <ManualInput label="Pressure (mbr)" value={location.pressure ?? 1013.25} onChange={(v) => updateManual('pressure', v)} />
          <ManualInput label="Temperature (°C)" value={location.temperature ?? 20} onChange={(v) => updateManual('temperature', v)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[#94A3B8]/10 opacity-60">
        <div>
          <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-widest block mb-1">Current Lat</span>
          <span className="text-sm font-mono text-white/90 tabular-nums">{location.lat.toFixed(6)}°</span>
        </div>
        <div>
          <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-widest block mb-1">Current Lon</span>
          <span className="text-sm font-mono text-white/90 tabular-nums">{location.lon.toFixed(6)}°</span>
        </div>
        <div>
          <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-widest block mb-1">GMT Offset</span>
          <span className="text-sm font-mono text-white/90 tabular-nums">{location.tz >= 0 ? '+' : ''}{location.tz}:00</span>
        </div>
        <div>
          <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-widest block mb-1">Refraction Factor</span>
          <span className="text-sm font-mono text-white/90 tabular-nums">High-Res</span>
        </div>
      </div>
    </div>
  );
}

function ManualInput({ label, value, onChange }: { label: string, value: number, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-[0.2em] ml-1">{label}</label>
      <input 
        type="number" 
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0F172A] border border-[#94A3B8]/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#38BDF8] transition-colors"
      />
    </div>
  );
}
