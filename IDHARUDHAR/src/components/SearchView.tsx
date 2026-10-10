import React, { useState, useMemo } from 'react';
import { Listing, UserProfile, CategoryType } from '../types';
import { ItemVisual } from './ItemVisual';
import { ChevronLeft, Search, Filter, User, MapPin } from 'lucide-react';

interface SearchViewProps {
  listings: Listing[];
  currentUser: UserProfile;
  initialQuery?: string;
  initialCategory?: CategoryType | 'All';
  onBack: () => void;
  onSelectListing: (listing: Listing) => void;
  onOpenFullPhoto?: (listing: Listing) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  listings,
  currentUser,
  initialQuery = '',
  initialCategory = 'All',
  onBack,
  onSelectListing,
  onOpenFullPhoto,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>(initialCategory);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const filteredResults = useMemo(() => {
    return listings.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(q));
        const matchesSeller = item.sellerName.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesSeller && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [listings, query, selectedCategory]);

  return (
    <div className="w-full space-y-4 px-5 py-3 select-none pb-12">
      {/* Search Header matching Screenshot 7 */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Search Input Box */}
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 rounded-2xl">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, labs..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Filter Button matching Screenshot 7 */}
        <button
          onClick={() => setFilterMenuOpen(!filterMenuOpen)}
          className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
            filterMenuOpen || selectedCategory !== 'All'
              ? 'bg-[#EEF2FF] dark:bg-cyan-950/40 border-[#4F46E5] dark:border-cyan-400 text-[#4F46E5] dark:text-cyan-400'
              : 'bg-[#F8FAFC] dark:bg-slate-800/80 border-[#E2E8F0] dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
          title="Filter category"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Category filter pills if filter opened */}
      {filterMenuOpen && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Books', 'Drafters & Tools', 'Lab Gear', 'Electronics', 'Sports and Fitness', 'Accessories', 'Other'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#4F46E5] dark:bg-cyan-500 text-white dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Results Header matching Screenshot 7: "Results (4)" */}
      <div className="pt-1">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Results ({filteredResults.length})
        </h3>
      </div>

      {/* Vertical List of Cards matching Screenshot 7 */}
      <div className="space-y-3 pb-8">
        {filteredResults.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectListing(item)}
            className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-800 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
          >
            {/* Left: Pastel Container with Icon or Photo */}
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 group/img">
              <ItemVisual
                title={item.title}
                category={item.category}
                tags={item.tags}
                imageUrl={item.imageUrl}
                className="w-full h-full"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFullPhoto?.(item);
                }}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                title="View full photo"
              >
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70">Full</span>
              </button>
            </div>

            {/* Center: Title, Tags, Seller & Hostel matching Screenshot 7 */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#4F46E5] dark:group-hover:text-cyan-400 transition-colors truncate">
                {item.title}
              </h4>

              {/* Tags row: e.g. "Stationery", "Like New" pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.tags[0] || item.category}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.condition}
                </span>
              </div>

              {/* Seller and Hostel */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate pt-0.5">
                <span className="flex items-center gap-1 truncate">
                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{item.sellerName}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{item.hostelName}</span>
                </span>
              </div>
            </div>

            {/* Right: Bold Blue Price matching Screenshot 7 */}
            <div className="shrink-0 text-right">
              <span className="text-base font-extrabold text-[#2563EB] dark:text-cyan-400">
                ₹{item.price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))}

        {filteredResults.length === 0 && (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No items found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Try searching for "drafter", "lab coat", or "kettle"</p>
          </div>
        )}
      </div>
    </div>
  );
};
