import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Sun, Moon, Menu, X, Activity, Bookmark } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useBookmarks } from '@/hooks/useBookmarks';
import { MobileMenu } from './MobileMenu';
import { NotificationBell } from './NotificationBell';
import { CommandPalette } from '@/components/search/CommandPalette';
import { CountryDropdown } from './CountryDropdown';
import { useCountry } from '@/context/CountryContext';

export const Header: React.FC = () => {
  const { actualTheme, toggleTheme } = useTheme();
  const { count: bookmarkCount } = useBookmarks();
  const { isPakistan } = useCountry();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();

  // Global Ctrl + K / Cmd + K keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Formatted Gregorian Date
  const todayFormatted = React.useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    return new Date().toLocaleDateString('en-PK', options);
  }, []);

  // Formatted Dynamic Islamic Hijri Date in Urdu
  const islamicDateFormatted = React.useMemo(() => {
    try {
      const formatter = new Intl.DateTimeFormat('ur-PK-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return formatter.format(new Date());
    } catch {
      return '';
    }
  }, []);

  // Enriched top main navigation categories prioritizing high-engagement Pakistani topics
  const mainCategories = [
    { name: '🇵🇰 Pakistan', slug: 'pakistan', isPriority: true },
    { name: '🏏 Cricket', slug: 'sports', isPriority: false },
    { name: '🏛️ Politics', slug: 'politics', isPriority: false },
    { name: '💰 Economy', slug: 'business', isPriority: false },
    { name: '🎬 Showbiz', slug: 'entertainment', isPriority: false },
    { name: 'Technology', slug: 'technology', isPriority: false },
    { name: 'World', slug: 'world', isPriority: false },
  ];

  return (
    <>
      {/* Topmost Regional & Utility Bar */}
      <div className="border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100/70 dark:bg-[#070A0E]/90 text-[11px] py-1 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Left: Country / Edition Switcher */}
          <div className="flex items-center gap-3">
            <CountryDropdown variant="full" />
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
            <span className="hidden md:inline text-neutral-500 dark:text-neutral-400 font-medium">
              {todayFormatted}
            </span>
            {isPakistan && islamicDateFormatted && (
              <span className="hidden lg:inline text-emerald-600 dark:text-emerald-400 font-urdu text-xs">
                ({islamicDateFormatted})
              </span>
            )}
          </div>

          {/* Right: Live Ticker shortcut & Audio Bulletin Tag */}
          <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 font-medium">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              24/7 Verified Wire
            </span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#0B0F14]/95 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-5 lg:gap-7">
              <Link to="/" className="flex items-center gap-2.5 group select-none">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-neutral-950 dark:text-white leading-none">
                    PULSE<span className="text-blue-600 dark:text-blue-400">NEWS</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                    {isPakistan ? 'Pakistan & Global Wire' : 'Global Wire'}
                  </span>
                </div>
              </Link>

              {/* Desktop Category Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                {mainCategories.map((cat) => {
                  const isActive = location.pathname === `/category/${cat.slug}`;
                  return (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
                        isActive
                          ? cat.isPriority
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 font-bold shadow-sm'
                            : 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 font-bold'
                          : cat.isPriority
                          ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                          : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Saved Reading List */}
              <Link
                to="/saved"
                className="relative flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="View saved articles"
                title="Saved Articles"
              >
                <Bookmark className="w-4.5 h-4.5" />
                {bookmarkCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                    {bookmarkCount}
                  </span>
                )}
              </Link>

              {/* Search Shortcut & Spotlight (Ctrl + K) */}
              <button
                onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Search articles (Ctrl + K)"
                title="Search stories (Ctrl + K)"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline text-xs font-medium">Search</span>
                <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200/80 dark:bg-neutral-800 text-neutral-500">
                  ⌘K
                </kbd>
              </button>

              {/* Real-time Breaking Alerts Bell */}
              <NotificationBell />

              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Toggle dark/light mode"
                title={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {actualTheme === 'dark' ? (
                  <Sun className="w-4.5 h-4.5 text-amber-400" />
                ) : (
                  <Moon className="w-4.5 h-4.5 text-neutral-700" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Open mobile navigation menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette (Ctrl + K) */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Mobile Drawer */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

