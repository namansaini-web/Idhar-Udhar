import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  className?: string;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  isDarkMode,
  onToggle,
  className = '',
}) => {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.06 }}
      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden shadow-xs ${
        isDarkMode
          ? 'bg-[#1E293B] hover:bg-[#334155] border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
          : 'bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#C7D2FE] text-[#4F46E5] shadow-[0_0_10px_rgba(79,70,229,0.15)]'
      } ${className}`}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Dark / Light Mode"
    >
      {/* Background ambient glow effect */}
      <span
        className={`absolute inset-0 rounded-2xl opacity-40 transition-opacity duration-300 pointer-events-none ${
          isDarkMode
            ? 'bg-gradient-to-tr from-cyan-500/20 to-indigo-500/30'
            : 'bg-gradient-to-tr from-amber-400/20 to-indigo-400/20'
        }`}
      />

      <AnimatePresence mode="wait" initial={false}>
        {isDarkMode ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="relative flex items-center justify-center"
          >
            <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cyan-300 fill-cyan-400/20 stroke-[2.2]" />
            {/* Tiny sparkling star */}
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
            </motion.span>
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="relative flex items-center justify-center"
          >
            <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 stroke-[2.2]" />
            {/* Rotating sun rays accent */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute inset-0 pointer-events-none opacity-40"
            >
              <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-amber-400 rounded-full" />
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-amber-400 rounded-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
