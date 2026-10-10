import { Listing, CampusRequest, ExchangeSession, ChatMessage, ChatThread } from '../types';

export type RealtimeEventType =
  | 'INIT_CAMPUS_FEED'
  | 'LISTING_CREATED'
  | 'LISTING_UPDATED'
  | 'LISTING_DELETED'
  | 'REQUEST_CREATED'
  | 'REQUEST_DELETED'
  | 'EXCHANGE_CREATED'
  | 'EXCHANGE_COMPLETED'
  | 'NEW_MESSAGE'
  | 'USER_TYPING'
  | 'PRESENCE_CHANGE'
  | 'THREAD_CREATED'
  | 'USER_WARNED'
  | 'USER_SUSPENDED_STATUS'
  | 'MESSAGES_READ';

export type RealtimeEventListener = (event: {
  type: RealtimeEventType;
  payload: any;
}) => void;

class RealtimeCampusService {
  private ws: WebSocket | null = null;
  private listeners = new Set<RealtimeEventListener>();
  private reconnectTimer: any = null;
  private currentUserId: string | null = null;
  private currentUserName: string | null = null;
  private bc: BroadcastChannel | null = null;
  public onlineUserIds = new Set<string>();

  constructor() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.bc = new BroadcastChannel('idhar_udhar_campus_realtime_sync');
        this.bc.onmessage = (event) => {
          if (event.data?.type) {
            this.notifyListeners(event.data.type, event.data.payload);
          }
        };
      }
    } catch {}
  }

  public connect(userId: string = 'guest-explorer', userName: string = 'Guest') {
    this.currentUserId = userId;
    this.currentUserName = userName;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      this.send({ type: 'IDENTIFY', userId, userName });
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.send({ type: 'IDENTIFY', userId, userName });
      };

      this.ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);

          if (data.type === 'IDENTIFIED' && Array.isArray(data.onlineUsers)) {
            this.onlineUserIds = new Set(data.onlineUsers);
            this.notifyListeners('PRESENCE_CHANGE', { onlineUsers: data.onlineUsers });
          }

          if (data.type === 'PRESENCE_CHANGE') {
            if (Array.isArray(data.onlineUsers)) {
              this.onlineUserIds = new Set(data.onlineUsers);
            }
            this.notifyListeners('PRESENCE_CHANGE', data);
          }

          if (data.type === 'INIT_CAMPUS_FEED') {
            this.notifyListeners('INIT_CAMPUS_FEED', data);
          }

          if (data.type === 'LISTING_CREATED') {
            this.notifyListeners('LISTING_CREATED', data);
            this.broadcastLocal('LISTING_CREATED', data);
          }

          if (data.type === 'LISTING_UPDATED') {
            this.notifyListeners('LISTING_UPDATED', data);
            this.broadcastLocal('LISTING_UPDATED', data);
          }

          if (data.type === 'LISTING_DELETED') {
            this.notifyListeners('LISTING_DELETED', data);
            this.broadcastLocal('LISTING_DELETED', data);
          }

          if (data.type === 'REQUEST_CREATED') {
            this.notifyListeners('REQUEST_CREATED', data);
            this.broadcastLocal('REQUEST_CREATED', data);
          }

          if (data.type === 'REQUEST_DELETED') {
            this.notifyListeners('REQUEST_DELETED', data);
            this.broadcastLocal('REQUEST_DELETED', data);
          }

          if (data.type === 'EXCHANGE_CREATED') {
            this.notifyListeners('EXCHANGE_CREATED', data);
            this.broadcastLocal('EXCHANGE_CREATED', data);
          }

          if (data.type === 'EXCHANGE_COMPLETED') {
            this.notifyListeners('EXCHANGE_COMPLETED', data);
            this.broadcastLocal('EXCHANGE_COMPLETED', data);
          }

          if (data.type === 'NEW_MESSAGE') {
            this.notifyListeners('NEW_MESSAGE', data);
            this.broadcastLocal('NEW_MESSAGE', data);
          }

          if (data.type === 'USER_TYPING') {
            this.notifyListeners('USER_TYPING', data);
          }

          if (data.type === 'THREAD_CREATED') {
            this.notifyListeners('THREAD_CREATED', data);
            this.broadcastLocal('THREAD_CREATED', data);
          }

          if (data.type === 'MESSAGES_READ') {
            this.notifyListeners('MESSAGES_READ', data);
            this.broadcastLocal('MESSAGES_READ', data);
          }

          if (data.type === 'USER_WARNED') {
            this.notifyListeners('USER_WARNED', data);
            this.broadcastLocal('USER_WARNED', data);
          }

          if (data.type === 'USER_SUSPENDED_STATUS') {
            this.notifyListeners('USER_SUSPENDED_STATUS', data);
            this.broadcastLocal('USER_SUSPENDED_STATUS', data);
          }
        } catch (e) {
          console.warn('Error parsing incoming WS message:', e);
        }
      };

      this.ws.onclose = () => {
        this.ws = null;
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.connect(this.currentUserId || 'guest', this.currentUserName || 'Guest');
        }, 3000);
      };

      this.ws.onerror = () => {
        try { this.ws?.close(); } catch {}
      };
    } catch (e) {
      console.warn('WebSocket connection error:', e);
    }
  }

  public disconnect() {
    this.currentUserId = null;
    this.currentUserName = null;
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
  }

  public subscribe(listener: RealtimeEventListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(type: RealtimeEventType, payload: any) {
    for (const listener of this.listeners) {
      try {
        listener({ type, payload });
      } catch (err) {
        console.error('Realtime listener error:', err);
      }
    }
  }

  private broadcastLocal(type: string, payload: any) {
    try {
      this.bc?.postMessage({ type, payload });
    } catch {}
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to send WS message:', e);
      }
    }
  }

  // ==========================================
  // --- REAL-TIME MUTATION METHODS ---
  // ==========================================

  // Listings
  public createListing(listing: Listing) {
    this.send({
      type: 'CREATE_LISTING',
      listing,
    });
    fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing),
    }).catch(() => {});
  }

  public updateListingStatus(id: string, status: string) {
    this.send({
      type: 'UPDATE_LISTING_STATUS',
      id,
      status,
    });
    fetch(`/api/listings/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  public deleteListing(id: string) {
    this.send({
      type: 'DELETE_LISTING',
      id,
    });
    fetch(`/api/listings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(() => {});
  }

  // Requests
  public createRequest(request: CampusRequest) {
    this.send({
      type: 'CREATE_REQUEST',
      request,
    });
    fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    }).catch(() => {});
  }

  public deleteRequest(id: string) {
    this.send({
      type: 'DELETE_REQUEST',
      id,
    });
    fetch(`/api/requests/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(() => {});
  }

  // Exchanges
  public createExchange(exchange: ExchangeSession) {
    this.send({
      type: 'CREATE_EXCHANGE',
      exchange,
    });
    fetch('/api/exchanges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exchange),
    }).catch(() => {});
  }

  public completeExchange(id: string, listingId?: string) {
    this.send({
      type: 'COMPLETE_EXCHANGE',
      id,
      listingId,
    });
    fetch(`/api/exchanges/${encodeURIComponent(id)}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId }),
    }).catch(() => {});
  }

  // Chat
  public sendMessage(msg: {
    threadId: string;
    text: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    listingId?: string;
    listingTitle?: string;
    listingPrice?: number;
    receiverName?: string;
    receiverHostel?: string;
    senderHostel?: string;
  }) {
    this.send({
      type: 'SEND_MESSAGE',
      ...msg,
    });
  }

  public sendTyping(threadId: string, senderId: string, receiverId: string, isTyping: boolean) {
    this.send({
      type: 'TYPING',
      threadId,
      senderId,
      receiverId,
      isTyping,
    });
  }

  public markAsRead(threadId: string, userId: string) {
    this.send({
      type: 'MARK_READ',
      threadId,
      userId,
    });
  }

  // ==========================================
  // --- HTTP REST FETCH HELPERS ---
  // ==========================================

  public async fetchListings(): Promise<Listing[]> {
    try {
      const res = await fetch('/api/listings');
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
  }

  public async fetchRequests(): Promise<CampusRequest[]> {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
  }

  public async fetchExchanges(): Promise<ExchangeSession[]> {
    try {
      const res = await fetch('/api/exchanges');
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
  }

  // ==========================================
  // --- ADMIN MODERATION ACTIONS ---
  // ==========================================

  public adminRemoveListing(id: string, reason?: string, adminName?: string) {
    this.send({
      type: 'ADMIN_REMOVE_LISTING',
      id,
      reason,
      adminName,
    });
    fetch('/api/admin/remove-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reason, adminName }),
    }).catch(() => {});
  }

  public adminWarnUser(userId: string, reason: string, adminName?: string) {
    this.send({
      type: 'ADMIN_WARN_USER',
      userId,
      reason,
      adminName,
    });
    fetch('/api/admin/warn-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reason, adminName }),
    }).catch(() => {});
  }

  public adminSuspendUser(userId: string, suspended: boolean, reason?: string, adminName?: string) {
    this.send({
      type: 'ADMIN_SUSPEND_USER',
      userId,
      suspended,
      reason,
      adminName,
    });
    fetch('/api/admin/suspend-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, suspended, reason, adminName }),
    }).catch(() => {});
  }

  public async fetchModeration(): Promise<any> {
    try {
      const res = await fetch('/api/admin/moderation');
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { userModeration: {}, removalLogs: [] };
  }

  public async fetchThreads(userId: string): Promise<ChatThread[]> {
    try {
      const res = await fetch(`/api/chat/threads?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
  }

  public async fetchMessages(threadId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`/api/chat/messages?threadId=${encodeURIComponent(threadId)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
  }

  public async getOrCreateThread(payload: {
    listingId: string;
    listingTitle: string;
    listingPrice: number;
    sellerId: string;
    sellerName: string;
    sellerHostel: string;
    sellerPhone?: string;
    buyerId: string;
    buyerName: string;
    buyerHostel: string;
    buyerPhone?: string;
  }): Promise<ChatThread | null> {
    try {
      const res = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  }
}

export const realtimeService = new RealtimeCampusService();
export const chatService = realtimeService;
