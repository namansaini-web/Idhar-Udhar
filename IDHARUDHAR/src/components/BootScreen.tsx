import React from 'react';
import { motion } from 'motion/react';
import { 
  Store, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  PenTool, 
  Laptop, 
  Bike, 
  Eye,
  Dumbbell,
  Headphones,
  Calculator,
  FlaskConical
} from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';

interface BootScreenProps {
  onComplete: () => void;
  onContinueAsGuest: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ 
  onComplete,
  onContinueAsGuest,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  // Sleek floating icon bubbles (icon-only, no names or prices)
  const floatingIcons = [
    {
      id: 'icon-drafter',
      icon: <PenTool className="w-5 h-5 text-cyan-300" />,
      initialX: -140,
      initialY: -110,
      delay: 0.1,
      size: 'w-11 h-11',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.35)]',
    },
    {
      id: 'icon-laptop',
      icon: <Laptop className="w-5 h-5 text-indigo-200" />,
      initialX: 140,
      initialY: -100,
      delay: 0.25,
      size: 'w-11 h-11',
      glow: 'shadow-[0_0_15px_rgba(99,102,241,0.35)]',
    },
    {
      id: 'icon-book',
      icon: <BookOpen className="w-5 h-5 text-amber-300" />,
      initialX: -130,
      initialY: 80,
      delay: 0.4,
      size: 'w-11 h-11',
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.35)]',
    },
    {
      id: 'icon-bike',
      icon: <Bike className="w-5 h-5 text-emerald-300" />,
      initialX: 130,
      initialY: 85,
      delay: 0.55,
      size: 'w-11 h-11',
      glow: 'shadow-[0_0_15px_rgba(52,211,153,0.35)]',
    },
    {
      id: 'icon-sports',
      icon: <Dumbbell className="w-4 h-4 text-rose-300" />,
      initialX: -170,
      initialY: -20,
      delay: 0.35,
      size: 'w-9 h-9',
      glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]',
    },
    {
      id: 'icon-headphones',
      icon: <Headphones className="w-4 h-4 text-violet-300" />,
      initialX: 170,
      initialY: -10,
      delay: 0.45,
      size: 'w-9 h-9',
      glow: 'shadow-[0_0_12px_rgba(167,139,250,0.3)]',
    },
    {
      id: 'icon-calc',
      icon: <Calculator className="w-4 h-4 text-sky-300" />,
      initialX: -70,
      initialY: -150,
      delay: 0.2,
      size: 'w-9 h-9',
      glow: 'shadow-[0_0_12px_rgba(56,189,248,0.3)]',
    },
    {
      id: 'icon-flask',
      icon: <FlaskConical className="w-4 h-4 text-teal-300" />,
      initialX: 70,
      initialY: -150,
      delay: 0.3,
      size: 'w-9 h-9',
      glow: 'shadow-[0_0_12px_rgba(45,212,191,0.3)]',
    },
  ];

  return (
    <div
      className={`relative w-full h-full min-h-[600px] flex-1 flex flex-col justify-between items-center p-6 sm:p-8 overflow-hidden select-none transition-colors duration-500 ${
        isDarkMode
          ? 'bg-[#0A0A0A] text-slate-100'
          : 'bg-gradient-to-b from-[#4F46E5] via-[#4338CA] to-[#3730A3] text-white'
      }`}
    >
      {/* Dynamic Background Light Flares & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow orb 1 */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 25, 0],
            y: [0, -15, 0],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className={`absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl ${
            isDarkMode ? 'bg-cyan-500/20' : 'bg-indigo-300/30'
          }`}
        />

        {/* Glow orb 2 */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -25, 0],
            y: [0, 20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
          className={`absolute -bottom-20 -right-20 w-72 h-72 rounded-full blur-3xl ${
            isDarkMode ? 'bg-[#FF6D00]/15' : 'bg-pink-400/20'
          }`}
        />

        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Subtle Floating Sparkles */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -18, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + i * 0.7,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
            className="absolute pointer-events-none"
            style={{
              top: `${20 + i * 20}%`,
              left: `${15 + i * 22}%`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300/60" />
          </motion.div>
        ))}
      </div>

      {/* Top Bar with Verified Badge and Dark Mode Toggle */}
      <div className="w-full flex items-center justify-between z-20">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 dark:border-slate-700/60 text-[11px] font-bold text-white tracking-wide shadow-xs"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Student Exchange</span>
        </motion.div>

        {onToggleDarkMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
          </motion.div>
        )}
      </div>

      {/* Center Animated Brand Stage */}
      <div className="relative my-auto flex flex-col items-center justify-center z-10 py-6">
        {/* Floating Minimalist Icon Bubbles (Clean, no names or prices) */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          {floatingIcons.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.5, x: item.initialX * 0.8, y: item.initialY * 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: [item.initialX, item.initialX + 5, item.initialX],
                y: [item.initialY, item.initialY - 7, item.initialY],
              }}
              transition={{
                opacity: { duration: 0.6, delay: item.delay },
                scale: { duration: 0.6, delay: item.delay },
                x: { repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: item.delay },
                y: { repeat: Infinity, duration: 4, ease: 'easeInOut', delay: item.delay },
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className={`${item.size} rounded-2xl backdrop-blur-md border border-white/25 dark:border-slate-700/80 bg-white/15 dark:bg-slate-900/80 flex items-center justify-center ${item.glow} hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Center Brand Identity */}
        <div className="relative flex flex-col items-center text-center space-y-4">
          {/* Animated Concentric Rings */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.35, 1],
                opacity: [0.35, 0, 0.35],
              }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeOut' }}
              className="absolute w-28 h-28 rounded-3xl border-2 border-cyan-400/40 pointer-events-none"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.1, 0.5],
              }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeOut', delay: 0.3 }}
              className="absolute w-24 h-24 rounded-3xl border-2 border-indigo-300/50 pointer-events-none"
            />

            {/* Core Icon on Bootup Screen */}
            <motion.div
              initial={{ scale: 0, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => onComplete()}
              className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-white dark:bg-white p-2.5 shadow-[0_16px_36px_rgba(0,110,181,0.35)] cursor-pointer flex items-center justify-center border-2 border-white/80 dark:border-cyan-400/60 backdrop-blur-md"
            >
              <img
                src="/ICON.png"
                alt="IDHAR UDHAR"
                className="w-full h-full object-contain filter drop-shadow-xs select-none"
              />
            </motion.div>
          </div>

          {/* Typography with New Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-2 max-w-xs sm:max-w-md"
          >
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase drop-shadow-sm font-sans">
              IDHAR-UDHAR
            </h1>

            {/* Tagline updated per user instruction */}
            <div className="inline-block px-3.5 py-1 rounded-full bg-white/10 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 dark:border-slate-700/60 shadow-xs">
              <span className="text-xs sm:text-sm font-black tracking-widest text-cyan-200 dark:text-cyan-300 uppercase">
                FOR STUDENTS BY STUDENTS
              </span>
            </div>

            <p className="text-xs sm:text-sm text-indigo-100/90 dark:text-slate-300 font-medium leading-relaxed px-4 pt-1">
              Buy, sell, and rent campus essentials with fellow students directly.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Controls: Clean and direct */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full max-w-sm space-y-2.5 z-20"
      >
        {/* Get Started Button - Proceeds directly to Login Page */}
        <motion.button
          onClick={() => onComplete()}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          className="relative w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer overflow-hidden group bg-white text-[#4F46E5] hover:bg-slate-50 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
        >
          <motion.span
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
          />

          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Guest Mode Button - Exactly "Browse As Guest" */}
        <button
          type="button"
          onClick={onContinueAsGuest}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 dark:border-slate-700/60 shadow-xs"
        >
          <Eye className="w-3.5 h-3.5 text-cyan-300" />
          <span>Browse As Guest</span>
        </button>
      </motion.div>
    </div>
  );
};
