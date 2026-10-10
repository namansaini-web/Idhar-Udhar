import React, { useState } from 'react';
import { Listing, CategoryType, UserProfile } from '../types';
import { ItemVisual } from './ItemVisual';
import { getSellerReputation } from '../data/reputation';
import { 
  Search, 
  BookOpen, 
  Store, 
  PenTool, 
  Laptop, 
  Sparkles,
  Maximize2,
  Dumbbell,
  Headphones,
  SlidersHorizontal,
  Flame,
  ShieldCheck
} from 'lucide-react';

interface MarketplaceFeedProps {
  listings: Listing[];
  currentUser: UserProfile;
  onSelectListing: (listing: Listing) => void;
  onOpenSearch: () => void;
  onSelectCategory: (category: CategoryType) => void;
  onOpenFullPhoto?: (listing: Listing) => void;
}

export const MarketplaceFeed: React.FC<MarketplaceFeedProps> = ({
  listings,
  currentUser,
  onSelectListing,
  onOpenSearch,
  onSelectCategory,
  onOpenFullPhoto,
}) => {
  const [selectedCat, setSelectedCat] = useState<CategoryType | 'All'>('All');

  const categories: { label: CategoryType; icon: React.ReactNode; bg: string; color: string }[] = [
    { label: 'Books', icon: <BookOpen className="w-5 h-5 text-[#4F46E5] dark:text-cyan-400" />, bg: 'bg-[#EEF2FF] dark:bg-slate-800', color: 'text-[#4F46E5] dark:text-cyan-400' },
    { label: 'Drafters & Tools', icon: <PenTool className="w-5 h-5 text-[#4F46E5] dark:text-cyan-400" />, bg: 'bg-[#EEF2FF] dark:bg-slate-800', color: 'text-[#4F46E5] dark:text-cyan-400' },
    { label: 'Lab Gear', icon: <Store className="w-5 h-5 text-[#4F46E5] dark:text-cyan-400" />, bg: 'bg-[#EEF2FF] dark:bg-slate-800', color: 'text-[#4F46E5] dark:text-cyan-400' },
    { label: 'Electronics', icon: <Laptop className="w-5 h-5 text-[#4F46E5] dark:text-cyan-400" />, bg: 'bg-[#EEF2FF] dark:bg-slate-800', color: 'text-[#4F46E5] dark:text-cyan-400' },
    { label: 'Sports and Fitness', icon: <Dumbbell className="w-5 h-5 text-[#4F46E5] dark:text-cyan-400" />, bg: 'bg-[#EEF2FF] dark:bg-slate-800', color: 'text-[#4F46E5] dark:text-cyan-400' },
    { label: 'Accessories', icon: <Headphones className="w-5 h-5 text-[#4F46E5] dark:text-cyan-400" />, bg: 'bg-[#EEF2FF] dark:bg-slate-800', color: 'text-[#4F46E5] dark:text-cyan-400' },
    { label: 'Other', icon: <Sparkles className="w-5 h-5 text-[#4F46E5] dark:text-cyan-400" />, bg: 'bg-[#EEF2FF] dark:bg-slate-800', color: 'text-[#4F46E5] dark:text-cyan-400' },
  ];

  const displayedListings = selectedCat === 'All' 
    ? listings 
    : listings.filter(l => l.category === selectedCat);

  return (
    <div className="w-full space-y-6 pb-12 select-none">
      {/* 1. Search Bar */}
      <div className="px-5 pt-3">
        <div 
          onClick={onOpenSearch}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#F1F5F9] dark:bg-slate-800/80 hover:bg-[#E2E8F0]/70 dark:hover:bg-slate-700/80 rounded-2xl cursor-pointer transition-colors border border-transparent dark:border-slate-700 shadow-2xs"
        >
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 font-normal truncate">
            Search books, drafters, sports, electronics...
          </span>
        </div>
      </div>

      {/* 2. Browse Categories with Sports & Fitness, Accessories, Other */}
      <div className="px-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white flex items-center gap-1.5">
            <span>Browse Categories</span>
            {selectedCat !== 'All' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-cyan-400 font-bold">
                {selectedCat}
              </span>
            )}
          </h2>
          {selectedCat !== 'All' ? (
            <button 
              onClick={() => {
                setSelectedCat('All');
                onSelectCategory('Books'); // reset filter
              }} 
              className="text-xs text-[#4F46E5] dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
            >
              Clear filter
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-medium">UIET verified</span>
          )}
        </div>

        {/* Scrollable / Multi-row Categories Grid */}
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
          <button
            onClick={() => {
              setSelectedCat('All');
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer shrink-0"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              selectedCat === 'All'
                ? 'bg-[#4F46E5] dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:scale-105 border border-transparent dark:border-slate-700'
            }`}>
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-semibold text-center leading-tight whitespace-nowrap ${
              selectedCat === 'All' ? 'text-[#4F46E5] dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}>
              All Items
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCat === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  setSelectedCat(isSelected ? 'All' : cat.label);
                  onSelectCategory(cat.label);
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer shrink-0"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-[#4F46E5] dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md scale-105' 
                    : `${cat.bg} group-hover:scale-105 shadow-2xs border border-transparent dark:border-slate-700`
                }`}>
                  {React.isValidElement(cat.icon) ? (
                    React.cloneElement(cat.icon as React.ReactElement<any>, {
                      className: `w-5 h-5 ${isSelected ? 'text-white dark:text-slate-950' : 'text-[#4F46E5] dark:text-cyan-400'}`
                    })
                  ) : cat.icon}
                </div>
                <span className={`text-[11px] font-semibold text-center leading-tight whitespace-nowrap max-w-[80px] truncate ${
                  isSelected ? 'text-[#4F46E5] dark:text-cyan-400 font-bold' : 'text-slate-600 dark:text-slate-300'
                }`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Hot Deals Banner */}
      <div className="px-5">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#6366F1] via-[#5A58EC] to-[#4F46E5] dark:from-[#312E81] dark:via-[#1E1B4B] dark:to-[#0F172A] dark:border dark:border-indigo-500/30 p-5 text-white overflow-hidden shadow-lg">
          <div className="relative z-10 space-y-1 max-w-[80%]">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-300 uppercase tracking-wide">
              <Flame className="w-3.5 h-3.5 fill-amber-300" />
              <span>Campus Moving Out Sale</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Pre-Loved Semester Gear
            </h3>
            <p className="text-xs text-indigo-100 dark:text-slate-300 font-medium leading-relaxed">
              Direct handovers at Nescafe Booth & UIET Hostels.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Recently Listed with Full Photo Button (Requirement B) */}
      <div className="px-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white">
            Recently Listed ({displayedListings.length})
          </h2>
          <button 
            onClick={onOpenSearch} 
            className="text-xs text-[#4F46E5] dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
          >
            Search feed
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {displayedListings.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectListing(item)}
              className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-800 p-2.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              {/* Media area with Full Photo Button & Condition Badge */}
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <ItemVisual
                  title={item.title}
                  category={item.category}
                  tags={item.tags}
                  imageUrl={item.imageUrl}
                  className="w-full h-full"
                />

                {/* Requirement B: Button on the photo to view the full uncropped photo */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenFullPhoto?.(item);
                  }}
                  className="absolute top-2 left-2 z-10 px-2 py-1 rounded-lg bg-black/65 hover:bg-black/90 text-white backdrop-blur-xs text-[10px] font-bold shadow-md flex items-center gap-1 transition-all cursor-pointer border border-white/20 active:scale-95"
                  title="View full uncropped photo"
                >
                  <Maximize2 className="w-3 h-3 text-cyan-300" />
                  <span className="hidden sm:inline">Full View</span>
                </button>

                {/* Badge top-right: Condition */}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 shadow-xs border border-slate-100 dark:border-slate-700">
                    {item.condition}
                  </span>
                </div>
              </div>

              {/* Card Meta */}
              <div className="pt-2.5 px-1 space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#4F46E5] dark:group-hover:text-cyan-400 transition-colors truncate">
                  {item.title}
                </h4>

                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-[#2563EB] dark:text-cyan-400">
                    ₹{item.price.toLocaleString('en-IN')}
                    {item.listingType === 'rent' && (
                      <span className="text-[10px] text-slate-400 font-normal">/{item.rentPeriod || 'mo'}</span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 truncate max-w-[80px]">
                    {item.hostelName.replace(' Bhawan', '')}
                  </span>
                </div>

                {/* Cost price savings tag if available */}
                {item.originalCostPrice && item.originalCostPrice > item.price && (
                  <div className="flex items-center gap-1.5 text-[10px] pt-0.5">
                    <span className="text-slate-400 line-through font-mono">₹{item.originalCostPrice}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold font-mono text-[9px] bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded">
                      -{Math.round(((item.originalCostPrice - item.price) / item.originalCostPrice) * 100)}%
                    </span>
                  </div>
                )}

                {/* TRUSTWORTHY SELLER Tag */}
                {getSellerReputation(item.sellerId).isTrustworthy && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[9px] font-black uppercase tracking-wider">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                      <span>TRUSTWORTHY SELLER</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
