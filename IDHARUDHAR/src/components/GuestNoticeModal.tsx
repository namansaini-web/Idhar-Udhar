import React from 'react';
import { ShieldCheck, Phone, User, X, ShoppingBag, MessageSquare, Plus } from 'lucide-react';

export type GuestActionIntent = 'buy' | 'sell' | 'message' | 'general';

interface GuestNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  intent?: GuestActionIntent;
  onNavigateToAuth: (mode: 'login' | 'signup') => void;
}

export const GuestNoticeModal: React.FC<GuestNoticeModalProps> = ({
  isOpen,
  onClose,
  intent = 'general',
  onNavigateToAuth,
}) => {
  if (!isOpen) return null;

  const getNoticeDetails = () => {
    switch (intent) {
      case 'buy':
        return {
          icon: <ShoppingBag className="w-6 h-6 text-[#4F46E5] dark:text-cyan-400" />,
          title: 'Login to Buy or Rent',
          desc: 'You are browsing in Guest Mode. To purchase or rent items and schedule safe campus handovers, please log in or create your student account.',
        };
      case 'sell':
        return {
          icon: <Plus className="w-6 h-6 text-[#4F46E5] dark:text-cyan-400" />,
          title: 'Login to List an Item',
          desc: 'You are browsing in Guest Mode. To post items for sale or rent to verified hostel students, please log in or register your account.',
        };
      case 'message':
        return {
          icon: <MessageSquare className="w-6 h-6 text-[#4F46E5] dark:text-cyan-400" />,
          title: 'Login to Message Students',
          desc: 'You are browsing in Guest Mode. To chat with sellers and coordinate hostel handovers, please log in or create your student account.',
        };
      default:
        return {
          icon: <ShieldCheck className="w-6 h-6 text-[#4F46E5] dark:text-cyan-400" />,
          title: 'Verified Student Access Required',
          desc: 'You are currently browsing as a guest. To buy, sell, or message campus students, please log in with your phone or register with your College Roll No.',
        };
    }
  };

  const { icon, title, desc } = getNoticeDetails();

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100 relative"
      >
        {/* Close X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with icon */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
            {icon}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#4F46E5] dark:text-cyan-400 font-mono block">
              CAMPUS GUEST NOTICE
            </span>
            <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white leading-snug">
              {title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {desc}
        </p>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToAuth('login');
            }}
            className="w-full py-3 px-4 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToAuth('signup');
            }}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <User className="w-3.5 h-3.5 text-[#4F46E5] dark:text-cyan-400" />
            <span>Create Account with Roll No.</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1 text-center text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer font-medium"
          >
            Keep Browsing as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
