import React, { useState, useEffect } from 'react';
import { UserProfile, ChatThread, Listing } from '../types';
import { chatService } from '../utils/chatService';
import { 
  MessageCircle, 
  ChevronRight, 
  ShieldCheck, 
  Search, 
  Sparkles,
  Store,
  Clock,
  Radio
} from 'lucide-react';

interface InboxViewProps {
  currentUser: UserProfile;
  listings: Listing[];
  onSelectThread: (thread: ChatThread) => void;
  onOpenMarketplace: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  currentUser,
  listings,
  onSelectThread,
  onOpenMarketplace,
}) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Initialize and load real threads for currentUser
  useEffect(() => {
    chatService.connect(currentUser.id, currentUser.fullName);

    let isMounted = true;
    chatService.fetchThreads(currentUser.id).then((fetched) => {
      if (isMounted) {
        setThreads(fetched);
        setLoading(false);
      }
    });

    // Subscribe to real-time events
    const unsubscribe = chatService.subscribe((event) => {
      if (event.type === 'PRESENCE_CHANGE') {
        if (Array.isArray(event.payload.onlineUsers)) {
          setOnlineUsers(new Set(event.payload.onlineUsers));
        }
      }

      if (event.type === 'NEW_MESSAGE') {
        const { message, thread: updatedThread } = event.payload;
        setThreads((prev) => {
          const existingIdx = prev.findIndex((t) => t.id === message.threadId);
          if (existingIdx >= 0) {
            const updated = [...prev];
            const old = updated[existingIdx];
            const isMe = message.senderId === currentUser.id;
            updated[existingIdx] = {
              ...old,
              lastMessageText: message.text,
              lastMessageTime: 'Just now',
              lastMessageSenderId: message.senderId,
              unreadCount: isMe ? 0 : (old.unreadCount || 0) + 1,
              updatedAt: Date.now(),
            };
            // Move to top
            const [item] = updated.splice(existingIdx, 1);
            return [item, ...updated];
          } else if (updatedThread) {
            // New thread arrived
            return [updatedThread, ...prev];
          }
          return prev;
        });
      }

      if (event.type === 'THREAD_CREATED') {
        const newThread = event.payload.thread;
        if (newThread && (newThread.sellerId === currentUser.id || newThread.buyerId === currentUser.id)) {
          setThreads((prev) => {
            if (prev.some((t) => t.id === newThread.id)) return prev;
            return [newThread, ...prev];
          });
        }
      }

      if (event.type === 'MESSAGES_READ') {
        const { threadId, userId } = event.payload;
        if (userId === currentUser.id) {
          setThreads((prev) =>
            prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
          );
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser.id, currentUser.fullName]);

  // Filter threads by search query
  const filteredThreads = threads.filter((t) => {
    const isSeller = t.sellerId === currentUser.id;
    const peerName = isSeller ? t.buyerName : t.sellerName;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      peerName.toLowerCase().includes(q) ||
      t.listingTitle.toLowerCase().includes(q) ||
      t.lastMessageText.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full bg-[#F8FAFC] dark:bg-[#0A0A0A] select-none pb-14 transition-colors duration-200">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#0F172A] dark:text-white tracking-tight">Messages</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Socket</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time student chat across UIET campus
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] dark:bg-slate-800 flex items-center justify-center text-[#4F46E5] dark:text-cyan-400 shadow-xs">
            <MessageCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students, items, or chats..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#F1F5F9] dark:bg-slate-800/80 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] dark:focus:border-cyan-400 border border-transparent dark:border-slate-700/60 transition-colors"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="p-4 sm:p-5 space-y-3 max-w-2xl mx-auto">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Connecting to live chat server...</span>
          </div>
        ) : filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => {
            const isSeller = thread.sellerId === currentUser.id;
            const peerName = isSeller ? thread.buyerName : thread.sellerName;
            const peerId = isSeller ? thread.buyerId : thread.sellerId;
            const peerHostel = isSeller ? thread.buyerHostel : thread.sellerHostel;
            const isPeerOnline = onlineUsers.has(peerId);
            const isMeLastSender = thread.lastMessageSenderId === currentUser.id;
            const hasUnread = (thread.unreadCount || 0) > 0 && !isMeLastSender;

            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={`bg-white dark:bg-[#1E293B] rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3.5 group relative ${
                  hasUnread
                    ? 'border-[#4F46E5]/40 dark:border-cyan-500/40 shadow-md bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                {/* Avatar with live online dot */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#EDE9FE] dark:bg-indigo-950/60 flex items-center justify-center font-bold text-[#4F46E5] dark:text-cyan-400 text-base shadow-inner">
                    {peerName.charAt(0)}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#1E293B] ${
                      isPeerOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                    title={isPeerOnline ? 'Online now' : 'Offline'}
                  />
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-white group-hover:text-[#4F46E5] dark:group-hover:text-cyan-400 transition-colors truncate">
                        {peerName}
                      </h3>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-[10px] text-slate-400 truncate max-w-[100px] hidden sm:inline">
                        · {peerHostel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {thread.lastMessageTime}
                      </span>
                      {hasUnread && (
                        <span className="w-5 h-5 rounded-full bg-[#4F46E5] dark:bg-cyan-500 text-white dark:text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Item subject line */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-semibold text-[#2563EB] dark:text-cyan-400 truncate max-w-[200px] sm:max-w-[280px]">
                      Re: {thread.listingTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      · ₹{thread.listingPrice}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold ml-auto shrink-0 uppercase">
                      {isSeller ? 'Buyer' : 'Seller'}
                    </span>
                  </div>

                  {/* Last message text preview */}
                  <p
                    className={`text-xs truncate mt-1 leading-normal ${
                      hasUnread
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isMeLastSender ? (
                      <span className="text-slate-400 font-normal">You: </span>
                    ) : null}
                    {thread.lastMessageText}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-[#4F46E5] dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            );
          })
        ) : (
          <div className="mt-8 text-center p-8 bg-white dark:bg-[#1E293B] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-[#4F46E5] dark:text-cyan-400">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No conversations yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Reach out to sellers by tapping "Message" on any campus listing to chat in real time.
              </p>
            </div>
            <button
              onClick={onOpenMarketplace}
              className="px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Browse Campus Listings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
