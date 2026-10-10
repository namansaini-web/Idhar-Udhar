import React, { useState, useEffect, useRef } from 'react';
import { Listing, UserProfile, ChatMessage, ChatThread } from '../types';
import { chatService } from '../utils/chatService';
import { 
  ChevronLeft, 
  Send, 
  Phone, 
  MessageSquare, 
  Handshake, 
  ShieldCheck, 
  CheckCheck,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import { ItemVisual } from './ItemVisual';

interface ChatViewProps {
  thread?: ChatThread | null;
  listing?: Listing | null;
  currentUser: UserProfile;
  onBack: () => void;
  onViewItem?: (listing: Listing) => void;
  onScheduleHandover?: (listing: Listing) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  thread: initialThread,
  listing,
  currentUser,
  onBack,
  onViewItem,
  onScheduleHandover,
}) => {
  const [activeThread, setActiveThread] = useState<ChatThread | null>(initialThread || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [isPeerOnline, setIsPeerOnline] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If only listing is provided, find or create thread
  useEffect(() => {
    if (initialThread) {
      setActiveThread(initialThread);
    } else if (listing) {
      // Find or create thread for this listing
      chatService
        .getOrCreateThread({
          listingId: listing.id,
          listingTitle: listing.title,
          listingPrice: listing.price,
          sellerId: listing.sellerId,
          sellerName: listing.sellerName,
          sellerHostel: listing.hostelName,
          sellerPhone: listing.sellerPhone,
          buyerId: currentUser.id,
          buyerName: currentUser.fullName,
          buyerHostel: currentUser.hostelName,
          buyerPhone: currentUser.phone,
        })
        .then((th) => {
          if (th) {
            setActiveThread(th);
          } else {
            // In-memory fallback
            const fallbackThread: ChatThread = {
              id: `thread-${listing.id}-${currentUser.id}`,
              listingId: listing.id,
              listingTitle: listing.title,
              listingPrice: listing.price,
              sellerId: listing.sellerId,
              sellerName: listing.sellerName,
              sellerHostel: listing.hostelName,
              sellerPhone: listing.sellerPhone,
              buyerId: currentUser.id,
              buyerName: currentUser.fullName,
              buyerHostel: currentUser.hostelName,
              buyerPhone: currentUser.phone,
              lastMessageText: 'Interested in this item',
              lastMessageTime: 'Just now',
              lastMessageSenderId: currentUser.id,
              updatedAt: Date.now(),
            };
            setActiveThread(fallbackThread);
          }
        });
    }
  }, [initialThread, listing, currentUser.id]);

  // Determine peer info
  const isSeller = activeThread ? activeThread.sellerId === currentUser.id : false;
  const peerId = activeThread
    ? isSeller
      ? activeThread.buyerId
      : activeThread.sellerId
    : listing?.sellerId || '';
  const peerName = activeThread
    ? isSeller
      ? activeThread.buyerName
      : activeThread.sellerName
    : listing?.sellerName || 'Student';
  const peerHostel = activeThread
    ? isSeller
      ? activeThread.buyerHostel
      : activeThread.sellerHostel
    : listing?.hostelName || 'UIET';
  const peerPhone = activeThread
    ? isSeller
      ? activeThread.buyerPhone
      : activeThread.sellerPhone
    : listing?.sellerPhone || '';

  const itemTitle = activeThread?.listingTitle || listing?.title || 'Campus Item';
  const itemPrice = activeThread?.listingPrice || listing?.price || 0;

  // Load message history & subscribe to live socket events
  useEffect(() => {
    if (!activeThread) return;

    chatService.connect(currentUser.id, currentUser.fullName);

    // Fetch initial messages
    chatService.fetchMessages(activeThread.id).then((fetched) => {
      setMessages(fetched);
      chatService.markAsRead(activeThread.id, currentUser.id);
    });

    setIsPeerOnline(chatService.onlineUserIds.has(peerId));

    const unsubscribe = chatService.subscribe((event) => {
      if (event.type === 'NEW_MESSAGE') {
        const { message } = event.payload;
        if (message.threadId === activeThread.id) {
          setMessages((prev) => {
            // Guard against duplicate message IDs
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
          chatService.markAsRead(activeThread.id, currentUser.id);
        }
      }

      if (event.type === 'USER_TYPING') {
        const { threadId, senderId, isTyping } = event.payload;
        if (threadId === activeThread.id && senderId === peerId) {
          setIsPeerTyping(!!isTyping);
        }
      }

      if (event.type === 'PRESENCE_CHANGE') {
        if (Array.isArray(event.payload.onlineUsers)) {
          setIsPeerOnline(event.payload.onlineUsers.includes(peerId));
        }
      }

      if (event.type === 'MESSAGES_READ') {
        const { threadId, userId } = event.payload;
        if (threadId === activeThread.id && userId === peerId) {
          setMessages((prev) =>
            prev.map((m) => (m.senderId === currentUser.id ? { ...m, read: true } : m))
          );
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeThread?.id, currentUser.id, peerId]);

  // Auto-scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);

    if (activeThread && peerId) {
      chatService.sendTyping(activeThread.id, currentUser.id, peerId, true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        chatService.sendTyping(activeThread.id, currentUser.id, peerId, false);
      }, 1500);
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || !activeThread) return;

    // Send via real-time WebSocket
    chatService.sendMessage({
      threadId: activeThread.id,
      text,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      receiverId: peerId,
      listingId: activeThread.listingId,
      listingTitle: itemTitle,
      listingPrice: itemPrice,
      receiverName: peerName,
      receiverHostel: peerHostel,
      senderHostel: currentUser.hostelName,
    });

    // Optimistic UI update
    const optimisticMsg: ChatMessage = {
      id: `msg-opt-${Date.now()}`,
      threadId: activeThread.id,
      listingId: activeThread.listingId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      receiverId: peerId,
      text,
      timestamp: 'Just now',
      createdAt: Date.now(),
      read: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputVal('');

    if (peerId) {
      chatService.sendTyping(activeThread.id, currentUser.id, peerId, false);
    }
  };

  const quickChips = [
    'Is this still available?',
    'Can we meet near UIET Nescafe Booth?',
    'Is the price negotiable?',
    'I can collect today post classes!',
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#F8FAFC] dark:bg-[#0A0A0A] select-none transition-colors duration-200">
      {/* 1. Header with Peer Details & Contact Buttons */}
      <div className="bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1 -ml-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Back to Inbox"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Peer Avatar & Live Status */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#EDE9FE] dark:bg-indigo-950/60 flex items-center justify-center font-bold text-[#4F46E5] dark:text-cyan-400 text-sm shadow-inner">
              {peerName.charAt(0)}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#0F172A] ${
                isPeerOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight truncate">
                {peerName}
              </h3>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-400">
              <span className={isPeerOnline ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                {isPeerOnline ? 'Online now' : 'Offline'}
              </span>
              <span>·</span>
              <span className="truncate">{peerHostel}</span>
            </div>
          </div>
        </div>

        {/* Quick Direct Call & WhatsApp Contact */}
        <div className="flex items-center gap-1.5 shrink-0">
          {peerPhone && (
            <a
              href={`tel:${peerPhone.replace(/\D/g, '')}`}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
              title={`Call: ${peerPhone}`}
            >
              <Phone className="w-4 h-4 text-[#4F46E5] dark:text-cyan-400" />
            </a>
          )}

          {peerPhone && (
            <a
              href={`https://wa.me/91${peerPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                `Hi ${peerName}! Regarding our IDHAR UDHAR chat for "${itemTitle}".`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors"
              title={`WhatsApp: ${peerPhone}`}
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* 2. Pinned Item Context Bar */}
      <div className="bg-white dark:bg-[#1E293B] border-b border-slate-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
            {listing ? (
              <ItemVisual
                title={listing.title}
                category={listing.category}
                tags={listing.tags}
                imageUrl={listing.imageUrl}
                className="w-full h-full"
              />
            ) : (
              <span className="text-xs font-bold text-indigo-500 font-mono">₹{itemPrice}</span>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {itemTitle}
            </h4>
            <span className="text-xs font-extrabold text-[#2563EB] dark:text-cyan-400">
              ₹{itemPrice}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {listing && onViewItem && (
            <button
              onClick={() => onViewItem(listing)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] transition-colors cursor-pointer"
            >
              View Item
            </button>
          )}

          {listing && onScheduleHandover && (
            <button
              onClick={() => onScheduleHandover(listing)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Handshake className="w-3 h-3" />
              <span>Handover</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Messages History Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Safety Banner */}
        <div className="p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
          <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" />
            <span>End-to-End Campus Conversation</span>
          </p>
          <p className="text-[10px] text-slate-400">
            Coordinate handovers at recommended spots like Nescafe Booth or Hostel Common Rooms.
          </p>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <div className="w-6 h-6 rounded-full bg-[#EDE9FE] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-cyan-400 text-[10px] font-bold flex items-center justify-center shrink-0 mb-1">
                  {peerName.charAt(0)}
                </div>
              )}

              <div
                className={`max-w-[78%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs space-y-1 ${
                  isMe
                    ? 'bg-[#4F46E5] text-white rounded-br-xs dark:bg-cyan-500 dark:text-slate-950 font-medium'
                    : 'bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-100 dark:border-slate-800'
                }`}
              >
                <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>

                <div
                  className={`flex items-center justify-end gap-1 text-[9px] ${
                    isMe
                      ? 'text-indigo-200 dark:text-slate-900/80'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <span>
                      {msg.read ? (
                        <CheckCheck className="w-3 h-3 text-cyan-200 dark:text-slate-950" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Real-Time Peer Typing Bubble */}
        {isPeerTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 animate-in fade-in">
            <div className="w-6 h-6 rounded-full bg-[#EDE9FE] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-cyan-400 text-[10px] font-bold flex items-center justify-center shrink-0">
              {peerName.charAt(0)}
            </div>
            <div className="px-3 py-2 rounded-2xl rounded-bl-xs bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[10px] text-slate-400 ml-1">{peerName} is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Campus Quick Suggestions Chips */}
      <div className="px-3 pt-2 bg-white dark:bg-[#0F172A] border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0 border border-transparent dark:border-slate-700/50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Input Bar */}
      <div className="bg-white dark:bg-[#0F172A] p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            placeholder={`Message ${peerName}...`}
            className="flex-1 px-4 py-3 bg-[#F1F5F9] dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] dark:focus:border-cyan-400 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="w-11 h-11 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-cyan-500 dark:hover:bg-cyan-400 disabled:opacity-40 text-white dark:text-slate-950 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
