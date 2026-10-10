import React, { useState } from 'react';
import { Listing, UserProfile } from '../types';
import { ItemVisual } from './ItemVisual';
import { getSellerReputation } from '../data/reputation';
import { 
  ChevronLeft, 
  Clock, 
  Tag, 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  Handshake, 
  Phone, 
  Maximize2, 
  HelpCircle, 
  TrendingDown,
  Flag,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  UserX,
  Info,
  X
} from 'lucide-react';

interface ListingDetailModalProps {
  listing: Listing | null;
  currentUser: UserProfile;
  isOpen: boolean;
  isGuest?: boolean;
  onClose: () => void;
  onOpenChat: (listing: Listing) => void;
  onInitiateExchange: (listing: Listing) => void;
  onRequireAuth?: (intent: 'buy' | 'message') => void;
  onOpenFullPhoto?: (listing: Listing) => void;
  onReportListing?: (listing: Listing, reason: string, details?: string) => void;
  onAdminRemoveListing?: (listingId: string, reason?: string) => void;
  onAdminWarnUser?: (userId: string, reason: string) => void;
  onAdminSuspendUser?: (userId: string, suspended: boolean, reason?: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  currentUser,
  isOpen,
  isGuest = false,
  onClose,
  onOpenChat,
  onInitiateExchange,
  onRequireAuth,
  onOpenFullPhoto,
  onReportListing,
  onAdminRemoveListing,
  onAdminWarnUser,
  onAdminSuspendUser,
}) => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Admin moderation dialog states
  const [isAdminRemoveOpen, setIsAdminRemoveOpen] = useState(false);
  const [adminRemovalReason, setAdminRemovalReason] = useState('');
  const [isAdminWarnOpen, setIsAdminWarnOpen] = useState(false);
  const [adminWarnReason, setAdminWarnReason] = useState('');
  const [isAdminSuspendOpen, setIsAdminSuspendOpen] = useState(false);
  const [adminSuspendReason, setAdminSuspendReason] = useState('');

  if (!isOpen || !listing) return null;

  const handleAction = (intent: 'buy' | 'message', action: () => void) => {
    if (isGuest) {
      if (onRequireAuth) {
        onRequireAuth(intent);
      }
      return;
    }
    action();
  };

  const handleOpenReportDialog = () => {
    setReportSubmitted(false);
    setReportDetails('');
    setReportReason('spam');
    setIsReportDialogOpen(true);
  };

  const handleCloseReportDialog = () => {
    setIsReportDialogOpen(false);
    setReportSubmitted(false);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    if (onReportListing) {
      onReportListing(listing, reportReason, reportDetails);
    }
  };

  const REPORT_REASONS = [
    { id: 'spam', label: 'Spam, commercial advertisement, or duplicate post' },
    { id: 'inappropriate', label: 'Inappropriate, abusive, or offensive content / images' },
    { id: 'fake', label: 'Misleading price, counterfeit, or fake listing' },
    { id: 'prohibited', label: 'Prohibited campus item (hazards, exam cheating materials)' },
    { id: 'other', label: 'Other community guideline violation' },
  ];

  const hasDiscount = listing.originalCostPrice && listing.originalCostPrice > listing.price;
  const discountAmount = hasDiscount ? (listing.originalCostPrice! - listing.price) : 0;
  const discountPercent = hasDiscount ? Math.round((discountAmount / listing.originalCostPrice!) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md h-full sm:h-[92vh] bg-white dark:bg-[#0F172A] sm:rounded-3xl shadow-2xl overflow-y-auto flex flex-col justify-between select-none transition-colors duration-200">
        <div>
          {/* Top Image Area */}
          <div className="relative w-full h-72 sm:h-80 bg-[#EBF2FE] dark:bg-slate-900 flex items-center justify-center overflow-hidden group">
            {/* Back Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md flex items-center justify-center transition-colors cursor-pointer"
              title="Back"
            >
              <ChevronLeft className="w-6 h-6 -ml-0.5" />
            </button>

            {/* Top Right Action Buttons: View Full Photo & Report */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              {/* Report Listing Button on Image */}
              <button
                type="button"
                onClick={handleOpenReportDialog}
                className="px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-rose-950/90 text-rose-300 hover:text-rose-200 backdrop-blur-md text-xs font-bold shadow-lg flex items-center gap-1 transition-all cursor-pointer border border-rose-500/30 active:scale-95"
                title="Report Listing"
              >
                <Flag className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden xs:inline">Report</span>
              </button>

              {/* View Full Photo Button */}
              <button
                type="button"
                onClick={() => onOpenFullPhoto?.(listing)}
                className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer border border-white/20 active:scale-95"
                title="View entire uncropped photo"
              >
                <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
                <span>Full Photo</span>
              </button>
            </div>

            {/* Item Visual or Photo */}
            <div 
              className="w-full h-full cursor-pointer"
              onClick={() => onOpenFullPhoto?.(listing)}
              title="Click to maximize image"
            >
              <ItemVisual
                title={listing.title}
                category={listing.category}
                tags={listing.tags}
                imageUrl={listing.imageUrl}
                className="w-full h-full"
              />
            </div>

            {/* Tap to expand hint */}
            <div className="absolute bottom-3 right-3 z-10 pointer-events-none px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs text-[10px] text-white font-medium flex items-center gap-1">
              <Maximize2 className="w-2.5 h-2.5" />
              <span>Full photo view available</span>
            </div>
          </div>

          {/* Bottom Card Content Sheet */}
          <div className="p-6 space-y-4">
            {/* Header: Title and Price */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {listing.tags[0] || listing.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{listing.createdAt}</span>
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-extrabold text-[#2563EB] dark:text-cyan-400 block">
                  ₹{listing.price.toLocaleString('en-IN')}
                </span>
                {listing.listingType === 'rent' && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">/{listing.rentPeriod || 'mo'}</span>
                )}
                {/* Cost Price comparison & savings */}
                {hasDiscount && (
                  <div className="space-y-0.5 mt-0.5">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through block font-mono">
                      Cost: ₹{listing.originalCostPrice!.toLocaleString('en-IN')}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono">
                      <TrendingDown className="w-2.5 h-2.5" />
                      Save ₹{discountAmount} ({discountPercent}%)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Reason For Selling Banner */}
            {listing.reasonForSelling && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Reason For Selling</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  "{listing.reasonForSelling}"
                </p>
              </div>
            )}

            {/* Details Section */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Details & Condition</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Condition & Location Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0FDF4] dark:bg-emerald-950/40 border border-[#DCFCE7] dark:border-emerald-900/60 text-xs font-semibold text-[#15803D] dark:text-emerald-400">
                <Tag className="w-3.5 h-3.5" />
                <span>Condition: {listing.condition}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/40 border border-[#DBEAFE] dark:border-blue-900/60 text-xs font-semibold text-[#1D4ED8] dark:text-blue-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>Location: {listing.hostelName}</span>
              </div>
            </div>

            {/* SELLER INFORMATION & 3 CONTACT METHODS */}
            <div className="pt-2 space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                SELLER CONTACT & HOSTEL INFO
              </span>
              
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 space-y-3">
                <div 
                  onClick={() => handleAction('message', () => onOpenChat(listing))}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EDE9FE] dark:bg-indigo-950/60 flex items-center justify-center font-bold text-[#4F46E5] dark:text-cyan-400 text-sm">
                      {listing.sellerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#4F46E5] dark:group-hover:text-cyan-400 transition-colors">
                          {listing.sellerName}
                        </h4>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        {getSellerReputation(listing.sellerId).isTrustworthy && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[9px] font-black uppercase tracking-wider">
                            TRUSTWORTHY SELLER
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        UIET Kurukshetra • {listing.hostelName} • {listing.roomNumber}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-cyan-400">
                    Verified
                  </span>
                </div>

                {/* Direct Call & WhatsApp Contact Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <a
                    href={listing.sellerPhone ? `tel:${listing.sellerPhone.replace(/\D/g, '')}` : '#'}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                    title={`Direct Call: ${listing.sellerPhone}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#4F46E5] dark:text-cyan-400 shrink-0" />
                    <span>Direct Call</span>
                  </a>

                  <a
                    href={listing.sellerPhone ? `https://wa.me/91${listing.sellerPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                      `Hi ${listing.sellerName}! I saw your IDHAR-UDHAR listing for "${listing.title}" (₹${listing.price}) in ${listing.hostelName}. Is this still available?`
                    )}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                    title={`WhatsApp: ${listing.sellerPhone}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* ADMIN MODERATOR PRIVILEGES SECTION */}
            {currentUser?.isAdmin && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border-2 border-purple-300 dark:border-purple-800 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                    <span className="text-xs font-black text-purple-900 dark:text-purple-200 uppercase tracking-wide">
                      Chief Proctor Actions
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                    Admin Privilege
                  </span>
                </div>

                <p className="text-[11px] text-purple-800 dark:text-purple-300 leading-snug">
                  You have full moderation control. You can remove this item (explanation is optional), warn this seller, or suspend their account.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminRemovalReason('');
                      setIsAdminRemoveOpen(true);
                    }}
                    className="py-2 px-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-transform active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminWarnReason('');
                      setIsAdminWarnOpen(true);
                    }}
                    className="py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-transform active:scale-95"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Warn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminSuspendReason('');
                      setIsAdminSuspendOpen(true);
                    }}
                    className="py-2 px-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-transform active:scale-95"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspend</span>
                  </button>
                </div>
              </div>
            )}

            {/* Dedicated Report Listing Action Section */}
            <div className="pt-3 pb-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Notice inappropriate or spam content?</span>
              </div>
              <button
                type="button"
                onClick={handleOpenReportDialog}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <Flag className="w-3.5 h-3.5 text-rose-500" />
                <span>Report Listing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          <button
            onClick={() => handleAction('buy', () => onInitiateExchange(listing))}
            className="flex-1 py-3.5 px-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Handshake className="w-4 h-4 shrink-0" />
            <span className="truncate">{listing.listingType === 'rent' ? 'Rent Item' : 'Buy Now'} (₹{listing.price})</span>
          </button>

          <button
            onClick={() => handleAction('message', () => onOpenChat(listing))}
            className="flex-1 py-3.5 px-3 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">Message on App</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CONFIRMATION REPORT DIALOG FOR MODERATORS                       */}
      {/* ============================================================== */}
      {isReportDialogOpen && (
        <div 
          onClick={handleCloseReportDialog}
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100"
          >
            {!reportSubmitted ? (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                      <Flag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                        Report Listing
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Help keep UIET Kurukshetra student safe
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseReportDialog}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Target Listing Summary Banner */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Reporting Item
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {listing.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Listed by {listing.sellerName} · ₹{listing.price}
                  </p>
                </div>

                {/* Reason Selection Radio List */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Select Reason for Report
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {REPORT_REASONS.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          reportReason === r.id
                            ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 font-semibold'
                            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={r.id}
                          checked={reportReason === r.id}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="mt-0.5 text-rose-600 focus:ring-rose-500"
                        />
                        <span className="leading-snug">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Extra Details Textarea */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide any context for campus moderators..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                  />
                </div>

                {/* Notice text */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Submitted reports are reviewed confidentially by student moderators.</span>
                </div>

                {/* Dialog Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCloseReportDialog}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Report Submitted Success State */
              <div className="py-4 text-center space-y-3 animate-in zoom-in-95 duration-150">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    Report Submitted
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Thank you for helping keep IDHAR-UDHAR safe! Campus moderators will review "{listing.title}" shortly.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCloseReportDialog}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ============================================================== */}
      {/* ADMIN REMOVAL DIALOG (REASON IS COMPLETELY OPTIONAL)           */}
      {/* ============================================================== */}
      {isAdminRemoveOpen && (
        <div 
          onClick={() => setIsAdminRemoveOpen(false)}
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-[#0F172A] dark:text-white leading-tight">
                  Remove Listing from Campus
                </h4>
                <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {listing.title}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Explanation Policy</span>
              </div>
              <p className="leading-snug">
                Mentioning why it is getting removed is <strong>completely optional</strong>. You can remove this product without any explanation or message.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                Message / Reason (Completely Optional):
              </label>
              <textarea
                rows={2}
                value={adminRemovalReason}
                onChange={(e) => setAdminRemovalReason(e.target.value)}
                placeholder="e.g. Prohibited item, exam duplicate... (or leave empty)"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdminRemoveOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onAdminRemoveListing) {
                    onAdminRemoveListing(listing.id, adminRemovalReason.trim() || undefined);
                    setIsAdminRemoveOpen(false);
                    onClose();
                  }
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Removal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADMIN WARN USER DIALOG                                         */}
      {/* ============================================================== */}
      {isAdminWarnOpen && (
        <div 
          onClick={() => setIsAdminWarnOpen(false)}
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-[#0F172A] dark:text-white leading-tight">
                  Issue Warning to Seller
                </h4>
                <p className="text-[11px] text-slate-500">
                  {listing.sellerName}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                Reason for Proctorial Warning:
              </label>
              <textarea
                rows={3}
                value={adminWarnReason}
                onChange={(e) => setAdminWarnReason(e.target.value)}
                placeholder="e.g. Unresponsive to meetups, false condition rating, inappropriate listing title..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdminWarnOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!adminWarnReason.trim()}
                onClick={() => {
                  if (onAdminWarnUser && adminWarnReason.trim()) {
                    onAdminWarnUser(listing.sellerId, adminWarnReason.trim());
                    setIsAdminWarnOpen(false);
                  }
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Issue Warning</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADMIN SUSPEND USER DIALOG                                      */}
      {/* ============================================================== */}
      {isAdminSuspendOpen && (
        <div 
          onClick={() => setIsAdminSuspendOpen(false)}
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-[#0F172A] dark:text-white leading-tight">
                  Suspend Student Account
                </h4>
                <p className="text-[11px] text-slate-500">
                  {listing.sellerName}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-800 dark:text-rose-300">
              <p className="leading-snug">
                The student screen will be <strong>blocked</strong> upon login with message <em>"YOU WERE SUSPENDED , PLEASE CONTACT ADMIN"</em> and direct option to contact via WhatsApp.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                Reason for Suspension (Optional):
              </label>
              <textarea
                rows={2}
                value={adminSuspendReason}
                onChange={(e) => setAdminSuspendReason(e.target.value)}
                placeholder="e.g. Prohibited trading, failed handover... (or leave empty)"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdminSuspendOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onAdminSuspendUser) {
                    onAdminSuspendUser(listing.sellerId, true, adminSuspendReason.trim() || undefined);
                    setIsAdminSuspendOpen(false);
                    onClose();
                  }
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Confirm Suspend</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
