import React, { useState } from 'react';
import { ExchangeSession } from '../types';
import { 
  Star, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  ThumbsUp
} from 'lucide-react';

interface RateSellerModalProps {
  exchange: ExchangeSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRating: (exchangeId: string, sellerId: string, rating: number, reviewText: string) => void;
}

export const RateSellerModal: React.FC<RateSellerModalProps> = ({
  exchange,
  isOpen,
  onClose,
  onSubmitRating,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!isOpen || !exchange) return null;

  const quickTags = [
    'Item exactly as described',
    'On-time at meetup point',
    'Smooth & polite handover',
    'Great price for students',
    'Carefully handled item'
  ];

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullReview = [
      ...selectedTags,
      reviewText.trim()
    ].filter(Boolean).join('. ');

    onSubmitRating(exchange.id, exchange.sellerId, selectedRating, fullReview);
    onClose();
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return '⭐⭐⭐⭐⭐ Excellent (Supports "TRUSTWORTHY SELLER" status)';
      case 4:
        return '⭐⭐⭐⭐ Very Good (Supports "TRUSTWORTHY SELLER" status)';
      case 3:
        return '⭐⭐⭐ Average Experience';
      case 2:
        return '⭐⭐ Below Expectations';
      case 1:
        return '⭐ 1 Star (Contributes toward seller suspension alert)';
      default:
        return '';
    }
  };

  const activeScore = hoverRating || selectedRating;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-800 dark:text-slate-100 select-none transition-colors duration-200 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Handover Marked Successful</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-[#0F172A] dark:text-white">
            Rate Seller Experience
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            How was your campus exchange with <strong>{exchange.sellerName}</strong> for "{exchange.listingTitle}"?
          </p>
        </div>

        {/* Star Rating Section */}
        <div className="py-2 flex flex-col items-center justify-center space-y-2 bg-[#F8FAFC] dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setSelectedRating(star)}
                className="p-1 text-slate-300 dark:text-slate-700 hover:scale-125 transition-transform cursor-pointer"
                title={`${star} Star`}
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    (hoverRating || selectedRating) >= star
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]'
                      : 'fill-transparent'
                  }`}
                />
              </button>
            ))}
          </div>

          <span className={`text-xs font-bold text-center px-2 py-0.5 rounded-lg ${
            activeScore >= 4
              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
              : activeScore === 1
              ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
              : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40'
          }`}>
            {getRatingLabel(activeScore)}
          </span>
        </div>

        {/* Quick Feedback Chips */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Feedback Highlights
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#4F46E5] text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Review Comments input */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
            Add Comments (Optional)
          </label>
          <textarea
            rows={2}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Help other students know about this seller..."
            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#4F46E5] dark:focus:border-cyan-400 resize-none"
          />
        </div>

        {/* Protocol Policy Notice */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
          <p className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>10 continuous ratings of 4★ or above gives the seller <strong>"TRUSTWORTHY SELLER"</strong> status.</span>
          </p>
          <p className="flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>5 ratings of 1★ triggers an official review warning to prevent suspension.</span>
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Submit Seller Rating</span>
        </button>
      </div>
    </div>
  );
};
