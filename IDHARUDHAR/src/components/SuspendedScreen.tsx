import React, { useState } from 'react';
import { UserProfile, UserModerationRecord } from '../types';
import { 
  ShieldAlert, 
  LogOut, 
  Copy, 
  Check, 
  ExternalLink, 
  Phone, 
  AlertTriangle, 
  Clock, 
  Building, 
  User, 
  Edit3,
  HelpCircle,
  Lock
} from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';

interface SuspendedScreenProps {
  currentUser: UserProfile;
  moderationRecord?: UserModerationRecord;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SuspendedScreen: React.FC<SuspendedScreenProps> = ({
  currentUser,
  moderationRecord,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [adminPhone, setAdminPhone] = useState('9999999999');
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const cleanAdminPhone = adminPhone.replace(/\D/g, '').slice(-10) || '9999999999';

  const suspensionReason = 
    moderationRecord?.suspensionReason || 
    currentUser.suspensionReason || 
    'Proctorial sanction issued by Campus Administration';

  const suspensionDate = 
    moderationRecord?.suspendedAt || 
    currentUser.suspendedAt || 
    'Recent Session';

  const suspendedBy = moderationRecord?.suspendedBy || 'Chief Proctor Office';

  // Construct official WhatsApp appeal message
  const appealMessage = `Respected Campus Admin / Proctor,\n\nI am contacting you regarding my suspended account on the IDHAR UDHAR Campus Marketplace.\n\n👤 Student Name: ${currentUser.fullName}\n🆔 Roll Number: ${currentUser.rollNumber || 'N/A'}\n🏠 Hostel & Room: ${currentUser.hostelName} (${currentUser.roomNumber})\n📱 Registered Phone: ${currentUser.phone}\n🎓 Branch / Course: ${currentUser.course || 'UIET Kurukshetra'}\n⚠️ Sanction Reason: ${suspensionReason}\n\nI would like to request an appeal and review of my account to restore my marketplace permissions.\n\nThank you,\n${currentUser.fullName}`;

  const whatsappUrl = `https://wa.me/91${cleanAdminPhone}?text=${encodeURIComponent(appealMessage)}`;

  const handleCopyMessage = () => {
    navigator.clipboard?.writeText(appealMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 overflow-y-auto select-text relative">
      {/* Top Proctor Authority Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-rose-700 via-rose-800 to-red-900 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-200 font-bold block">
              Campus Proctor Sanction Protocol
            </span>
            <span className="text-xs font-black tracking-tight text-white block">
              UIET Kurukshetra University
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          <button
            type="button"
            onClick={onLogout}
            title="Log Out / Switch Account"
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 max-w-lg mx-auto w-full flex flex-col justify-between space-y-5">
        {/* Main Alert Card */}
        <div className="space-y-4">
          
          {/* Big Prominent Blocked Banner */}
          <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800/80 shadow-lg text-center space-y-3 relative overflow-hidden">
            {/* Background glowing indicator */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-red-600/10 blur-2xl pointer-events-none" />

            <div className="inline-flex p-3.5 rounded-2xl bg-rose-600 text-white shadow-md mx-auto animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            {/* Exact Required Message */}
            <div className="space-y-1">
              <div className="inline-block px-3 py-1 rounded-full bg-rose-200/80 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
                Access Prohibited · Screen Blocked
              </div>
              <h1 className="text-lg sm:text-xl font-black text-rose-700 dark:text-rose-400 tracking-tight leading-snug uppercase">
                YOU WERE SUSPENDED , PLEASE CONTACT ADMIN
              </h1>
              <p className="text-xs text-rose-600 dark:text-rose-300 font-medium max-w-sm mx-auto">
                Your account privileges on the campus trading network have been temporarily frozen by proctorial administration.
              </p>
            </div>

            {/* Suspension Reason Callout */}
            <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-left text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Official Reason
                </span>
                <span className="font-mono text-[10px] text-slate-400">{suspendedBy}</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-100 italic">
                "{suspensionReason}"
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <Clock className="w-3 h-3" />
                <span>Sanction Recorded: {suspensionDate}</span>
              </div>
            </div>
          </div>

          {/* Student Account Summary Card */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 text-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block">
              Suspended Student Profile
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold text-purple-700 dark:text-purple-300">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 block">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentUser.course} · {currentUser.hostelName} ({currentUser.roomNumber})
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-mono text-[10px] font-bold">
                Roll: {currentUser.rollNumber || 'N/A'}
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PRIMARY RESOLUTION: CONTACT ADMIN VIA WHATSAPP            */}
          {/* ========================================================= */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-green-950/40 border-2 border-emerald-400 dark:border-emerald-700 shadow-md space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {/* Official WhatsApp SVG Logo */}
                <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.075-1.055-.062-.317-.103-.703-.243-1.217-.468-2.157-.946-3.559-3.178-3.666-3.321-.107-.144-.875-1.164-.875-2.221 0-1.057.554-1.577.751-1.792.197-.215.429-.269.572-.269.144 0 .287.002.412.008.132.006.31-.05.484.368.179.429.608 1.486.662 1.594.054.108.09.233.018.376-.072.143-.108.233-.215.358-.107.126-.226.281-.323.377-.107.108-.219.225-.094.439.125.215.556.917 1.192 1.484.819.73 1.51.956 1.725 1.063.215.108.34.09.466-.054.125-.143.537-.627.68-842.144-.215.287-.179.483-.107.197.071 1.253.591 1.468.699.215.107.358.161.412.251.054.089.054.52-.09 925z" />
                    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.76.459 3.479 1.33 4.992l-1.413 5.163 5.289-1.387c1.458.796 3.107 1.216 4.784 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.039-5.176-2.925-7.062-1.887-1.886-4.395-2.923-7.068-2.923zm0 18.334h-.003c-1.499 0-2.969-.404-4.25-1.168l-.305-.181-3.155.827.842-3.076-.198-.315c-.838-1.334-1.28-2.884-1.28-4.48 0-4.606 3.748-8.354 8.356-8.354 2.231 0 4.33.87 5.908 2.449 1.579 1.578 2.448 3.676 2.448 5.908 0 4.607-3.749 8.355-8.356 8.355z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100 leading-tight">
                    Opt for WhatsApp to Contact Admin
                  </h2>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                    Send an appeal directly to Chief Proctor Admin
                  </p>
                </div>
              </div>

              {/* Toggle Admin Number custom edit */}
              <button
                type="button"
                onClick={() => setIsEditingPhone(!isEditingPhone)}
                className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingPhone ? 'Done' : 'Change No.'}</span>
              </button>
            </div>

            {/* Editable Admin Phone if customized */}
            {isEditingPhone ? (
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-300 dark:border-emerald-700 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Admin WhatsApp Mobile Number:
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400 font-bold">+91</span>
                  <input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="9999999999"
                    maxLength={10}
                    className="flex-1 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-900 dark:text-emerald-300 flex items-center justify-between font-mono px-2 py-1 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span>Proctor WhatsApp: +91 {cleanAdminPhone}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Verified Line</span>
              </div>
            )}

            {/* Main Action: Open WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2.5 transition-transform cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.075-1.055-.062-.317-.103-.703-.243-1.217-.468-2.157-.946-3.559-3.178-3.666-3.321-.107-.144-.875-1.164-.875-2.221 0-1.057.554-1.577.751-1.792.197-.215.429-.269.572-.269.144 0 .287.002.412.008.132.006.31-.05.484.368.179.429.608 1.486.662 1.594.054.108.09.233.018.376-.072.143-.108.233-.215.358-.107.126-.226.281-.323.377-.107.108-.219.225-.094.439.125.215.556.917 1.192 1.484.819.73 1.51.956 1.725 1.063.215.108.34.09.466-.054.125-.143.537-.627.68-.842.144-.215.287-.179.483-.107.197.071 1.253.591 1.468.699.215.107.358.161.412.251.054.089.054.52-.09.925z" />
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.76.459 3.479 1.33 4.992l-1.413 5.163 5.289-1.387c1.458.796 3.107 1.216 4.784 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.039-5.176-2.925-7.062-1.887-1.886-4.395-2.923-7.068-2.923zm0 18.334h-.003c-1.499 0-2.969-.404-4.25-1.168l-.305-.181-3.155.827.842-3.076-.198-.315c-.838-1.334-1.28-2.884-1.28-4.48 0-4.606 3.748-8.354 8.356-8.354 2.231 0 4.33.87 5.908 2.449 1.579 1.578 2.448 3.676 2.448 5.908 0 4.607-3.749 8.355-8.356 8.355z" />
              </svg>
              <span>Contact Admin on WhatsApp</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </a>

            {/* Quick Secondary Action: Copy Appeal Message */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Appeal Copied to Clipboard!' : 'Copy Appeal Text'}</span>
              </button>

              <a
                href={`tel:+91${cleanAdminPhone}`}
                className="py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Call Admin Office Directly"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Admin</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Instructions and Sign Out Option */}
        <div className="pt-2 pb-1 space-y-3">
          <div className="p-3 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>How account reactivation works</span>
            </div>
            <p className="leading-snug">
              Once you message the Proctor Office on WhatsApp with your student roll number, the Proctorial Board reviews the sanction and reactivates your account from the proctor administration console.
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out / Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
