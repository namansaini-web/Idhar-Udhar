import React, { useState } from 'react';
import { Listing, CampusRequest, UserProfile } from '../types';
import { ItemVisual } from './ItemVisual';
import { getSellerReputation } from '../data/reputation';
import { 
  User, 
  ShieldCheck, 
  MapPin, 
  Edit3, 
  LogOut, 
  CheckCircle2, 
  Trash2,
  Tag,
  AlertTriangle,
  Star
} from 'lucide-react';

interface MyListingsViewProps {
  currentUser: UserProfile;
  listings: Listing[];
  requests: CampusRequest[];
  isGuest?: boolean;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onDeleteListing: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onToggleListingStatus: (id: string) => void;
  onOpenCreateListing: () => void;
  onOpenCreateRequest: () => void;
  onLogout: () => void;
  onRequireAuth?: (intent: 'sell' | 'general') => void;
}

export const MyListingsView: React.FC<MyListingsViewProps> = ({
  currentUser,
  listings,
  requests,
  isGuest = false,
  onUpdateUser,
  onDeleteListing,
  onDeleteRequest,
  onToggleListingStatus,
  onOpenCreateListing,
  onOpenCreateRequest,
  onLogout,
  onRequireAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'sold' | 'drafts'>('active');
  const [editingRoom, setEditingRoom] = useState(false);
  const [roomInput, setRoomInput] = useState(currentUser.roomNumber);

  const myListings = listings.filter(l => l.sellerId === currentUser.id);
  const activeListings = myListings.filter(l => l.status !== 'completed');
  const soldListings = myListings.filter(l => l.status === 'completed');

  const reputation = getSellerReputation(currentUser.id);

  const handleSaveRoom = () => {
    onUpdateUser({
      ...currentUser,
      roomNumber: roomInput,
    });
    setEditingRoom(false);
  };

  return (
    <div className="w-full bg-[#F8FAFC] dark:bg-[#0A0A0A] select-none pb-14 transition-colors duration-200">
      {/* 1. Curved Indigo Banner & Profile Card matching Screenshot 10 */}
      <div className="relative bg-[#4F46E5] dark:bg-gradient-to-r dark:from-[#312E81] dark:via-[#1E1B4B] dark:to-[#0F172A] text-white pt-8 pb-10 px-6 rounded-b-[36px] flex flex-col items-center text-center shadow-md">
        {/* Large Avatar Circle matching Screenshot 10 */}
        <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center mb-3 shadow-inner">
          <User className="w-12 h-12 text-white" strokeWidth={1.8} />
        </div>

        {/* User Name & Verified Badge */}
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black text-white">
            {currentUser.fullName}
          </h2>
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white" title="Verified Campus Student">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Course & Year */}
        <p className="text-xs text-indigo-100 dark:text-slate-300 font-medium mt-1">
          {currentUser.course || 'B.Tech CS'} • {currentUser.year || '2nd Year'}
        </p>

        {/* TRUSTWORTHY SELLER Badge if continuously rated 4+ stars for 10+ times */}
        {reputation.isTrustworthy && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>TRUSTWORTHY SELLER</span>
          </div>
        )}

        {/* Reputation mini stats */}
        {reputation.ratingsCount > 0 && (
          <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-indigo-100 dark:text-slate-300">
            <span className="flex items-center gap-0.5 font-bold">
              <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>{reputation.averageRating.toFixed(1)}</span>
              <span className="font-normal opacity-80">({reputation.ratingsCount} ratings)</span>
            </span>
            <span>•</span>
            <span className="font-medium">
              {reputation.consecutiveFourPlus} streak (4★+)
            </span>
          </div>
        )}

        {/* Hostel Location Pill matching Screenshot 10 */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
          <MapPin className="w-3 h-3 text-indigo-200 dark:text-cyan-300" />
          <span>{currentUser.hostelName}</span>
          <span>·</span>
          <span>{currentUser.roomNumber}</span>
          <button 
            onClick={() => setEditingRoom(!editingRoom)} 
            className="ml-1 text-indigo-200 hover:text-white cursor-pointer"
            title="Edit room"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        </div>

        {editingRoom && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-white text-slate-800 text-xs font-medium focus:outline-none"
              placeholder="e.g. Room 214"
            />
            <button
              onClick={handleSaveRoom}
              className="px-3 py-1 rounded-lg bg-white text-[#4F46E5] font-bold text-xs cursor-pointer"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Requirement: 1-Star Suspension Warning if seller rated 1 star for 5 times or more */}
      {reputation.hasOneStarWarning && (
        <div className="mx-5 mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500/50 text-rose-800 dark:text-rose-200 space-y-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wide text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Seller Account Notice</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-100 leading-snug">
            "You were constantly rated as 1, please review products to avoid suspension"
          </p>
          <div className="flex items-center justify-between text-[11px] text-rose-700 dark:text-rose-300 pt-1 border-t border-rose-200 dark:border-rose-900/60 font-medium">
            <span>Low ratings received: {reputation.oneStarCount} (1★)</span>
            <span className="underline">UIET Campus Marketplace Safety Rule</span>
          </div>
        </div>
      )}

      {/* 2. Segmented Pill Tabs matching Screenshot 10: Active (2) | Sold (5) | Drafts */}
      <div className="px-5 -mt-5 relative z-10">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-[#EEF2FF] dark:bg-slate-800 text-[#4F46E5] dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Active ({activeListings.length})
          </button>

          <button
            onClick={() => setActiveTab('sold')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'sold'
                ? 'bg-[#EEF2FF] dark:bg-slate-800 text-[#4F46E5] dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Sold ({soldListings.length})
          </button>

          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'drafts'
                ? 'bg-[#EEF2FF] dark:bg-slate-800 text-[#4F46E5] dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* 3. Items List matching Screenshot 10 */}
      <div className="p-5 space-y-3">
        {activeTab === 'active' && activeListings.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#1E293B] rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 group"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-50 dark:bg-slate-900">
              <ItemVisual
                title={item.title}
                category={item.category}
                tags={item.tags}
                imageUrl={item.imageUrl}
                className="w-full h-full"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-white truncate">
                {item.title}
              </h4>
              <span className="text-sm font-extrabold text-[#2563EB] dark:text-cyan-400 block">
                ₹{item.price.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {item.createdAt}
              </span>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <button
                onClick={() => onToggleListingStatus(item.id)}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/60 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Mark as Sold
              </button>
              <button
                onClick={() => onDeleteListing(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                title="Delete listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'sold' && soldListings.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#1E293B] rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 opacity-80 flex items-center justify-between gap-3"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-50 dark:bg-slate-900">
              <ItemVisual
                title={item.title}
                category={item.category}
                tags={item.tags}
                imageUrl={item.imageUrl}
                className="w-full h-full"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-white line-through text-slate-400">
                {item.title}
              </h4>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Sold for ₹{item.price}
              </span>
            </div>

            <button
              onClick={() => onToggleListingStatus(item.id)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold cursor-pointer"
            >
              Relist
            </button>
          </div>
        ))}

        {activeTab === 'active' && activeListings.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">You haven't listed any items for sale or rent yet.</p>
            <button
              onClick={onOpenCreateListing}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs cursor-pointer"
            >
              Post First Item
            </button>
          </div>
        )}

        {/* 4. Logout & Account Settings */}
        <div className="pt-4">
          <button
            onClick={onLogout}
            className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-rose-100 dark:border-rose-950/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out of Campus ID</span>
          </button>
        </div>
      </div>
    </div>
  );
};
