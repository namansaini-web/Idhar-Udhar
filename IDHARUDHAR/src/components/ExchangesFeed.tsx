import React, { useState } from 'react';
import { ExchangeSession, UserProfile } from '../types';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  KeyRound, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  Star,
  Sparkles
} from 'lucide-react';

interface ExchangesFeedProps {
  exchanges: ExchangeSession[];
  currentUser: UserProfile;
  onCompleteExchange: (id: string, code?: string) => boolean;
  onOpenMarketplace: () => void;
  onOpenRateSeller: (exchange: ExchangeSession) => void;
}

export const ExchangesFeed: React.FC<ExchangesFeedProps> = ({
  exchanges,
  currentUser,
  onCompleteExchange,
  onOpenMarketplace,
  onOpenRateSeller,
}) => {
  const [pinInputs, setPinInputs] = useState<Record<string, string>>({});
  const [pinErrors, setPinErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<Record<string, string>>({});

  const handleVerify = (exchange: ExchangeSession) => {
    const inputPin = pinInputs[exchange.id] || '';
    const success = onCompleteExchange(exchange.id, inputPin);
    if (success) {
      setSuccessMsg({ ...successMsg, [exchange.id]: 'Handover verified and marked successful on campus!' });
      setPinErrors({ ...pinErrors, [exchange.id]: '' });

      // If current user is buyer, prompt rating immediately
      if (currentUser.id === exchange.buyerId) {
        setTimeout(() => {
          onOpenRateSeller(exchange);
        }, 500);
      }
    } else {
      setPinErrors({ ...pinErrors, [exchange.id]: 'Invalid 4-digit handover passcode. Check with the other student!' });
    }
  };

  const handleDirectMarkSuccess = (exchange: ExchangeSession) => {
    const success = onCompleteExchange(exchange.id);
    if (success) {
      setSuccessMsg({ ...successMsg, [exchange.id]: 'Handover marked as successful on campus!' });
      if (currentUser.id === exchange.buyerId) {
        setTimeout(() => {
          onOpenRateSeller(exchange);
        }, 300);
      }
    }
  };

  return (
    <div className="w-full px-4 sm:px-5 py-4 space-y-4 select-none pb-12 transition-colors duration-200">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#4F46E5] via-[#4338CA] to-[#3730A3] dark:from-[#312E81] dark:via-[#1E1B4B] dark:to-[#0F172A] p-5 sm:p-6 text-white overflow-hidden shadow-md">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 dark:bg-cyan-950/60 border border-white/25 dark:border-cyan-500/30 text-[10px] font-bold text-white dark:text-cyan-300 uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 dark:text-cyan-400" />
              <span>Campus Handover Protocol</span>
            </div>

            <button
              onClick={onOpenMarketplace}
              className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#4F46E5] dark:text-slate-950 dark:bg-cyan-400 dark:hover:bg-cyan-300 font-bold text-xs shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              Explore Feed
            </button>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              In-Person Handover Sessions
            </h1>
            <p className="text-xs text-indigo-100 dark:text-slate-300 font-medium leading-relaxed mt-1">
              Meet peer-to-peer at campus landmarks. Complete handover, exchange the 4-digit code, and rate the seller to build trustworthiness!
            </p>
          </div>
        </div>
      </div>

      {/* Exchanges List */}
      <div className="space-y-4">
        {exchanges.map((ex) => {
          const isSeller = ex.sellerId === currentUser.id;
          const isBuyer = ex.buyerId === currentUser.id;
          const otherName = isSeller ? ex.buyerName : ex.sellerName;
          const otherPhone = isSeller ? ex.buyerPhone : ex.sellerPhone;
          const otherHostel = isSeller ? ex.buyerHostel : ex.sellerHostel;
          const otherRoom = isSeller ? ex.buyerRoom : ex.sellerRoom;
          const isCompleted = ex.status === 'completed';

          return (
            <div
              key={ex.id}
              className={`rounded-3xl p-5 border transition-all shadow-sm space-y-4 ${
                isCompleted
                  ? 'bg-white dark:bg-[#151A26] border-emerald-200 dark:border-emerald-900/60'
                  : 'bg-white dark:bg-[#151A26] border-slate-100 dark:border-slate-800'
              }`}
            >
              {/* Card Header: Status & Price */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide ${
                      isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-[#EEF2FF] dark:bg-cyan-950/50 text-[#4F46E5] dark:text-cyan-300 border border-indigo-100 dark:border-cyan-800/40'
                    }`}>
                      {isCompleted ? 'Handover Completed' : 'Meetup Scheduled'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isSeller ? 'Selling to' : 'Buying from'}:{' '}
                    <strong className="text-slate-800 dark:text-slate-100 font-bold">{otherName}</strong>
                    <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {otherHostel} ({otherRoom})
                    </span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-[#2563EB] dark:text-cyan-400 font-mono-numbers block">
                    ₹{ex.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {ex.listingType === 'rent' ? `Rent/${ex.rentPeriod || 'term'}` : 'Direct Purchase'}
                  </span>
                </div>
              </div>

              {/* Item Title */}
              <div className="pt-0.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {ex.listingTitle}
                </h3>
              </div>

              {/* Landmark & Time Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Meetup Landmark</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">{ex.campusLocation}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Scheduled Time</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">{ex.scheduledTime}</span>
                  </div>
                </div>
              </div>

              {/* Security PIN & Verification Box */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#4F46E5] dark:text-cyan-400" />
                    <span>Safety Passcode & Handover Status</span>
                  </span>
                  {isCompleted ? (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Handover Successful</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#4F46E5] dark:text-cyan-400 font-bold">
                      Pending Handover
                    </span>
                  )}
                </div>

                {!isCompleted ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {isSeller ? 'Share this PIN with buyer upon meetup:' : 'Enter seller passcode or mark complete:'}
                      </span>
                      <span className="font-mono font-black text-xl tracking-widest text-[#4F46E5] dark:text-cyan-400">
                        {ex.exchangeCode}
                      </span>
                    </div>

                    {/* Verification input & Mark Successful buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex flex-1 gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="4-digit code"
                          value={pinInputs[ex.id] || ''}
                          onChange={(e) => setPinInputs({ ...pinInputs, [ex.id]: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-center tracking-widest text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] dark:focus:border-cyan-400"
                        />
                        <button
                          onClick={() => handleVerify(ex)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                        >
                          Verify Code
                        </button>
                      </div>

                      {/* Quick Mark Handover Successful button */}
                      <button
                        onClick={() => handleDirectMarkSuccess(ex)}
                        className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-[#4F46E5] dark:text-cyan-400 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer text-center"
                      >
                        ✓ Mark Handover Done
                      </button>
                    </div>

                    {pinErrors[ex.id] && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {pinErrors[ex.id]}
                      </p>
                    )}
                    {successMsg[ex.id] && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{successMsg[ex.id]}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between border border-emerald-100 dark:border-emerald-900/50">
                      <span>✓ Item handed over successfully on campus grounds</span>
                      <span className="text-[10px] text-emerald-600 font-mono">Verified</span>
                    </div>

                    {/* RATING SECTION FOR COMPLETED HANDOVER */}
                    {isBuyer && !ex.buyerRating && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                            Rate {ex.sellerName}'s Handover
                          </span>
                          <span className="text-[10px] text-amber-700/80 dark:text-amber-400 block truncate">
                            Rate 4+ stars to help them become a "TRUSTWORTHY SELLER"
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenRateSeller(ex)}
                          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95 shrink-0 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Rate Seller</span>
                        </button>
                      </div>
                    )}

                    {ex.buyerRating && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          {isBuyer ? 'Your Rating for Seller:' : 'Buyer Rating Received:'}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          {'★'.repeat(ex.buyerRating)}
                          <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                            ({ex.buyerRating}/5)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Actions */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`https://wa.me/${otherPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hi ${otherName}! Regarding our campus handover for "${ex.listingTitle}" at ${ex.campusLocation}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${otherPhone}`}
                  className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-transparent dark:border-slate-700"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          );
        })}

        {exchanges.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-[#151A26] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No active handover sessions</p>
            <p className="text-xs text-slate-400">Schedule in-person exchanges when buying or renting college essentials.</p>
            <button
              onClick={onOpenMarketplace}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs cursor-pointer"
            >
              Browse Marketplace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
