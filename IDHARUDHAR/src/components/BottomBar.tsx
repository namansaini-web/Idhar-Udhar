import React from 'react';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';

interface BottomBarProps {
  currentTab: 'home' | 'search' | 'inbox' | 'profile';
  onSelectTab: (tab: 'home' | 'search' | 'inbox' | 'profile') => void;
  onOpenCreate: () => void;
  unreadInboxCount?: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreate,
  unreadInboxCount = 0,
}) => {
  return (
    <nav
      role="navigation"
      aria-label="Campus freeze pane navigation"
      className="shrink-0 sticky bottom-0 z-40 w-full mt-auto bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 px-4 py-2 sm:py-2.5 flex items-center justify-around select-none transition-colors duration-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
    >
      {/* 1. Home */}
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
          currentTab === 'home'
            ? 'text-[#4F46E5] dark:text-cyan-400'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5" strokeWidth={currentTab === 'home' ? 2.4 : 1.8} />
        <span className="text-[10px] font-semibold">Home</span>
      </button>

      {/* 2. Search */}
      <button
        onClick={() => onSelectTab('search')}
        className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
          currentTab === 'search'
            ? 'text-[#4F46E5] dark:text-cyan-400'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <Search className="w-5 h-5" strokeWidth={currentTab === 'search' ? 2.4 : 1.8} />
        <span className="text-[10px] font-semibold">Search</span>
      </button>

      {/* 3. Center Elevated FAB (+) matching Screenshots */}
      <div className="-mt-5">
        <button
          onClick={onOpenCreate}
          className="w-13 h-13 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 flex items-center justify-center shadow-[0_8px_20px_rgba(79,70,229,0.35)] dark:shadow-[0_8px_20px_rgba(6,182,212,0.35)] transition-transform active:scale-95 cursor-pointer"
          title="List an Item"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Inbox */}
      <button
        onClick={() => onSelectTab('inbox')}
        className={`relative flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
          currentTab === 'inbox'
            ? 'text-[#4F46E5] dark:text-cyan-400'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <MessageCircle className="w-5 h-5" strokeWidth={currentTab === 'inbox' ? 2.4 : 1.8} />
        <span className="text-[10px] font-semibold">Inbox</span>
        {unreadInboxCount > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#4F46E5] dark:bg-cyan-400" />
        )}
      </button>

      {/* 5. Profile */}
      <button
        onClick={() => onSelectTab('profile')}
        className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
          currentTab === 'profile'
            ? 'text-[#4F46E5] dark:text-cyan-400'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <User className="w-5 h-5" strokeWidth={currentTab === 'profile' ? 2.4 : 1.8} />
        <span className="text-[10px] font-semibold">Profile</span>
      </button>
    </nav>
  );
};
