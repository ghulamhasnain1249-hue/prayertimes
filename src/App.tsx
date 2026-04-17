import React, { useState, useEffect, useMemo } from 'react';
import { 
  Moon, Sun, Clock, MapPin, Compass, 
  Menu, X, Info, Star, Download, RefreshCw, Calendar
} from 'lucide-react';
import { cn } from './lib/utils';
import { calculatePrayerTimes, type LocationParams } from './lib/prayer/engine';
import { format } from 'date-fns';
import { getHijriDate } from './lib/astronomy/hijri';

// Types and Constants
import { type Tab, type ThemeType } from './types';
import { THEMES } from './constants';

// Components
import { NavItem } from './components/common/NavItem';
import { LoadingView, DeniedView } from './components/layout/StateViews';
import { PrayerTab } from './components/tabs/PrayerTab';
import { LocationTab } from './components/tabs/LocationTab';
import { QiblaTab } from './components/tabs/QiblaTab';
import { ThemesTab } from './components/tabs/ThemesTab';
import { SunTab } from './components/tabs/SunTab';
import { MoonTab } from './components/tabs/MoonTab';
import { AuthorTab } from './components/tabs/AuthorTab';
import { UpdateTab } from './components/tabs/UpdateTab';
import { MonthlyTab } from './components/tabs/MonthlyTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('prayer');
  const [theme, setTheme] = useState<ThemeType>('default');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [juristicMethod, setJuristicMethod] = useState<'hanafi' | 'shaafi'>('hanafi');
  
  // PWA Installation State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }
  };

  const handleUpdateCheck = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update().then(() => {
            alert("Celestial update synchronized. Force refreshing engine...");
            window.location.reload();
          });
        } else {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  };
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied' | 'loading'>('loading');
  
  const [location, setLocation] = useState<LocationParams | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  // Frequency for time update
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

    const savedTheme = localStorage.getItem('alwaqt_theme');
    if (savedTheme) setTheme(savedTheme as ThemeType);
  }, []);

  useEffect(() => {
    if (permissionStatus === 'pending') {
      if (navigator.geolocation) {
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
          () => setPermissionStatus('denied')
        );
      } else {
        setPermissionStatus('denied');
      }
    }
  }, [permissionStatus]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('alwaqt_theme', theme);
  }, [theme]);

  const prayerTimes = useMemo(() => {
    if (!location) return null;
    const asrFactor = juristicMethod === 'hanafi' ? 2 : 1;
    const ishaAngle = juristicMethod === 'hanafi' ? 18 : 12;
    return calculatePrayerTimes(date, location, asrFactor, ishaAngle);
  }, [date, location, juristicMethod]);

  const hijriDate = useMemo(() => getHijriDate(date), [date]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (permissionStatus === 'loading' || (permissionStatus === 'pending' && !location)) {
    return <LoadingView />;
  }

  if (permissionStatus === 'denied' && !location) {
    return (
      <DeniedView 
        onMecca={() => {
          setLocation({ lat: 21.4225, lon: 39.8262, elev: 277, tz: 3, pressure: 1013.25, temperature: 20 });
          setLocationName('Masjid al-Haram, Mecca');
          setPermissionStatus('granted');
        }} 
      />
    );
  }

  if (!location || !locationName) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden text-[var(--text-main)] bg-[var(--bg-color)] font-sans">
      {/* Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      {/* Header */}
      <header className="h-16 lg:h-24 shrink-0 px-6 lg:px-12 flex items-center justify-between border-b border-[var(--border-color)]/20 z-30 bg-[var(--bg-color)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <button 
            className="p-3 -ml-3 text-[var(--text-dim)] hover:text-[var(--text-main)] lg:hidden transition-all active:scale-90"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          <div className="logo flex items-center gap-4 text-xl lg:text-3xl font-black tracking-tighter italic">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-[var(--accent-primary)] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
              <Star size={20} className="text-[var(--bg-color)] fill-current rotate-3" />
            </div>
            AL-WAQT
          </div>
        </div>

        <div className="location-info text-right hidden sm:block group">
          <div className="text-lg lg:text-xl font-black flex items-center justify-end gap-3 italic tracking-tight">
            <MapPin size={18} className="text-[var(--accent-primary)] animate-pulse" />
            {locationName.split(',')[0]}
          </div>
          <div className="text-[10px] lg:text-xs text-[var(--text-dim)] font-bold uppercase tracking-[0.2em] opacity-40">
            {format(date, 'EEEE, dd MMMM yyyy')}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-80 sidebar-glass transition-all duration-500 lg:relative lg:translate-x-0 border-r border-white/5 shadow-2xl lg:shadow-none",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full bg-[var(--bg-color)]/40 backdrop-blur-3xl">
            <div className="p-8 flex items-center justify-between lg:hidden border-b border-white/5">
              <div className="text-xl font-black tracking-tighter italic flex items-center gap-3">
                 <Star size={20} className="text-[var(--accent-primary)]" />
                 GUIDE
              </div>
              <button 
                onClick={toggleSidebar}
                className="p-3 bg-white/5 rounded-2xl text-[var(--text-dim)] hover:text-white transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-10 space-y-3 overflow-y-auto">
              <div className="px-5 pb-4">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-dim)] opacity-30">Prime Deck</span>
              </div>
              <NavItem 
                active={activeTab === 'prayer'} 
                icon={<Clock size={20} />} 
                label="Prayer Timings" 
                onClick={() => { setActiveTab('prayer'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                active={activeTab === 'monthly'} 
                icon={<Calendar size={20} />} 
                label="Monthly Atlas" 
                onClick={() => { setActiveTab('monthly'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                active={activeTab === 'location'} 
                icon={<MapPin size={20} />} 
                label="Spatial Data" 
                onClick={() => { setActiveTab('location'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                active={activeTab === 'qibla'} 
                icon={<Compass size={20} />} 
                label="Qibla Way" 
                onClick={() => { setActiveTab('qibla'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                active={activeTab === 'themes'} 
                icon={<Star size={20} />} 
                label="Visual Styles" 
                onClick={() => { setActiveTab('themes'); setIsSidebarOpen(false); }} 
              />
              
              <div className="pt-10 pb-4 px-5">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-dim)] opacity-30">Stellar Engine</span>
              </div>
              <NavItem 
                active={activeTab === 'sun'} 
                icon={<Sun size={20} />} 
                label="Solar Ephemeris" 
                onClick={() => { setActiveTab('sun'); setIsSidebarOpen(false); }} 
              />
              <NavItem 
                active={activeTab === 'moon'} 
                icon={<Moon size={20} />} 
                label="Lunar Dynamics" 
                onClick={() => { setActiveTab('moon'); setIsSidebarOpen(false); }} 
              />
              
              <div className="pt-10 pb-4 px-5">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-dim)] opacity-30">PWA Maintenance</span>
              </div>
              <NavItem 
                active={activeTab === 'update'} 
                icon={<Download size={20} />} 
                label="Update" 
                onClick={() => { setActiveTab('update'); setIsSidebarOpen(false); }} 
              />

              <div className="pt-10 pb-4 px-5">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-dim)] opacity-30">Information</span>
              </div>
              <NavItem 
                active={activeTab === 'author'} 
                icon={<Info size={20} />} 
                label="Engine Credits" 
                onClick={() => { setActiveTab('author'); setIsSidebarOpen(false); }} 
              />
            </nav>
            <div className="p-10 border-t border-white/5">
               <div className="text-[10px] font-black text-[var(--accent-primary)] tracking-[0.2em] uppercase mb-1">PRECISION v2.5.4</div>
               <div className="text-[9px] font-bold text-[var(--text-dim)]/30 uppercase tracking-widest">Powered by Celestial Logic</div>
            </div>
          </div>
        </aside>

        {/* Dynamic Route View */}
        <main className="flex-1 overflow-y-auto bg-[var(--bg-color)] scroll-smooth">
          <div className="h-full">
                {activeTab === 'prayer' ? (
                  <PrayerTab 
                    times={prayerTimes!} 
                    locationName={locationName} 
                    date={date} 
                    hijriDate={hijriDate} 
                    locationParams={location} 
                    toggleSidebar={toggleSidebar}
                    setActiveTab={setActiveTab}
                    juristicMethod={juristicMethod}
                    setJuristicMethod={setJuristicMethod}
                  />
                ) : (
                  <div className="p-6 md:p-14 max-w-5xl mx-auto pb-24">
                    {activeTab === 'location' && (
                      <LocationTab 
                        setLocation={setLocation} 
                        setLocationName={setLocationName} 
                        location={location} 
                        locationName={locationName}
                        onClose={() => setActiveTab('prayer')}
                      />
                    )}
                    {activeTab === 'sun' && <SunTab date={date} location={location} onClose={() => setActiveTab('prayer')} />}
                    {activeTab === 'moon' && <MoonTab date={date} location={location} onClose={() => setActiveTab('prayer')} />}
                    {activeTab === 'qibla' && <QiblaTab location={location} onClose={() => setActiveTab('prayer')} />}
                    {activeTab === 'themes' && (
                      <ThemesTab 
                        currentTheme={theme} 
                        setTheme={setTheme} 
                        onClose={() => setActiveTab('prayer')}
                      />
                    )}
                    {activeTab === 'author' && <AuthorTab onClose={() => setActiveTab('prayer')} />}
                    {activeTab === 'update' && (
                      <UpdateTab 
                        isStandalone={isStandalone}
                        deferredPrompt={deferredPrompt}
                        onInstall={handleInstallClick}
                        onUpdate={handleUpdateCheck}
                        onClose={() => setActiveTab('prayer')}
                      />
                    )}
                    {activeTab === 'monthly' && (
                      <MonthlyTab 
                        locationParams={location}
                        locationName={locationName}
                        onClose={() => setActiveTab('prayer')}
                        juristicMethod={juristicMethod}
                      />
                    )}
                  </div>
                )}
          </div>
        </main>
      </div>

      {/* Desktop Metrics Bar */}
      <footer className="h-14 shrink-0 px-12 hidden lg:flex items-center justify-between border-t border-[var(--border-color)]/10 bg-[var(--bg-color)]/95 text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[var(--accent-primary)]/5 rounded-full text-[var(--accent-primary)] font-black italic">
            ASTRO ENGINE v2.5.4 [STABLE]
          </div>
          <div className="opacity-30">Observer Coordinate Tracking: Active</div>
        </div>
        <div className="flex gap-8">
           <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> ICRS Synchronized</div>
           <div className="opacity-40 tracking-normal capitalize font-mono text-xs">UTC {location.tz >= 0 ? '+' : ''}{location.tz}:00 Offset</div>
        </div>
      </footer>
    </div>
  );
}
