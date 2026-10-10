import React, { useState, useMemo } from 'react';
import { CampusRequest, UserProfile } from '../types';
import { 
  Bell, 
  Plus, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  Send,
  Building,
  CheckCircle2,
  Image as ImageIcon,
  Maximize2,
  X
} from 'lucide-react';

interface RequestDaalnaFeedProps {
  requests: CampusRequest[];
  currentUser: UserProfile;
  onOpenCreateRequest: () => void;
  onRespondToRequest: (req: CampusRequest) => void;
}

export const RequestDaalnaFeed: React.FC<RequestDaalnaFeedProps> = ({
  requests,
  currentUser,
  onOpenCreateRequest,
  onRespondToRequest,
}) => {
  const [filterScope, setFilterScope] = useState<'hostel' | 'college' | 'all'>('college');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedImage, setExpandedImage] = useState<{ url: string; title: string } | null>(null);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (filterScope === 'hostel' && r.hostelName !== currentUser.hostelName) {
        return false;
      }
      if (filterScope === 'college' && r.collegeId !== currentUser.collegeId) {
        return false;
      }
      if (categoryFilter !== 'all' && r.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [requests, filterScope, categoryFilter, currentUser]);

  return (
    <div className="w-full px-4 sm:px-5 py-4 space-y-4 select-none pb-12 transition-colors duration-200">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#4F46E5] via-[#4338CA] to-[#3730A3] dark:from-[#312E81] dark:via-[#1E1B4B] dark:to-[#0F172A] p-5 sm:p-6 text-white overflow-hidden shadow-md">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 dark:bg-amber-950/50 border border-white/25 dark:border-amber-500/30 text-[10px] font-bold text-amber-300 uppercase tracking-wide">
              <Bell className="w-3.5 h-3.5" />
              <span>Hostel Radar Alerts</span>
            </div>

            <button
              onClick={onOpenCreateRequest}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-amber-400 dark:hover:bg-amber-300 text-[#4F46E5] dark:text-slate-950 font-extrabold text-xs shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              + Naya Request
            </button>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              "Request Daalna" Broadcasts
            </h1>
            <p className="text-xs text-indigo-100 dark:text-slate-300 font-medium leading-relaxed mt-1">
              Can't find a drafter or lab coat? Post an alert with reference photos. It reaches verified students in your wing directly!
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Scope Tabs */}
      <div className="bg-white dark:bg-[#151A26] rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterScope('hostel')}
            className={`flex-1 min-w-[100px] px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
              filterScope === 'hostel'
                ? 'bg-white dark:bg-slate-800 text-[#4F46E5] dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            My Hostel ({currentUser.hostelName.split(' ')[0]})
          </button>
          <button
            onClick={() => setFilterScope('college')}
            className={`flex-1 min-w-[80px] px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
              filterScope === 'college'
                ? 'bg-white dark:bg-slate-800 text-[#4F46E5] dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            My College
          </button>
          <button
            onClick={() => setFilterScope('all')}
            className={`flex-1 min-w-[80px] px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
              filterScope === 'all'
                ? 'bg-white dark:bg-slate-800 text-[#4F46E5] dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            All Campuses
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {['all', 'Academics', 'Electronics', 'Lifestyle'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs rounded-xl font-semibold transition-colors cursor-pointer capitalize whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#EEF2FF] dark:bg-cyan-950/40 text-[#4F46E5] dark:text-cyan-300 border border-[#C7D2FE] dark:border-cyan-800/60'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Needs' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Feed */}
      <div className="space-y-3.5">
        {filteredRequests.map((req) => {
          const isUrgent = req.urgency.toLowerCase().includes('urgent');
          const isMyHostel = req.hostelName === currentUser.hostelName;

          return (
            <div
              key={req.id}
              className={`p-5 rounded-3xl border transition-all shadow-sm space-y-3.5 ${
                isUrgent
                  ? 'bg-white dark:bg-[#151A26] border-amber-200 dark:border-amber-900/60 ring-1 ring-amber-100 dark:ring-amber-950/40'
                  : 'bg-white dark:bg-[#151A26] border-slate-100 dark:border-slate-800'
              }`}
            >
              {/* Badges & Meta */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide ${
                  isUrgent 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {req.urgency}
                </span>

                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {req.category}
                </span>

                <span className="text-slate-300 dark:text-slate-700">·</span>

                <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {req.createdAt}
                </span>

                {isMyHostel && (
                  <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] dark:bg-cyan-950/50 text-[10px] text-[#4F46E5] dark:text-cyan-300 font-bold border border-transparent dark:border-cyan-800/40">
                    Hostel Neighbour
                  </span>
                )}

                {req.imageUrl && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[10px] text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1 border border-emerald-100 dark:border-emerald-800/60">
                    <ImageIcon className="w-3 h-3" />
                    <span>Photo Attached</span>
                  </span>
                )}
              </div>

              {/* Title & Budget */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug flex-1">
                  {req.title}
                </h3>
                <div className="text-right shrink-0">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Budget</span>
                  <span className="text-base sm:text-lg font-extrabold text-[#2563EB] dark:text-cyan-400 font-mono-numbers">
                    ₹{req.maxBudget.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {req.description}
              </p>

              {/* Attached Photo Preview */}
              {req.imageUrl && (
                <div className="pt-0.5">
                  <div 
                    onClick={() => setExpandedImage({ url: req.imageUrl!, title: req.title })}
                    className="group inline-flex items-center gap-3 p-2 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#4F46E5] dark:hover:border-cyan-400 transition-all cursor-pointer overflow-hidden max-w-sm"
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center relative">
                      <img
                        src={req.imageUrl}
                        alt="Requester photo reference"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="pr-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#4F46E5] dark:group-hover:text-cyan-400 transition-colors block">
                        View Reference Photo
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                        Tap to expand full size
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Requester Info & Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-[#EDE9FE] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {req.requesterName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block sm:inline">{req.requesterName}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 sm:ml-1.5">
                      ({req.hostelName}, {req.roomNumber})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${req.requesterPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hi ${req.requesterName}! I saw your IDHAR UDHAR request for "${req.title}". I stay in ${currentUser.hostelName}, ${currentUser.roomNumber}. I have this available!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => onRespondToRequest(req)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>I Have This</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredRequests.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-[#151A26] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <Bell className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No requests found in this scope</p>
            <p className="text-xs text-slate-400">Post a request to ask students in your college for drafters, lab coats, or gadgets.</p>
            <button
              onClick={onOpenCreateRequest}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs cursor-pointer"
            >
              Post Request Alert
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Photo viewing */}
      {expandedImage && (
        <div 
          onClick={() => setExpandedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-lg w-full bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {expandedImage.title}
              </h4>
              <button
                onClick={() => setExpandedImage(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-h-[60vh] bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
              <img
                src={expandedImage.url}
                alt={expandedImage.title}
                referrerPolicy="no-referrer"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setExpandedImage(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
