import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, Sun, Clock, MapPin, Compass, Settings, 
  Menu, X, ChevronRight, Info, Calendar, Download, 
  Trash2, RefreshCw, BarChart3, Star, Search, Circle
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
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied' | 'loading'>('loading');
  
  // Initial location null to prevent Makkah default
  const [location, setLocation] = useState<LocationParams | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  // Load saved location or request geolocation
  useEffect(() => {
    const saved = localStorage.getItem('celestial_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocation(parsed.params);
        setLocationName(parsed.name);
        setPermissionStatus('granted');
      } catch (e) {
        setPermissionStatus('pending');
      }
    } else {
      setPermissionStatus('pending');
    }
  }, []);

  useEffect(() => {
    if (permissionStatus === 'pending') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const params: LocationParams = {
              lat: latitude,
              lon: longitude,
              elev: 0,
              tz: Math.round(longitude / 15),
              pressure: 1013.25,
              temperature: 20
            };
            setLocation(params);
            
            // Reverse Geocoding to get City Name
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "Detected Location";
              setLocationName(city);
              localStorage.setItem('celestial_location', JSON.stringify({ params, name: city }));
            } catch (e) {
              const fallback = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
              setLocationName(fallback);
              localStorage.setItem('celestial_location', JSON.stringify({ params, name: fallback }));
            }
            
            setPermissionStatus('granted');
          },
          () => {
            setPermissionStatus('denied');
          }
        );
      } else {
        setPermissionStatus('denied');
      }
    }
  }, [permissionStatus]);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerTimes = useMemo(() => {
    if (!location) return null;
    return calculatePrayerTimes(date, location);
  }, [date, location]);

  const hijriDate = useMemo(() => getHijriDate(date), [date]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (permissionStatus === 'loading' || (permissionStatus === 'pending' && !location)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0F172A] p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-[#38BDF8]/10 rounded-full flex items-center justify-center animate-pulse">
          <MapPin size={40} className="text-[#38BDF8]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Detecting Location</h1>
          <p className="text-[#94A3B8] text-sm max-w-xs">We need your coordinates to calculate high-precision prayer times for your exact position.</p>
        </div>
      </div>
    );
  }

  // Fallback for denied permission
  if (permissionStatus === 'denied' && !location) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0F172A] p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-[#F87171]/10 rounded-full flex items-center justify-center">
          <X size={40} className="text-[#F87171]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Location Required</h1>
          <p className="text-[#94A3B8] text-sm max-w-xs">Please provide a location manually to continue.</p>
        </div>
        <button 
          onClick={() => {
            setLocation({ lat: 21.4225, lon: 39.8262, elev: 277, tz: 3, pressure: 1013.25, temperature: 20 });
            setLocationName('Masjid al-Haram, Mecca');
            setPermissionStatus('granted');
          }}
          className="bg-[#38BDF8] text-[#0F172A] px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-transform active:scale-95"
        >
          Set Default (Mecca)
        </button>
      </div>
    );
  }

  if (!location || !locationName) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden text-[#F1F5F9] bg-[#0F172A]">
      {/* Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      {/* Header - Compact for mobile */}
      <header className="h-14 lg:h-20 shrink-0 px-6 lg:px-10 flex items-center justify-between border-b border-[#94A3B8]/10 z-30 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            className="p-2 -ml-2 text-white/60 hover:text-white lg:hidden transition-colors"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
          <div className="logo flex items-center gap-2 lg:gap-3 text-lg lg:text-2xl font-bold tracking-tight">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-[#38BDF8] rounded-lg flex items-center justify-center">
              <Star size={14} className="text-[#0F172A] fill-current" />
            </div>
            AL-WAQT
          </div>
        </div>

        <div className="location-info text-right hidden sm:block">
          <div className="text-base lg:text-lg font-medium flex items-center justify-end gap-2">
            <MapPin size={14} className="text-[#38BDF8]" />
            {locationName.split(',')[0]}
          </div>
          <div className="text-[10px] lg:text-sm text-[#94A3B8]">
            {format(date, 'EEEE, dd MMMM yyyy')}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 sidebar-glass transition-transform lg:relative lg:translate-x-0 border-r border-white/5",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center justify-between lg:hidden border-b border-white/5">
              <div className="text-lg font-bold tracking-tight flex items-center gap-2">
                 <Star size={18} className="text-[#38BDF8]" />
                 MENU
              </div>
              <button 
                onClick={toggleSidebar}
                className="p-2 bg-white/5 rounded-lg text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
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

      {/* Footer - Hidden on mobile */}
      <footer className="h-[60px] shrink-0 px-10 hidden md:flex items-center justify-between border-t border-[#94A3B8]/10 bg-[#0F172A]/50 text-[#94A3B8] text-xs">
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
  const prayerSequence: { label: string, time: number, icon?: React.ReactNode, isStandalone?: boolean }[] = [
    { label: 'Fajr', time: times.fajr, icon: <div className="w-1.5 h-1.5 rounded-full bg-[#1E293B]" /> },
    { label: 'Sunrise', time: times.sunrise, icon: null, isStandalone: true },
    { label: 'Zuhr', time: times.zuhr, icon: <div className="w-3 h-3 rounded-full border-2 border-[#1E293B] flex items-center justify-center"><div className="w-1 h-1 bg-[#1E293B] rounded-full" /></div> },
    { label: 'Asr', time: times.asr, icon: <div className="w-3 h-3 border-2 border-[#1E293B] rounded-full" /> },
    { label: 'Maghrib', time: times.maghrib, icon: <Circle size={12} className="text-[#1E293B]" /> },
    { label: 'Isha', time: times.isha, icon: <Moon size={14} className="text-[#1E293B]" /> },
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

  // Circular progress math
  const progressPercent = ((60 - seconds) / 60) * 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col min-h-full bg-[#F1F5F9] relative">
      {/* Scrollable Hero Section */}
      <section className="relative h-[48vh] min-h-[380px] w-full z-40">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1920')` }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 h-full flex flex-col p-6 text-white">
          <div className="flex justify-between items-center mb-6">
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
                Theme
              </button>
              <button className="p-1.5 bg-white/10 rounded-full border border-white/20">
                <Info size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 px-4">
            {/* Circular Indicator - Optimized for mobile */}
            <div className="relative flex items-center justify-center w-40 h-40 sm:w-44 sm:h-44 shrink-0 transition-all">
              <svg className="w-full h-full -rotate-90">
                <circle
                  className="text-white/10"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="50%"
                  cy="50%"
                />
                <circle
                  className="text-[#38BDF8] transition-all duration-1000"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="50%"
                  cy="50%"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[#EF4444] text-base sm:text-lg font-bold tracking-tight leading-none mb-0.5">
                  {currentPrayer.label === 'Sunrise' ? 'Sunrise' : currentPrayer.label}
                </span>
                <span className="text-[7px] sm:text-[9px] text-white/50 uppercase font-black tracking-widest mb-1.5">Remaining</span>
                <span className="text-sm sm:text-base font-mono font-black tabular-nums text-[#38BDF8] drop-shadow-sm">
                   {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Date and Location Panel */}
            <div className="text-center sm:text-right space-y-3 max-w-full sm:max-w-[200px]">
              <div className="flex flex-col items-center sm:items-end">
                <div className="flex items-center justify-center sm:justify-end gap-2 text-sm">
                  <span className="font-bold text-[#FACC15]">{hijriDate.day}, {hijriDate.monthName}, {hijriDate.year}</span>
                  <Moon size={16} className="text-[#FACC15]" />
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-2 text-xs font-medium text-white/60">
                  <span>{format(date, 'eee d MMMM yyyy')}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-center sm:justify-end gap-2 text-sm font-bold">
                  <span className="truncate max-w-[150px]">{locationName.split(',')[0]}</span>
                  <MapPin size={16} className="text-[#38BDF8]" />
                </div>
                <div className="text-[9px] text-white/40 font-medium uppercase tracking-wider">
                  {locationParams.lat.toFixed(2)}N, {locationParams.lon.toFixed(2)}E
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Scrollable Content Area */}
      <section className="flex-1 -mt-6 rounded-t-[2.5rem] bg-[#F1F5F9] z-50 px-6 pt-10 pb-8 shadow-2xl">
        {/* Ad/Featured Section - REMOVED AS REQUESTED */}

        {/* Prayer List */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 px-6 py-4 space-y-1 mb-6">
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

        <div className="text-center pb-8 opacity-40">
            <div className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold">Al-Waqt Precision Engine</div>
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
      "flex justify-between items-center py-4 transition-all duration-300 border-b border-slate-50 last:border-0",
      active && "bg-slate-50/80 -mx-6 px-10 border-b-0 rounded-xl"
    )}>
      <div className="flex items-center gap-3 min-w-[100px]">
        <div className="w-8 h-8 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-black text-[#1E293B] tracking-tight uppercase">
            {label}
          </span>
          {(isAsr || isIsha) && <span className="text-[#64748B] font-bold text-[8px] uppercase tracking-widest opacity-60">Hanafi</span>}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-end gap-1">
        <div className="flex items-center gap-1 font-mono text-sm font-black tracking-tight text-[#1E293B]">
          {formatTime(time)}
        </div>
        
        {isFajr && (
          <div className="flex items-center gap-1.5 text-[#64748B] text-[10px] font-bold">
            <span className="text-[#CBD5E1]">|</span>
            <span className="uppercase tracking-tighter opacity-70">SunRise</span>
            <span className="font-mono text-[11px]">{formatTime(times.sunrise)}</span>
          </div>
        )}
      </div>

      <div className="w-5 h-5 flex items-center justify-center ml-2">
          <div className="border-l-[6px] border-l-[#1E293B] border-y-[4px] border-y-transparent ml-1" />
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

function LocationTab({ setLocation, setLocationName, location, locationName }: { setLocation: (l: LocationParams) => void, setLocationName: (n: string) => void, location: LocationParams | null, locationName: string | null }) {
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
      async (position) => {
        const { latitude, longitude } = position.coords;
        const params: LocationParams = {
          lat: latitude,
          lon: longitude,
          elev: 0,
          tz: Math.round(longitude / 15),
          pressure: 1013.25,
          temperature: 20
        };
        setLocation(params);
        
        // Reverse Geocoding
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.suburb || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          setLocationName(city);
          localStorage.setItem('celestial_location', JSON.stringify({ params, name: city }));
        } catch (e) {
          setLocationName(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          localStorage.setItem('celestial_location', JSON.stringify({ params, name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` }));
        }
        
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
      lat,
      lon,
      elev: location?.elev || 0,
      tz: Math.round(lon / 15),
      pressure: location?.pressure || 1013.25,
      temperature: location?.temperature || 20
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
    const newParams = { 
      lat: location?.lat || 0,
      lon: location?.lon || 0,
      elev: location?.elev || 0,
      tz: location?.tz || 0,
      pressure: location?.pressure || 1013.25,
      temperature: location?.temperature || 20,
      ...location, 
      [field]: num 
    };
    setLocation(newParams);
    localStorage.setItem('celestial_location', JSON.stringify({ params: newParams, name: locationName }));
  };

  return (
    <div className="panel-card p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">Geographic Data</h3>
          <p className="text-[#94A3B8] text-xs md:text-sm">Configure coordinates for high-precision calculations.</p>
        </div>
        <button 
          onClick={() => setIsManual(!isManual)}
          className={cn(
            "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all w-full sm:w-auto",
            isManual ? "bg-[#38BDF8] text-[#0F172A]" : "bg-white/5 text-[#94A3B8] hover:bg-white/10"
          )}
        >
          {isManual ? 'Hide Manual' : 'Manual Entry'}
        </button>
      </div>
      
      {!isManual ? (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city or landmark..." 
                className="w-full bg-[#0F172A] border border-[#94A3B8]/20 rounded-xl py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-[#38BDF8] transition-colors"
              />
              {loading && <RefreshCw size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#38BDF8]" />}
            </div>
            <button 
              onClick={detectLocation}
              disabled={loading}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group shrink-0"
            >
              <MapPin size={16} className="text-[#38BDF8]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Detect Me</span>
            </button>
          </div>

          {results.length > 0 && (
            <div className="bg-[#0F172A] border border-[#94A3B8]/20 rounded-xl overflow-hidden divide-y divide-[#94A3B8]/10 shadow-xl max-h-[300px] overflow-y-auto">
              {results.map((r, i) => (
                <button 
                  key={i}
                  onClick={() => selectLocation(r)}
                  className="w-full text-left p-4 hover:bg-[#38BDF8]/5 text-xs flex items-center gap-3 transition-colors"
                 >
                  <MapPin size={16} className="text-[#94A3B8] shrink-0" />
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
              value={locationName || ''}
              onChange={(e) => {
                setLocationName(e.target.value);
                if (location) localStorage.setItem('celestial_location', JSON.stringify({ params: location, name: e.target.value }));
              }}
              placeholder="e.g. My Home..." 
              className="w-full bg-[#0F172A] border border-[#94A3B8]/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <ManualInput label="Latitude" value={location?.lat || 0} onChange={(v) => updateManual('lat', v)} />
            <ManualInput label="Longitude" value={location?.lon || 0} onChange={(v) => updateManual('lon', v)} />
            <ManualInput label="Timezone" value={location?.tz || 0} onChange={(v) => updateManual('tz', v)} />
          </div>
        </div>
      )}

      {/* Advanced Parameters */}
      <div className="pt-8 border-t border-[#94A3B8]/10">
        <h4 className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-[0.2em] mb-6">Environment</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <ManualInput label="Elevation (m)" value={location?.elev || 0} onChange={(v) => updateManual('elev', v)} />
          <ManualInput label="Pressure (mbr)" value={location?.pressure ?? 1013.25} onChange={(v) => updateManual('pressure', v)} />
          <ManualInput label="Temperature (°C)" value={location?.temperature ?? 20} onChange={(v) => updateManual('temperature', v)} />
        </div>
      </div>
      {/* Environment Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[#94A3B8]/10 opacity-60">
        <div>
          <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-widest block mb-1">Current Lat</span>
          <span className="text-sm font-mono text-white/90 tabular-nums">{location?.lat?.toFixed(6) || '0.000000'}°</span>
        </div>
        <div>
          <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-widest block mb-1">Current Lon</span>
          <span className="text-sm font-mono text-white/90 tabular-nums">{location?.lon?.toFixed(6) || '0.000000'}°</span>
        </div>
        <div>
          <span className="text-[10px] text-[#94A3B8]/40 uppercase font-bold tracking-widest block mb-1">GMT Offset</span>
          <span className="text-sm font-mono text-white/90 tabular-nums">{location ? (location.tz >= 0 ? '+' : '') + location.tz : '+0'}:00</span>
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
