import React from 'react';
import { CategoryType } from '../types';
import { BookOpen, Store, PenTool, Laptop, ShoppingBag, Home, Dumbbell, Headphones, Sparkles } from 'lucide-react';

interface ItemVisualProps {
  title: string;
  category: CategoryType;
  tags?: string[];
  imageUrl?: string;
  className?: string;
}

export const ItemVisual: React.FC<ItemVisualProps> = ({ 
  title, 
  category, 
  tags = [], 
  imageUrl, 
  className = '' 
}) => {
  // If user provided a real uploaded photo, render it
  if (imageUrl) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-slate-100 flex items-center justify-center select-none ${className}`}>
        <img
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const lowerTitle = title.toLowerCase();

  // Determine icon & pastel styling matching user screenshots
  let bgColor = 'bg-[#EBF2FE]'; // Default pastel blue
  let iconColor = 'text-[#3B82F6]'; // Vibrant blue
  let iconType = 'drafter';

  if (category === 'Lab Gear' || lowerTitle.includes('lab') || lowerTitle.includes('coat')) {
    bgColor = 'bg-[#EDE9FE]'; // Pastel purple
    iconColor = 'text-[#6366F1]';
    iconType = 'bag';
  } else if (category === 'Books' || lowerTitle.includes('math') || lowerTitle.includes('book')) {
    bgColor = 'bg-[#FEF3C7]'; // Pastel warm amber
    iconColor = 'text-[#F59E0B]';
    iconType = 'book';
  } else if (category === 'Sports and Fitness' || lowerTitle.includes('gym') || lowerTitle.includes('cricket') || lowerTitle.includes('football')) {
    bgColor = 'bg-[#DCFCE7]'; // Pastel emerald
    iconColor = 'text-[#16A34A]';
    iconType = 'sports';
  } else if (category === 'Accessories' || lowerTitle.includes('backpack') || lowerTitle.includes('watch') || lowerTitle.includes('flask')) {
    bgColor = 'bg-[#FCE7F3]'; // Pastel pink / rose
    iconColor = 'text-[#DB2777]';
    iconType = 'accessories';
  } else if (lowerTitle.includes('kettle') || lowerTitle.includes('fan') || lowerTitle.includes('hostel')) {
    bgColor = 'bg-[#D1FAE5]'; // Pastel mint green
    iconColor = 'text-[#10B981]';
    iconType = 'home';
  } else if (category === 'Electronics' || lowerTitle.includes('laptop') || lowerTitle.includes('monitor') || lowerTitle.includes('mouse') || lowerTitle.includes('wifi')) {
    bgColor = 'bg-[#E0E7FF]'; // Pastel indigo
    iconColor = 'text-[#4F46E5]';
    iconType = 'laptop';
  } else if (category === 'Other') {
    bgColor = 'bg-[#F3E8FF]'; // Pastel purple
    iconColor = 'text-[#9333EA]';
    iconType = 'other';
  }

  return (
    <div className={`relative w-full h-full ${bgColor} flex items-center justify-center select-none rounded-xl ${className}`}>
      {iconType === 'drafter' && (
        <svg viewBox="0 0 64 64" className="w-1/2 h-1/2 drop-shadow-sm" fill="none">
          <path
            d="M20 38 L32 14 L44 38 L34 46 L30 46 Z"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            className={iconColor}
          />
          <circle cx="32" cy="30" r="3.5" fill="currentColor" className={iconColor} />
          <line x1="32" y1="34" x2="32" y2="44" stroke="currentColor" strokeWidth="3" className={iconColor} />
          <path
            d="M26 44 L38 52 L48 42 L36 34"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            className={iconColor}
          />
        </svg>
      )}

      {iconType === 'bag' && (
        <svg viewBox="0 0 64 64" className="w-1/2 h-1/2 drop-shadow-sm" fill="none">
          <rect
            x="16"
            y="22"
            width="32"
            height="32"
            rx="6"
            stroke="currentColor"
            strokeWidth="3.5"
            className={iconColor}
          />
          <path
            d="M24 26 C24 16, 40 16, 40 26"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            className={iconColor}
          />
          <circle cx="32" cy="38" r="4" stroke="currentColor" strokeWidth="3" className={iconColor} />
        </svg>
      )}

      {iconType === 'book' && (
        <BookOpen className={`w-1/2 h-1/2 ${iconColor} stroke-[2.5]`} />
      )}

      {iconType === 'sports' && (
        <Dumbbell className={`w-1/2 h-1/2 ${iconColor} stroke-[2.5]`} />
      )}

      {iconType === 'accessories' && (
        <Headphones className={`w-1/2 h-1/2 ${iconColor} stroke-[2.5]`} />
      )}

      {iconType === 'home' && (
        <Home className={`w-1/2 h-1/2 ${iconColor} stroke-[2.5]`} />
      )}

      {iconType === 'laptop' && (
        <Laptop className={`w-1/2 h-1/2 ${iconColor} stroke-[2.5]`} />
      )}

      {iconType === 'other' && (
        <Sparkles className={`w-1/2 h-1/2 ${iconColor} stroke-[2.5]`} />
      )}
    </div>
  );
};
