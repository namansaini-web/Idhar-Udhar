import React from 'react';
import { PushNotificationAlert } from '../types';
import { Bell, X, MapPin, MessageSquare, ArrowRight } from 'lucide-react';

interface NotificationToastProps {
  notification: PushNotificationAlert | null;
  onDismiss: () => void;
  onViewRequest: (requestId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onViewRequest,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed top-16 sm:top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-white/95 backdrop-blur-md border border-[#C7D2FE] rounded-3xl shadow-[0_12px_36px_rgba(79,70,229,0.18)] p-4 text-slate-800 animate-in slide-in-from-top-4 duration-300 select-none">
      <div className="flex items-start justify-between gap-3">
        {notification.imageUrl ? (
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-[#C7D2FE] overflow-hidden shrink-0 relative flex items-center justify-center">
            <img
              src={notification.imageUrl}
              alt="Request preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 right-0 p-0.5 bg-[#4F46E5] rounded-tl">
              <Bell className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#4F46E5] shrink-0 animate-pulse">
            <Bell className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#4F46E5] font-black">
              HOSTEL RADAR ALERT
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {notification.timestamp}
            </span>
          </div>

          <h4 className="text-xs font-bold text-[#0F172A] leading-snug truncate">
            {notification.title}
          </h4>

          <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
            {notification.body}
          </p>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 pt-0.5">
            <MapPin className="w-3 h-3 text-[#4F46E5]" />
            <span className="font-bold text-slate-800">{notification.requesterName}</span>
            <span className="text-slate-400 text-[10px]">({notification.hostelName}, {notification.roomNumber})</span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <a
          href={`https://wa.me/${notification.requesterPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
            `Hi ${notification.requesterName}! I received your IDHAR UDHAR hostel alert. I have this item available in my room!`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-bold"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Reply on WhatsApp</span>
        </a>

        <button
          onClick={() => {
            onViewRequest(notification.requestId);
            onDismiss();
          }}
          className="text-xs px-3 py-1.5 rounded-xl bg-[#4F46E5] text-white font-bold flex items-center gap-1 hover:bg-[#4338CA] transition-colors cursor-pointer"
        >
          <span>View Request</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
