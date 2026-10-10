import React, { useState, useEffect } from 'react';
import { UserProfile, Listing, CampusRequest, ExchangeSession, PushNotificationAlert, CategoryType, ChatThread, UserWarning, UserModerationRecord } from './types';
import { INITIAL_LISTINGS, INITIAL_REQUESTS } from './data/mockData';
import { safeStorage } from './utils/storage';
import { realtimeService, chatService } from './utils/chatService';
import { logoutFirebaseUser } from './firebase';
import { BootScreen } from './components/BootScreen';
import { AuthScreen } from './components/AuthScreen';
import { SuspendedScreen } from './components/SuspendedScreen';
import { Navbar } from './components/Navbar';
import { MarketplaceFeed } from './components/MarketplaceFeed';
import { SearchView } from './components/SearchView';
import { ChatView } from './components/ChatView';
import { InboxView } from './components/InboxView';
import { RequestDaalnaFeed } from './components/RequestDaalnaFeed';
import { ExchangesFeed } from './components/ExchangesFeed';
import { MyListingsView } from './components/MyListingsView';
import { BottomBar } from './components/BottomBar';
import { ListingDetailModal } from './components/ListingDetailModal';
import { SecureExchangeModal } from './components/SecureExchangeModal';
import { CreateListingModal } from './components/CreateListingModal';
import { CreateRequestModal } from './components/CreateRequestModal';
import { NotificationToast } from './components/NotificationToast';
import { GuestNoticeModal, GuestActionIntent } from './components/GuestNoticeModal';
import { ImageMaximizeModal } from './components/ImageMaximizeModal';
import { RateSellerModal } from './components/RateSellerModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { recordSellerRating } from './data/reputation';
import { Plus, Bell, X, Store, MessageSquare, Phone } from 'lucide-react';

const GUEST_USER: UserProfile = {
  id: 'guest-explorer',
  fullName: 'Guest Explorer',
  gender: 'Other',
  phone: 'Guest Mode',
  collegeId: 'uiet-kurukshetra',
  collegeName: 'UIET Kurukshetra University',
  hostelName: 'Guest Mode (Preview)',
  roomNumber: 'N/A',
  course: 'Visitor',
  year: '1st Year',
  avatarSeed: 'guest-explorer',
  joinedDate: 'Browsing as Guest'
};

export default function App() {
  // Dark Mode State with persistence and html class sync
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = safeStorage.getItem('idhar_udhar_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return false; // Default to clean light mode matching photos, togglable via animated button
  });

  useEffect(() => {
    safeStorage.setItem('idhar_udhar_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // App navigation stage: 'boot' -> 'auth' -> 'main'
  const [appStage, setAppStage] = useState<'boot' | 'auth' | 'main'>('boot');

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return safeStorage.getJSON<UserProfile | null>('idhar_udhar_user', null);
  });

  // Current tab in main view: 'home' | 'search' | 'inbox' | 'profile' | 'requests' | 'exchanges'
  const [currentTab, setCurrentTab] = useState<'home' | 'search' | 'inbox' | 'profile' | 'requests' | 'exchanges'>('home');

  // Active chat listing and thread if inside a direct chat
  const [activeChatListing, setActiveChatListing] = useState<Listing | null>(null);
  const [activeChatThread, setActiveChatThread] = useState<ChatThread | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);

  // Search category filter pre-selection
  const [searchCategory, setSearchCategory] = useState<CategoryType | 'All'>('All');

  // Action choice sheet (List an item vs Post Request Daalna)
  const [isChoiceSheetOpen, setIsChoiceSheetOpen] = useState(false);

  // Listings state
  const [listings, setListings] = useState<Listing[]>(() => {
    return safeStorage.getJSON<Listing[]>('idhar_udhar_listings', INITIAL_LISTINGS);
  });

  // Requests state
  const [requests, setRequests] = useState<CampusRequest[]>(() => {
    return safeStorage.getJSON<CampusRequest[]>('idhar_udhar_requests', INITIAL_REQUESTS);
  });

  // Campus Exchanges state
  const [exchanges, setExchanges] = useState<ExchangeSession[]>(() => {
    return safeStorage.getJSON<ExchangeSession[]>('idhar_udhar_exchanges', [
      {
        id: 'exch-demo-1',
        listingId: 'lst-1',
        listingTitle: 'Omega Heavy-Duty Engineering Mini Drafter with Clamp & Bag',
        price: 450,
        listingType: 'sell',
        sellerId: 'user-rohit',
        sellerName: 'Rohit Sharma (ECE 3rd Yr)',
        sellerPhone: '+919872134560',
        sellerHostel: 'Hostel 7 (Charak Bhawan)',
        sellerRoom: 'Room 314',
        buyerId: 'user-sample',
        buyerName: 'Vikram Joshi (Mech 1st Yr)',
        buyerPhone: '+919812456789',
        buyerHostel: 'Hostel 7 (Charak Bhawan)',
        buyerRoom: 'Room 108',
        campusLocation: 'Nescafe Booth (Near UIET Main Block)',
        exchangeCode: '4921',
        scheduledTime: 'Today at 5:30 PM (Post Classes)',
        status: 'scheduled',
        createdAt: '1 hour ago'
      }
    ]);
  });

  // Active push notification toast
  const [activeNotification, setActiveNotification] = useState<PushNotificationAlert | null>(null);

  // Modals state
  const [selectedListingDetail, setSelectedListingDetail] = useState<Listing | null>(null);
  const [fullPhotoImageListing, setFullPhotoImageListing] = useState<Listing | null>(null);
  const [exchangeTargetListing, setExchangeTargetListing] = useState<Listing | null>(null);
  const [rateExchangeTarget, setRateExchangeTarget] = useState<ExchangeSession | null>(null);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);

  // Admin Proctor Moderation state
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [userModeration, setUserModeration] = useState<Record<string, UserModerationRecord>>({});
  const [removalLogs, setRemovalLogs] = useState<Array<{ id: string; listingId: string; listingTitle: string; sellerId: string; reason?: string; timestamp: string; adminName: string }>>([]);

  // Guest mode and notice modal state
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [guestNotice, setGuestNotice] = useState<{
    isOpen: boolean;
    intent: GuestActionIntent;
  }>({
    isOpen: false,
    intent: 'general'
  });

  // Sync state to safe storage (with quota protection & in-memory fallback)
  useEffect(() => {
    if (currentUser && !isGuestMode) {
      safeStorage.setJSON('idhar_udhar_user', currentUser);
    } else if (!isGuestMode) {
      safeStorage.removeItem('idhar_udhar_user');
    }
  }, [currentUser, isGuestMode]);

  useEffect(() => {
    safeStorage.setJSON('idhar_udhar_listings', listings);
  }, [listings]);

  useEffect(() => {
    safeStorage.setJSON('idhar_udhar_requests', requests);
  }, [requests]);

  useEffect(() => {
    safeStorage.setJSON('idhar_udhar_exchanges', exchanges);
  }, [exchanges]);

  // Initial Authoritative Server Hydration
  useEffect(() => {
    const uid = currentUser?.id || (isGuestMode ? 'guest-user' : 'guest-explorer');
    const uname = currentUser?.fullName || (isGuestMode ? 'Guest Student' : 'Guest Explorer');
    realtimeService.connect(uid, uname);

    realtimeService.fetchListings().then((serverListings) => {
      if (serverListings && serverListings.length > 0) {
        setListings(serverListings);
        safeStorage.setJSON('idhar_udhar_listings', serverListings);
      }
    });

    realtimeService.fetchRequests().then((serverRequests) => {
      if (serverRequests && serverRequests.length > 0) {
        setRequests(serverRequests);
        safeStorage.setJSON('idhar_udhar_requests', serverRequests);
      }
    });

    realtimeService.fetchExchanges().then((serverExchanges) => {
      if (serverExchanges && serverExchanges.length > 0) {
        setExchanges(serverExchanges);
        safeStorage.setJSON('idhar_udhar_exchanges', serverExchanges);
      }
    });

    // Hydrate proctor moderation status and logs
    fetch('/api/admin/moderation')
      .then((r) => r.json())
      .then((data) => {
        if (data?.userModeration) setUserModeration(data.userModeration);
        if (Array.isArray(data?.removalLogs)) setRemovalLogs(data.removalLogs);
      })
      .catch(() => {});
  }, []);

  // Periodic and on-focus background synchronization to guarantee cross-user updates
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const freshListings = await realtimeService.fetchListings();
        if (Array.isArray(freshListings) && freshListings.length > 0) {
          setListings((prev) => {
            const hasChange =
              prev.length !== freshListings.length ||
              freshListings.some((f, idx) => !prev[idx] || prev[idx].id !== f.id || prev[idx].status !== f.status);
            if (hasChange) {
              safeStorage.setJSON('idhar_udhar_listings', freshListings);
              return freshListings;
            }
            return prev;
          });
        }
      } catch {}
    };

    const intervalId = setInterval(syncWithServer, 3000);
    window.addEventListener('focus', syncWithServer);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', syncWithServer);
    };
  }, []);

  // Real-Time WebSocket Listener: Listings, Requests, Exchanges & Live Chat
  useEffect(() => {
    const uid = currentUser?.id || (isGuestMode ? 'guest-user' : 'guest-explorer');
    const uname = currentUser?.fullName || (isGuestMode ? 'Guest Student' : 'Guest Explorer');
    realtimeService.connect(uid, uname);

    const updateUnread = async () => {
      if (!currentUser || isGuestMode) return;
      const ths = await chatService.fetchThreads(currentUser.id);
      const unreadTotal = ths.reduce((sum, t) => {
        if (t.lastMessageSenderId !== currentUser.id && (t.unreadCount || 0) > 0) {
          return sum + (t.unreadCount || 0);
        }
        return sum;
      }, 0);
      setUnreadChatCount(unreadTotal);
    };

    updateUnread();

    const unsubscribe = realtimeService.subscribe((evt) => {
      // 1. Initial State from Server
      if (evt.type === 'INIT_CAMPUS_FEED') {
        const { listings: l, requests: r, exchanges: e } = evt.payload;
        if (Array.isArray(l) && l.length > 0) {
          setListings(l);
          safeStorage.setJSON('idhar_udhar_listings', l);
        }
        if (Array.isArray(r) && r.length > 0) {
          setRequests(r);
          safeStorage.setJSON('idhar_udhar_requests', r);
        }
        if (Array.isArray(e) && e.length > 0) {
          setExchanges(e);
          safeStorage.setJSON('idhar_udhar_exchanges', e);
        }
      }

      // 2. Real-Time Listing Posted
      if (evt.type === 'LISTING_CREATED') {
        const newListing: Listing = evt.payload?.listing || evt.payload;
        if (newListing && newListing.id) {
          setListings((prev) => {
            if (prev.some((item) => item.id === newListing.id)) return prev;
            const updated = [newListing, ...prev];
            safeStorage.setJSON('idhar_udhar_listings', updated);
            return updated;
          });

          // Trigger campus radar notification if posted by another student
          if (currentUser && newListing.sellerId !== currentUser.id) {
            setActiveNotification({
              id: `lst-${Date.now()}`,
              title: `🏷️ New Campus Post: ${newListing.title}`,
              body: `₹${newListing.price} · Listed by ${newListing.sellerName} (${newListing.hostelName})`,
              collegeName: newListing.collegeName,
              hostelName: newListing.hostelName,
              requesterName: newListing.sellerName,
              requesterPhone: newListing.sellerPhone,
              roomNumber: newListing.roomNumber,
              timestamp: 'Just now',
              requestId: newListing.id,
              imageUrl: newListing.imageUrl,
            });
          }
        }
      }

      // 3. Real-Time Listing Updated
      if (evt.type === 'LISTING_UPDATED') {
        const { id, status } = evt.payload;
        setListings((prev) => {
          const updated = prev.map((l) => (l.id === id ? { ...l, status } : l));
          safeStorage.setJSON('idhar_udhar_listings', updated);
          return updated;
        });
      }

      // 4. Real-Time Listing Deleted
      if (evt.type === 'LISTING_DELETED') {
        const { id } = evt.payload;
        setListings((prev) => {
          const updated = prev.filter((l) => l.id !== id);
          safeStorage.setJSON('idhar_udhar_listings', updated);
          return updated;
        });
      }

      // 5. Real-Time Request Created ("Request Daalna")
      if (evt.type === 'REQUEST_CREATED') {
        const newReq: CampusRequest = evt.payload.request;
        setRequests((prev) => {
          if (prev.some((r) => r.id === newReq.id)) return prev;
          const updated = [newReq, ...prev];
          safeStorage.setJSON('idhar_udhar_requests', updated);
          return updated;
        });

        if (currentUser && newReq.requesterId !== currentUser.id) {
          setActiveNotification({
            id: `alert-${Date.now()}`,
            title: `⚡ Urgent Hostel Need: ${newReq.title}`,
            body: `"${newReq.description}" · Budget: ₹${newReq.maxBudget}`,
            collegeName: newReq.collegeName,
            hostelName: newReq.hostelName,
            requesterName: newReq.requesterName,
            requesterPhone: newReq.requesterPhone,
            roomNumber: newReq.roomNumber,
            timestamp: 'Just now',
            requestId: newReq.id,
            imageUrl: newReq.imageUrl,
          });
        }
      }

      // 6. Real-Time Request Deleted
      if (evt.type === 'REQUEST_DELETED') {
        const { id } = evt.payload;
        setRequests((prev) => {
          const updated = prev.filter((r) => r.id !== id);
          safeStorage.setJSON('idhar_udhar_requests', updated);
          return updated;
        });
      }

      // 7. Real-Time Exchange Created
      if (evt.type === 'EXCHANGE_CREATED') {
        const ex: ExchangeSession = evt.payload.exchange;
        setExchanges((prev) => {
          if (prev.some((e) => e.id === ex.id)) return prev;
          const updated = [ex, ...prev];
          safeStorage.setJSON('idhar_udhar_exchanges', updated);
          return updated;
        });
      }

      // 8. Real-Time Exchange Completed
      if (evt.type === 'EXCHANGE_COMPLETED') {
        const { id, listingId } = evt.payload;
        setExchanges((prev) => {
          const updated = prev.map((e) => (e.id === id ? { ...e, status: 'completed' as const } : e));
          safeStorage.setJSON('idhar_udhar_exchanges', updated);
          return updated;
        });
        if (listingId) {
          setListings((prev) => {
            const updated = prev.map((l) => (l.id === listingId ? { ...l, status: 'completed' as const } : l));
            safeStorage.setJSON('idhar_udhar_listings', updated);
            return updated;
          });
        }
      }

      // 9. Real-Time Chat Message
      if (evt.type === 'NEW_MESSAGE') {
        const { message } = evt.payload;
        if (currentUser && message.receiverId === currentUser.id) {
          if (!activeChatThread || activeChatThread.id !== message.threadId) {
            setUnreadChatCount((prev) => prev + 1);
            setActiveNotification({
              id: `chat-${Date.now()}`,
              title: `💬 ${message.senderName}`,
              body: message.text,
              collegeName: 'UIET Kurukshetra',
              hostelName: 'Live Campus Chat',
              requesterName: message.senderName,
              requesterPhone: '',
              roomNumber: '',
              timestamp: 'Just now',
              requestId: message.threadId,
            });
          }
        }
      }

      if (evt.type === 'MESSAGES_READ' || evt.type === 'THREAD_CREATED') {
        updateUnread();
      }

      // 10. Real-Time Admin Suspension Status
      if (evt.type === 'USER_SUSPENDED_STATUS') {
        const { userId, isSuspended, moderation, reason, adminName } = evt.payload || evt;
        if (userId) {
          setUserModeration((prev) => ({
            ...prev,
            [userId]: moderation || {
              userId,
              isSuspended: !!isSuspended,
              suspensionReason: reason,
              suspendedBy: adminName,
              warnings: prev[userId]?.warnings || [],
            },
          }));
          if (currentUser && currentUser.id === userId) {
            setCurrentUser((prev) =>
              prev ? { ...prev, isSuspended: !!isSuspended, suspensionReason: reason } : null
            );
          }
        }
      }

      // 11. Real-Time Admin Warning
      if (evt.type === 'USER_WARNED') {
        const { userId, moderation } = evt.payload || evt;
        if (userId && moderation) {
          setUserModeration((prev) => ({
            ...prev,
            [userId]: moderation,
          }));
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, isGuestMode, activeChatThread?.id]);

  // Handler for finishing boot screen - Proceeds directly to login screen
  const handleBootComplete = (mode?: any) => {
    setIsGuestMode(false);
    const targetMode = mode === 'signup' ? 'signup' : 'login';
    setAuthInitialMode(targetMode);
    setAppStage('auth');
  };

  // Handler for entering Guest Mode
  const handleContinueAsGuest = () => {
    setIsGuestMode(true);
    setCurrentUser(GUEST_USER);
    setCurrentTab('home');
    setAppStage('main');
    realtimeService.fetchListings().then((serverListings) => {
      if (Array.isArray(serverListings) && serverListings.length > 0) {
        setListings(serverListings);
        safeStorage.setJSON('idhar_udhar_listings', serverListings);
      }
    }).catch(() => {});
  };

  // Handler for login/onboarding success
  const handleLoginSuccess = (user: UserProfile) => {
    setIsGuestMode(false);

    // Fetch authoritative moderation status immediately upon login
    fetch('/api/admin/moderation')
      .then((r) => r.json())
      .then((data) => {
        if (data?.userModeration) setUserModeration(data.userModeration);
        if (Array.isArray(data?.removalLogs)) setRemovalLogs(data.removalLogs);
      })
      .catch(() => {});

    setCurrentUser(user);
    setCurrentTab('home');
    setAppStage('main');
    realtimeService.fetchListings().then((serverListings) => {
      if (Array.isArray(serverListings) && serverListings.length > 0) {
        setListings(serverListings);
        safeStorage.setJSON('idhar_udhar_listings', serverListings);
      }
    }).catch(() => {});
  };

  // Handler for user logout / switch user
  const handleLogout = () => {
    logoutFirebaseUser();
    setIsGuestMode(false);
    setCurrentUser(null);
    setCurrentTab('home');
    setActiveChatListing(null);
    setActiveChatThread(null);
    setUnreadChatCount(0);
    setSelectedListingDetail(null);
    setRateExchangeTarget(null);
    setAuthInitialMode('login');
    setAppStage('auth');
  };

  // Handler for guest notice dialog redirection
  const handleNavigateFromGuestToAuth = (mode: 'login' | 'signup') => {
    setGuestNotice({ isOpen: false, intent: 'general' });
    setSelectedListingDetail(null);
    setIsChoiceSheetOpen(false);
    setIsGuestMode(false);
    setAuthInitialMode(mode);
    setAppStage('auth');
  };

  // Freeze pane bottom bar navigation handlers
  const handleSelectTab = (tab: 'home' | 'search' | 'inbox' | 'profile') => {
    if (tab !== 'inbox') {
      setActiveChatListing(null);
      setActiveChatThread(null);
    }
    if (isGuestMode && tab === 'inbox') {
      setGuestNotice({ isOpen: true, intent: 'message' });
      return;
    }
    if (isGuestMode && tab === 'profile') {
      setGuestNotice({ isOpen: true, intent: 'general' });
      return;
    }
    setCurrentTab(tab);
  };

  const handleOpenCreateFAB = () => {
    if (isGuestMode) {
      setGuestNotice({ isOpen: true, intent: 'sell' });
      return;
    }
    setIsChoiceSheetOpen(true);
  };

  // Real-time synchronization across accounts and browser tabs
  const broadcastSync = (type: string, payload: any) => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('idhar_udhar_campus_sync');
        bc.postMessage({ type, payload });
        setTimeout(() => {
          try { bc.close(); } catch {}
        }, 1500);
      }
    } catch {}
  };

  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('idhar_udhar_campus_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'SYNC_LISTINGS' && Array.isArray(event.data.payload)) {
            setListings(event.data.payload);
          } else if (event.data?.type === 'SYNC_REQUESTS' && Array.isArray(event.data.payload)) {
            setRequests(event.data.payload);
          } else if (event.data?.type === 'SYNC_EXCHANGES' && Array.isArray(event.data.payload)) {
            setExchanges(event.data.payload);
          }
        };
      } catch {}
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'idhar_udhar_listings' && e.newValue) {
        try {
          setListings(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'idhar_udhar_requests' && e.newValue) {
        try {
          setRequests(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'idhar_udhar_exchanges' && e.newValue) {
        try {
          setExchanges(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      try { bc?.close(); } catch {}
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Create Listing - Persists immediately and broadcasts over WebSockets to all connected peers
  const handleCreateListing = (newListing: Listing) => {
    setListings((prev) => {
      const exists = prev.some((l) => l.id === newListing.id);
      const updated = exists ? prev.map(l => l.id === newListing.id ? newListing : l) : [newListing, ...prev];
      safeStorage.setJSON('idhar_udhar_listings', updated);
      broadcastSync('SYNC_LISTINGS', updated);
      return updated;
    });
    realtimeService.createListing(newListing);
  };

  // Delete Listing - Broadcasts to all peers in real time
  const handleDeleteListing = (id: string) => {
    setListings((prev) => {
      const updated = prev.filter(l => l.id !== id);
      safeStorage.setJSON('idhar_udhar_listings', updated);
      return updated;
    });
    realtimeService.deleteListing(id);
    broadcastSync('SYNC_LISTINGS', listings.filter(l => l.id !== id));
  };

  // Toggle listing sold status - Broadcasts to all peers in real time
  const handleToggleListingStatus = (id: string) => {
    const item = listings.find((l) => l.id === id);
    if (!item) return;
    const newStatus = (item.status === 'completed' ? 'available' : 'completed') as Listing['status'];
    setListings((prev) => {
      const updated: Listing[] = prev.map((it) =>
        it.id === id ? { ...it, status: newStatus } : it
      );
      safeStorage.setJSON('idhar_udhar_listings', updated);
      return updated;
    });
    realtimeService.updateListingStatus(id, newStatus);
  };

  // Chief Proctor Admin Handlers
  const handleAdminRemoveListing = async (listingId: string, reason?: string) => {
    try {
      await fetch('/api/admin/remove-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: listingId,
          reason,
          adminName: currentUser?.fullName || 'Campus Proctor',
        }),
      });
    } catch {}

    setListings((prev) => {
      const next = prev.filter((l) => l.id !== listingId);
      safeStorage.setJSON('idhar_udhar_listings', next);
      broadcastSync('SYNC_LISTINGS', next);
      return next;
    });

    if (selectedListingDetail?.id === listingId) {
      setSelectedListingDetail(null);
    }

    const target = listings.find((l) => l.id === listingId);
    if (target) {
      setRemovalLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          listingId,
          listingTitle: target.title,
          sellerId: target.sellerId,
          reason,
          timestamp: new Date().toLocaleTimeString(),
          adminName: currentUser?.fullName || 'Campus Proctor',
        },
        ...prev,
      ]);
    }

    setActiveNotification({
      id: `admin-rm-${Date.now()}`,
      title: '🛡️ Proctor Removal Executed',
      body: reason ? `Removed listing with notice: "${reason}"` : 'Removed listing without explanation',
      collegeName: 'UIET Kurukshetra',
      hostelName: 'Chief Proctor Office',
      requesterName: 'Admin Action',
      requesterPhone: '',
      roomNumber: '',
      timestamp: 'Just now',
      requestId: listingId,
    });
  };

  const handleAdminWarnUser = async (userId: string, reason: string) => {
    try {
      const res = await fetch('/api/admin/warn-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          reason,
          adminName: currentUser?.fullName || 'Campus Proctor',
        }),
      });
      const data = await res.json();
      if (data?.moderation) {
        setUserModeration((prev) => ({ ...prev, [userId]: data.moderation }));
      }
    } catch {}
    setActiveNotification({
      id: `admin-warn-${Date.now()}`,
      title: '⚠️ Proctor Warning Issued',
      body: `Warning recorded for student: "${reason}"`,
      collegeName: 'UIET Kurukshetra',
      hostelName: 'Chief Proctor Office',
      requesterName: 'Admin Action',
      requesterPhone: '',
      roomNumber: '',
      timestamp: 'Just now',
      requestId: `warn-${userId}`,
    });
  };

  const handleAdminSuspendUser = async (userId: string, suspended: boolean, reason?: string) => {
    try {
      const res = await fetch('/api/admin/suspend-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          suspended,
          reason,
          adminName: currentUser?.fullName || 'Campus Proctor',
        }),
      });
      const data = await res.json();
      if (data?.moderation) {
        setUserModeration((prev) => ({ ...prev, [userId]: data.moderation }));
      }
    } catch {}
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, isSuspended: suspended, suspensionReason: reason } : null));
    }
    setActiveNotification({
      id: `admin-susp-${Date.now()}`,
      title: suspended ? '🚫 User Suspended' : '✅ User Reactivated',
      body: suspended ? `Student account suspended by Campus Proctor` : `Student account permissions restored`,
      collegeName: 'UIET Kurukshetra',
      hostelName: 'Chief Proctor Office',
      requesterName: 'Admin Action',
      requesterPhone: '',
      roomNumber: '',
      timestamp: 'Just now',
      requestId: `susp-${userId}`,
    });
  };

  // Create "Request Daalna" Alert & broadcast in real time across the campus network
  const handleCreateRequest = (newRequest: CampusRequest) => {
    setRequests((prev) => {
      if (prev.some((r) => r.id === newRequest.id)) return prev;
      const updated = [newRequest, ...prev];
      safeStorage.setJSON('idhar_udhar_requests', updated);
      return updated;
    });
    realtimeService.createRequest(newRequest);
    broadcastSync('SYNC_REQUESTS', [newRequest, ...requests]);

    // Local confirmation push notification alert
    setActiveNotification({
      id: `alert-${Date.now()}`,
      title: `⚡ Urgent Hostel Need: ${newRequest.title}`,
      body: `"${newRequest.description}" · Budget: ₹${newRequest.maxBudget}`,
      collegeName: newRequest.collegeName,
      hostelName: newRequest.hostelName,
      requesterName: newRequest.requesterName,
      requesterPhone: newRequest.requesterPhone,
      roomNumber: newRequest.roomNumber,
      timestamp: 'Just now',
      requestId: newRequest.id,
      imageUrl: newRequest.imageUrl
    });
  };

  // Delete Request - Broadcasts in real time across campus
  const handleDeleteRequest = (id: string) => {
    setRequests((prev) => {
      const updated = prev.filter(r => r.id !== id);
      safeStorage.setJSON('idhar_udhar_requests', updated);
      return updated;
    });
    realtimeService.deleteRequest(id);
    broadcastSync('SYNC_REQUESTS', requests.filter(r => r.id !== id));
  };

  // Confirm Exchange session creation
  const handleConfirmExchange = (session: ExchangeSession) => {
    setExchanges((prev) => {
      const updated = [session, ...prev];
      safeStorage.setJSON('idhar_udhar_exchanges', updated);
      return updated;
    });
    realtimeService.createExchange(session);
    broadcastSync('SYNC_EXCHANGES', [session, ...exchanges]);
    setCurrentTab('exchanges');
  };

  // Complete Exchange with 4-digit code or direct marking
  const handleCompleteExchange = (id: string, code?: string): boolean => {
    const exchange = exchanges.find(e => e.id === id);
    if (!exchange) return false;

    // Allow completion when code matches, or direct mark if code is omitted, or demo passcode '4921'
    if (!code || exchange.exchangeCode === code.trim() || code === '4921') {
      const updatedExchanges: ExchangeSession[] = exchanges.map(e =>
        e.id === id ? { ...e, status: 'completed' as const } : e
      );
      setExchanges(updatedExchanges);
      safeStorage.setJSON('idhar_udhar_exchanges', updatedExchanges);
      broadcastSync('SYNC_EXCHANGES', updatedExchanges);

      const updatedListings: Listing[] = listings.map(l =>
        l.id === exchange.listingId ? { ...l, status: 'completed' as const } : l
      );
      setListings(updatedListings);
      safeStorage.setJSON('idhar_udhar_listings', updatedListings);
      broadcastSync('SYNC_LISTINGS', updatedListings);

      realtimeService.completeExchange(id, exchange.listingId);
      return true;
    }
    return false;
  };

  // Submit Rating for Seller after Handover
  const handleSubmitSellerRating = (exchangeId: string, sellerId: string, rating: number, reviewText: string) => {
    const { reputation } = recordSellerRating(sellerId, rating);

    setExchanges((prev) => {
      const updated: ExchangeSession[] = prev.map((ex) =>
        ex.id === exchangeId
          ? { ...ex, buyerRating: rating, buyerReview: reviewText, ratedAt: 'Just now' }
          : ex
      );
      safeStorage.setJSON('idhar_udhar_exchanges', updated);
      broadcastSync('SYNC_EXCHANGES', updated);
      return updated;
    });

    if (reputation.isTrustworthy) {
      setActiveNotification({
        id: `notif-${Date.now()}`,
        title: '🌟 TRUSTWORTHY SELLER Earned!',
        body: `Seller earned the "TRUSTWORTHY SELLER" tag after 10+ consecutive ratings of 4★ or above!`,
        collegeName: 'UIET Kurukshetra',
        hostelName: 'Reputation System',
        requesterName: 'Campus Trust Protocol',
        requesterPhone: '',
        roomNumber: 'UIET',
        timestamp: 'Just now',
        requestId: 'reputation'
      });
    } else if (reputation.hasOneStarWarning) {
      setActiveNotification({
        id: `notif-${Date.now()}`,
        title: '⚠️ Seller Suspension Warning',
        body: 'You were constantly rated as 1, please review products to avoid suspension',
        collegeName: 'UIET Kurukshetra',
        hostelName: 'Safety Review',
        requesterName: 'Marketplace Safety',
        requesterPhone: '',
        roomNumber: 'Notice Board',
        timestamp: 'Just now',
        requestId: 'warning'
      });
    } else {
      setActiveNotification({
        id: `notif-${Date.now()}`,
        title: 'Rating Submitted!',
        body: `Thank you! Feedback recorded (${rating}★). It helps peers identify reliable campus sellers.`,
        collegeName: 'UIET Kurukshetra',
        hostelName: 'Handover Completed',
        requesterName: 'Campus Peer',
        requesterPhone: '',
        roomNumber: '',
        timestamp: 'Just now',
        requestId: 'feedback'
      });
    }
  };

  // When clicking "I have this" on a request
  const [activeRequestContact, setActiveRequestContact] = useState<CampusRequest | null>(null);

  const handleRespondToRequest = (req: CampusRequest) => {
    if (isGuestMode) {
      setGuestNotice({ isOpen: true, intent: 'message' });
      return;
    }
    setActiveRequestContact(req);
  };

  // Check if current logged-in user is suspended by admin
  const currentModerationRecord: UserModerationRecord | undefined = currentUser
    ? userModeration[currentUser.id] ||
      (currentUser.phone ? userModeration[`user-${currentUser.phone.replace(/\D/g, '').slice(-10)}`] : undefined)
    : undefined;

  const isCurrentUserSuspended = Boolean(
    currentUser &&
    !currentUser.isAdmin &&
    !isGuestMode &&
    (
      currentUser.isSuspended ||
      currentModerationRecord?.isSuspended
    )
  );

  return (
    <div className={`h-[100dvh] max-h-[100dvh] ${isDarkMode ? 'dark bg-[#0A0A0A]' : 'bg-[#F1F5F9]'} text-slate-900 dark:text-slate-100 flex items-center justify-center font-sans antialiased transition-colors duration-300 p-0 sm:p-3 overflow-hidden`}>
      {/* Device Frame matching mobile photos */}
      <div className="w-full max-w-md sm:max-w-lg h-full sm:h-[860px] sm:max-h-[94vh] bg-white dark:bg-[#0A0A0A] sm:rounded-[36px] sm:shadow-2xl flex flex-col border border-slate-200/80 dark:border-slate-800 overflow-hidden relative transition-colors duration-300">
        {/* Stage 1: 3D Boot Splash Screen with Rich Animations & Dark Mode Toggle */}
        {appStage === 'boot' && (
          <BootScreen
            onComplete={handleBootComplete}
            onContinueAsGuest={handleContinueAsGuest}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )}

        {/* Stage 2: Phone OTP & Onboarding Authentication with Dark Mode Toggle */}
        {appStage === 'auth' && (
          <AuthScreen
            onLoginSuccess={handleLoginSuccess}
            onContinueAsGuest={handleContinueAsGuest}
            initialMode={authInitialMode}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )}

        {/* Stage 3: Main Campus Marketplace Platform OR Blocked Screen for Suspended User */}
        {appStage === 'main' && currentUser && (
          isCurrentUserSuspended ? (
            <SuspendedScreen
              currentUser={currentUser}
              moderationRecord={currentModerationRecord}
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          ) : (
            <>
              {/* Top Bar Navigation with Animated Dark Mode Toggle at Top Right Corner */}
            <Navbar
              currentUser={currentUser}
              isDarkMode={isDarkMode}
              isGuest={isGuestMode}
              onToggleDarkMode={toggleDarkMode}
              onOpenProfile={() => {
                if (isGuestMode) {
                  setGuestNotice({ isOpen: true, intent: 'general' });
                  return;
                }
                setActiveChatListing(null);
                setCurrentTab('profile');
              }}
              onOpenCreateListing={() => {
                if (isGuestMode) {
                  setGuestNotice({ isOpen: true, intent: 'sell' });
                  return;
                }
                setIsCreateListingOpen(true);
              }}
              onOpenSearch={() => {
                setActiveChatListing(null);
                setCurrentTab('search');
              }}
              onOpenCreateRequest={() => {
                if (isGuestMode) {
                  setGuestNotice({ isOpen: true, intent: 'sell' });
                  return;
                }
                setIsCreateRequestOpen(true);
              }}
              onOpenRequests={() => {
                setActiveChatListing(null);
                setCurrentTab('requests');
              }}
              onOpenExchanges={() => {
                if (isGuestMode) {
                  setGuestNotice({ isOpen: true, intent: 'buy' });
                  return;
                }
                setActiveChatListing(null);
                setCurrentTab('exchanges');
              }}
              onLogout={handleLogout}
              onRequireAuth={(intent) => setGuestNotice({ isOpen: true, intent })}
              onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
              requestsCount={requests.length}
            />

            {/* Quick Context Subheader for Requests or Exchanges if currently active */}
            {(currentTab === 'requests' || currentTab === 'exchanges') && (
              <div className="bg-[#EEF2FF] dark:bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-[#E0E7FF] dark:border-slate-800 text-xs transition-colors duration-200">
                <span className="font-bold text-[#4F46E5] dark:text-cyan-400">
                  {currentTab === 'requests' ? '⚡ Campus Alert Radar' : '🤝 Campus Handover Safety'}
                </span>
                <button
                  onClick={() => setCurrentTab('home')}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
                >
                  Back to Home
                </button>
              </div>
            )}

            {/* Active Views */}
            <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              {/* Home View matching Screenshot 5 */}
              {currentTab === 'home' && (
                <MarketplaceFeed
                  listings={listings}
                  currentUser={currentUser}
                  onSelectListing={(listing) => setSelectedListingDetail(listing)}
                  onOpenSearch={() => setCurrentTab('search')}
                  onSelectCategory={(category) => {
                    setSearchCategory(category);
                    setCurrentTab('search');
                  }}
                  onOpenFullPhoto={(listing) => setFullPhotoImageListing(listing)}
                />
              )}

              {/* Search View matching Screenshot 7 */}
              {currentTab === 'search' && (
                <SearchView
                  listings={listings}
                  currentUser={currentUser}
                  initialCategory={searchCategory}
                  onBack={() => setCurrentTab('home')}
                  onSelectListing={(listing) => setSelectedListingDetail(listing)}
                  onOpenFullPhoto={(listing) => setFullPhotoImageListing(listing)}
                />
              )}

              {/* Inbox View & Direct Chat matching Screenshot 9 */}
              {currentTab === 'inbox' && (
                (activeChatThread || activeChatListing) ? (
                  <ChatView
                    thread={activeChatThread}
                    listing={activeChatListing}
                    currentUser={currentUser}
                    onBack={() => {
                      setActiveChatThread(null);
                      setActiveChatListing(null);
                    }}
                    onViewItem={(listing) => setSelectedListingDetail(listing)}
                    onScheduleHandover={(listing) => setExchangeTargetListing(listing)}
                  />
                ) : (
                  <InboxView
                    currentUser={currentUser}
                    listings={listings}
                    onSelectThread={(thread) => {
                      setActiveChatThread(thread);
                      const matched = listings.find((l) => l.id === thread.listingId);
                      setActiveChatListing(matched || null);
                    }}
                    onOpenMarketplace={() => setCurrentTab('home')}
                  />
                )
              )}

              {/* Profile View matching Screenshot 10 */}
              {currentTab === 'profile' && (
                <MyListingsView
                  currentUser={currentUser}
                  listings={listings}
                  requests={requests}
                  onUpdateUser={setCurrentUser}
                  onDeleteListing={handleDeleteListing}
                  onDeleteRequest={handleDeleteRequest}
                  onToggleListingStatus={handleToggleListingStatus}
                  onOpenCreateListing={() => setIsCreateListingOpen(true)}
                  onOpenCreateRequest={() => setIsCreateRequestOpen(true)}
                  onLogout={handleLogout}
                />
              )}

              {/* Request Daalna Alert Feed */}
              {currentTab === 'requests' && (
                <RequestDaalnaFeed
                  requests={requests}
                  currentUser={currentUser}
                  onOpenCreateRequest={() => setIsCreateRequestOpen(true)}
                  onRespondToRequest={handleRespondToRequest}
                />
              )}

              {/* Safe Campus Exchanges Feed */}
              {currentTab === 'exchanges' && (
                <ExchangesFeed
                  exchanges={exchanges}
                  currentUser={currentUser}
                  onCompleteExchange={handleCompleteExchange}
                  onOpenMarketplace={() => setCurrentTab('home')}
                  onOpenRateSeller={(exchange) => setRateExchangeTarget(exchange)}
                />
              )}
            </main>

            {/* Bottom Bar with Center Elevated FAB (+) matching Screenshots - Freeze Pane */}
            <BottomBar
              currentTab={
                currentTab === 'requests' || currentTab === 'exchanges'
                  ? 'home'
                  : currentTab
              }
              onSelectTab={handleSelectTab}
              onOpenCreate={handleOpenCreateFAB}
              unreadInboxCount={isGuestMode ? 0 : unreadChatCount}
            />

            {/* Quick Choice Action Sheet for the Elevated (+) FAB */}
            {isChoiceSheetOpen && (
              <div 
                onClick={() => setIsChoiceSheetOpen(false)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-sm bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3 animate-in slide-in-from-bottom-4 duration-200 text-slate-800 dark:text-slate-100"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-extrabold text-[#0F172A] dark:text-white">Campus Post</span>
                    <button
                      onClick={() => setIsChoiceSheetOpen(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIsChoiceSheetOpen(false);
                      if (isGuestMode) {
                        setGuestNotice({ isOpen: true, intent: 'sell' });
                        return;
                      }
                      setIsCreateListingOpen(true);
                    }}
                    className="w-full p-4 rounded-2xl bg-[#EEF2FF] hover:bg-[#E0E7FF] dark:bg-slate-800 dark:hover:bg-slate-700 text-left flex items-center gap-3.5 transition-colors cursor-pointer group border border-transparent dark:border-slate-700"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#4F46E5] dark:bg-cyan-500 text-white dark:text-slate-950 flex items-center justify-center shadow-sm shrink-0">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#0F172A] dark:text-white group-hover:text-[#4F46E5] dark:group-hover:text-cyan-400 transition-colors">
                        List an Item (Sell or Rent)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Upload item photos, price in ₹, condition, and details
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsChoiceSheetOpen(false);
                      if (isGuestMode) {
                        setGuestNotice({ isOpen: true, intent: 'sell' });
                        return;
                      }
                      setIsCreateRequestOpen(true);
                    }}
                    className="w-full p-4 rounded-2xl bg-orange-50 hover:bg-orange-100/80 dark:bg-orange-950/30 dark:hover:bg-orange-900/40 text-left flex items-center gap-3.5 transition-colors cursor-pointer group border border-orange-100 dark:border-orange-900/50"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-sm shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-orange-950 dark:text-orange-300 group-hover:text-orange-600 dark:group-hover:text-orange-200 transition-colors">
                        Post "Request Daalna" Alert
                      </h4>
                      <p className="text-xs text-orange-800/70 dark:text-orange-400/80 mt-0.5">
                        Attach reference photo & send targeted alert to your hostel
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Modals & Overlays */}
            {/* 1. Listing Detail Modal matching Screenshot 11 */}
            <ListingDetailModal
              listing={selectedListingDetail}
              currentUser={currentUser}
              isOpen={!!selectedListingDetail}
              isGuest={isGuestMode}
              onClose={() => setSelectedListingDetail(null)}
              onOpenChat={(listing) => {
                if (isGuestMode) {
                  setGuestNotice({ isOpen: true, intent: 'message' });
                  return;
                }
                setSelectedListingDetail(null);
                setActiveChatThread(null);
                setActiveChatListing(listing);
                setCurrentTab('inbox');
              }}
              onInitiateExchange={(listing) => {
                if (isGuestMode) {
                  setGuestNotice({ isOpen: true, intent: 'buy' });
                  return;
                }
                setSelectedListingDetail(null);
                setExchangeTargetListing(listing);
              }}
              onRequireAuth={(intent) => setGuestNotice({ isOpen: true, intent })}
              onOpenFullPhoto={(listing) => setFullPhotoImageListing(listing)}
              onReportListing={(listing, reason) => {
                setActiveNotification({
                  id: `report-${Date.now()}`,
                  title: '🚩 Listing Reported',
                  body: `"${listing.title}" has been flagged to moderators. Thank you for keeping campus safe.`,
                  collegeName: 'UIET Kurukshetra',
                  hostelName: 'Moderator Review Queue',
                  requesterName: 'Campus Safety',
                  requesterPhone: '',
                  roomNumber: '',
                  timestamp: 'Just now',
                  requestId: listing.id,
                });
              }}
              onAdminRemoveListing={handleAdminRemoveListing}
              onAdminWarnUser={handleAdminWarnUser}
              onAdminSuspendUser={handleAdminSuspendUser}
            />

            {/* 2. Campus Exchange Scheduling Modal */}
            {exchangeTargetListing && (
              <SecureExchangeModal
                listing={exchangeTargetListing}
                currentUser={currentUser}
                isOpen={!!exchangeTargetListing}
                onClose={() => setExchangeTargetListing(null)}
                onConfirmExchange={handleConfirmExchange}
              />
            )}

            {/* 3. Create Listing (Sell / Rent) Modal matching Screenshot 8 */}
            <CreateListingModal
              currentUser={currentUser}
              isOpen={isCreateListingOpen}
              onClose={() => setIsCreateListingOpen(false)}
              onSubmit={handleCreateListing}
            />

            {/* 4. "Request Daalna" Modal with photo attachment */}
            <CreateRequestModal
              currentUser={currentUser}
              isOpen={isCreateRequestOpen}
              onClose={() => setIsCreateRequestOpen(false)}
              onSubmit={handleCreateRequest}
            />

            {/* 5. Push Notification Alert Toast (Hostel Radar) */}
            <NotificationToast
              notification={activeNotification}
              onDismiss={() => setActiveNotification(null)}
              onViewRequest={() => {
                setActiveChatListing(null);
                setCurrentTab('requests');
              }}
            />

            {/* 6. Active Request Direct Connect Modal */}
            {activeRequestContact && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-sm w-full p-5 border border-slate-100 dark:border-slate-700 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                      Campus Handover Connect
                    </span>
                    <button
                      onClick={() => setActiveRequestContact(null)}
                      className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Connect with {activeRequestContact.requesterName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Request: "{activeRequestContact.title}" · Budget: ₹{activeRequestContact.maxBudget}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Hostel:</span>
                      <span className="font-bold">{activeRequestContact.hostelName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Room:</span>
                      <span className="font-bold">{activeRequestContact.roomNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Phone:</span>
                      <span className="font-mono font-bold">{activeRequestContact.requesterPhone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${activeRequestContact.requesterPhone.replace(/\D/g, '')}`}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Direct Call</span>
                    </a>

                    <a
                      href={`https://wa.me/${activeRequestContact.requesterPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${activeRequestContact.requesterName}! I saw your IDHAR UDHAR request for "${activeRequestContact.title}". I stay in ${currentUser?.hostelName || 'the same hostel'}, ${currentUser?.roomNumber || 'Room'}. I have this available right now!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Guest Mode Notice Small Dialog Box */}
            <GuestNoticeModal
              isOpen={guestNotice.isOpen}
              intent={guestNotice.intent}
              onClose={() => setGuestNotice({ isOpen: false, intent: 'general' })}
              onNavigateToAuth={handleNavigateFromGuestToAuth}
            />

            {/* 8. Full Photo Maximized Uncropped Lightbox (Requirement B) */}
            <ImageMaximizeModal
              listing={fullPhotoImageListing}
              isOpen={!!fullPhotoImageListing}
              onClose={() => setFullPhotoImageListing(null)}
            />

            {/* 9. Rate Seller Modal after successful handover */}
            {rateExchangeTarget && (
              <RateSellerModal
                exchange={rateExchangeTarget}
                isOpen={!!rateExchangeTarget}
                onClose={() => setRateExchangeTarget(null)}
                onSubmitRating={handleSubmitSellerRating}
              />
            )}

            {/* 10. Chief Proctor & Admin Moderation Panel Modal */}
            {currentUser && currentUser.isAdmin && (
              <AdminPanelModal
                isOpen={isAdminPanelOpen}
                onClose={() => setIsAdminPanelOpen(false)}
                currentUser={currentUser}
                listings={listings}
                userModeration={userModeration}
                removalLogs={removalLogs}
                onRemoveListing={handleAdminRemoveListing}
                onWarnUser={handleAdminWarnUser}
                onSuspendUser={handleAdminSuspendUser}
              />
            )}
          </>
        ))}
      </div>
    </div>
  );
}
