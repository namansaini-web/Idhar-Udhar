import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { Store, MoreVertical, User, Plus, Search, LogOut, Bell, ShieldCheck, MapPin, ShieldAlert } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';

interface NavbarProps {
  currentUser: UserProfile;
  isDarkMode: boolean;
  isGuest?: boolean;
  onToggleDarkMode: () => void;
  onOpenProfile: () => void;
  onOpenCreateListing: () => void;
  onOpenSearch: () => void;
  onOpenCreateRequest: () => void;
  onOpenRequests?: () => void;
  onOpenExchanges?: () => void;
  onOpenAdminPanel?: () => void;
  onLogout: () => void;
  onSwitchUser?: (user: UserProfile) => void;
  onSwitchToGuest?: () => void;
  onRequireAuth?: (intent: 'sell' | 'general') => void;
  requestsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isDarkMode,
  isGuest = false,
  onToggleDarkMode,
  onOpenProfile,
  onOpenCreateListing,
  onOpenSearch,
  onOpenCreateRequest,
  onOpenRequests,
  onOpenExchanges,
  onOpenAdminPanel,
  onLogout,
  onSwitchUser,
  onSwitchToGuest,
  onRequireAuth,
  requestsCount = 0,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors duration-200">
      {/* Brand logo matching Screenshot 5 & 6 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-white p-0.5 flex items-center justify-center shadow-xs border border-slate-200 dark:border-slate-700">
            <img src="/ICON.png" alt="IDHAR UDHAR" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg font-black tracking-tight text-[#0F172A] dark:text-white uppercase">
            IDHAR-UDHAR
          </span>
        </div>

        {/* Hyper-local campus pill or Guest pill */}
        {isGuest ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Guest Mode (Browse Only)</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-[#4F46E5] dark:text-cyan-400" />
            <span className="truncate max-w-[140px]">{currentUser.hostelName}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400">{currentUser.collegeName.split(',')[0]}</span>
          </div>
        )}
      </div>

      {/* Top Right Controls: Animated Dark Mode Toggle & Three-dots Menu */}
      <div className="flex items-center gap-2">
        {/* Special Admin Proctor Panel Quick Button */}
        {currentUser?.isAdmin && onOpenAdminPanel && (
          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
            title="Open Chief Proctor & Moderator Panel"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Proctor Panel</span>
            <span className="sm:hidden">Admin</span>
          </button>
        )}

        {/* Quick Log In Button if in Guest Mode */}
        {isGuest && (
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <User className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
        )}

        {/* Animated Dark Mode Toggle Button at Top Right Corner */}
        <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />

        {/* Three dots menu matching Screenshot 5 & 6 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#EEF2FF] hover:bg-[#E0E7FF] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#4F46E5] dark:text-cyan-400 flex items-center justify-center transition-colors cursor-pointer border border-transparent dark:border-slate-700"
            title="Menu"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Popover matching Screenshot 6 */}
          {menuOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-700/80 rounded-2xl shadow-xl py-2 z-50 text-xs font-semibold text-slate-700 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
              {currentUser?.isAdmin && onOpenAdminPanel && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenAdminPanel();
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-left transition-colors cursor-pointer font-bold border-b border-purple-100 dark:border-purple-900/50"
                >
                  <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Proctor Moderation Panel</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenProfile();
                }}
                className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Profile ({currentUser.fullName.split(' ')[0]})</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (isGuest) {
                    onRequireAuth?.('sell');
                  } else {
                    onOpenCreateListing();
                  }
                }}
                className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>List an Item (Sell/Rent)</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Find an Item</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (isGuest) {
                    onRequireAuth?.('sell');
                  } else {
                    onOpenCreateRequest();
                  }
                }}
                className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-[#EEF2FF] dark:hover:bg-cyan-950/30 text-[#4F46E5] dark:text-cyan-400 text-left transition-colors cursor-pointer font-bold"
              >
                <Bell className="w-4 h-4 text-[#4F46E5] dark:text-cyan-400" />
                <span>Post Request Daalna</span>
              </button>

              {onOpenRequests && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenRequests();
                  }}
                  className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <span>Hostel Radar Feed</span>
                  </div>
                  {requestsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                      {requestsCount}
                    </span>
                  )}
                </button>
              )}

              {onOpenExchanges && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenExchanges();
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer text-emerald-700 dark:text-emerald-400"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Campus Handover Protocol</span>
                </button>
              )}

              <div className="h-px bg-slate-100 dark:bg-slate-700/80 my-1" />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 text-left transition-colors cursor-pointer font-bold"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>{isGuest ? 'Log In / Create Account' : 'Logout'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
