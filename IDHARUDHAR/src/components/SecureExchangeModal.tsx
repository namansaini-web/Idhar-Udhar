import React, { useState } from 'react';
import { Listing, UserProfile, ExchangeSession } from '../types';
import { COLLEGES } from '../data/colleges';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface SecureExchangeModalProps {
  listing: Listing;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onConfirmExchange: (session: ExchangeSession) => void;
}

export const SecureExchangeModal: React.FC<SecureExchangeModalProps> = ({
  listing,
  currentUser,
  isOpen,
  onClose,
  onConfirmExchange,
}) => {
  const currentCollege = COLLEGES.find(c => c.id === listing.collegeId) || COLLEGES[0];
  const safeSpots = currentCollege.safeMeetupSpots;

  const [selectedSpot, setSelectedSpot] = useState(safeSpots[0] || 'Hostel Common Room');
  const [meetingTime, setMeetingTime] = useState('Today at 5:30 PM (Post Classes)');
  const [exchangePin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  if (!isOpen) return null;

  const handleStartExchange = () => {
    const session: ExchangeSession = {
      id: `exch-${Date.now()}`,
      listingId: listing.id,
      listingTitle: listing.title,
      price: listing.price,
      listingType: listing.listingType,
      rentPeriod: listing.rentPeriod,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      sellerPhone: listing.sellerPhone,
      sellerHostel: listing.hostelName,
      sellerRoom: listing.roomNumber,
      buyerId: currentUser.id,
      buyerName: currentUser.fullName,
      buyerPhone: currentUser.phone,
      buyerHostel: currentUser.hostelName,
      buyerRoom: currentUser.roomNumber,
      campusLocation: selectedSpot,
      exchangeCode: exchangePin,
      scheduledTime: meetingTime,
      status: 'scheduled',
      createdAt: 'Just now'
    };

    onConfirmExchange(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-slate-800 dark:text-slate-100 max-h-[92vh] overflow-y-auto select-none transition-colors duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-400 font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Shipping Campus Protocol</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A] dark:text-white">
            Schedule Secure Campus Meetup
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Meet directly on university grounds to inspect and hand over the item with zero shipping fees.
          </p>
        </div>

        {/* Item Summary Box */}
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Item for Exchange</span>
            <span className="font-extrabold text-sm text-[#2563EB] dark:text-cyan-400">
              ₹{listing.price.toLocaleString('en-IN')} {listing.listingType === 'rent' ? `/${listing.rentPeriod}` : ''}
            </span>
          </div>
          <p className="text-sm font-bold text-[#0F172A] dark:text-white line-clamp-1">{listing.title}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Seller: <strong className="text-slate-800 dark:text-slate-200">{listing.sellerName}</strong></span>
            <span>·</span>
            <span>{listing.hostelName}, {listing.roomNumber}</span>
          </div>
        </div>

        {/* Safe Campus Landmark Selection */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>Select Recommended Campus Landmark</span>
          </label>
          <div className="space-y-2">
            {safeSpots.map((spot) => (
              <label
                key={spot}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedSpot === spot
                    ? 'bg-[#EEF2FF] dark:bg-cyan-950/40 border-[#4F46E5] dark:border-cyan-400 text-[#4F46E5] dark:text-cyan-300 font-bold shadow-xs'
                    : 'bg-[#F8FAFC] dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="campusSpot"
                  checked={selectedSpot === spot}
                  onChange={() => setSelectedSpot(spot)}
                  className="accent-[#4F46E5] dark:accent-cyan-400"
                />
                <span className="flex-1">{spot}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Scheduled Meetup Time */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#4F46E5] dark:text-cyan-400" />
            <span>Proposed Time Window</span>
          </label>
          <select
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="In 15 Minutes (Urgent Hostel Exchange)">In 15 Minutes (Urgent Hostel Exchange)</option>
            <option value="Today at 5:30 PM (Post Lab Classes)">Today at 5:30 PM (Post Lab Classes)</option>
            <option value="Tonight 8:30 PM (Hostel Canteen Time)">Tonight 8:30 PM (Hostel Canteen Time)</option>
            <option value="Tomorrow Morning 8:45 AM (Before Lectures)">Tomorrow Morning 8:45 AM (Before Lectures)</option>
            <option value="Custom Time (Coordinate on WhatsApp)">Custom Time (Coordinate on WhatsApp)</option>
          </select>
        </div>

        {/* 4-Digit Handover Verification Code */}
        <div className="p-3.5 rounded-2xl bg-[#EEF2FF] dark:bg-slate-900 border border-[#C7D2FE] dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#4F46E5] dark:text-cyan-400 uppercase tracking-wider font-bold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Campus Handover Passcode</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Share with seller upon physical inspection of the item
            </p>
          </div>
          <span className="text-2xl font-black font-mono tracking-widest text-[#4F46E5] dark:text-cyan-400 px-3 py-1 bg-white dark:bg-slate-800 rounded-xl border border-[#C7D2FE] dark:border-slate-700 shadow-xs">
            {exchangePin}
          </span>
        </div>

        {/* Safety Guidelines */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
            <span>Campus Safety Rule:</span>
          </div>
          <p>
            Always meet in designated campus public spots during daylight or canteen hours. Settle payment via cash/UPI only after testing the drafter or electronics.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartExchange}
            className="flex-1 py-3 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Campus Meetup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
