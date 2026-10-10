import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import type { Listing, CampusRequest, ExchangeSession, ChatMessage, ChatThread, UserModerationRecord } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

// ==========================================
// --- SERVER IN-MEMORY & DISK PERSISTENT STATE ---
// ==========================================

const STATE_FILE = path.join(__dirname, 'server_state.json');

function getInitialState(): { listings: Listing[]; requests: CampusRequest[] } {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        listings: Array.isArray(data.listings) ? data.listings : [],
        requests: Array.isArray(data.requests) ? data.requests : [],
      };
    }
  } catch (err) {
    console.warn('[SERVER] Could not load state file for initialization:', err);
  }
  return { listings: [], requests: [] };
}

const initialLoaded = getInitialState();

// 1. Authoritative Campus Listings
let serverListings: Listing[] = initialLoaded.listings;

// 2. Authoritative Campus Requests ("Request Daalna")
let serverRequests: CampusRequest[] = initialLoaded.requests;

// 3. Authoritative Campus Handover Exchanges
let serverExchanges: ExchangeSession[] = [
  {
    id: 'exch-demo-1',
    listingId: 'lst-1',
    listingTitle: 'Omega Heavy-Duty Engineering Mini Drafter with Clamp & Bag',
    price: 320,
    listingType: 'sell',
    sellerId: 'user-rohit',
    sellerName: 'Rohit Sharma (ECE 3rd Yr)',
    sellerPhone: '+919872134560',
    sellerHostel: 'Shaheed Bhagat Singh Bhawan',
    sellerRoom: 'Room 312',
    buyerId: 'user-naman',
    buyerName: 'Naman',
    buyerPhone: '+91 9478579360',
    buyerHostel: 'Narhari Bhawan',
    buyerRoom: 'Room 112',
    campusLocation: 'Nescafe Booth (UIET)',
    exchangeCode: '4921',
    scheduledTime: 'Today at 5:30 PM (Post Classes)',
    status: 'scheduled',
    createdAt: '15 mins ago',
  },
];

let userModerationMap: Record<string, UserModerationRecord> = {
  'user-aitreya': { userId: 'user-aitreya', isSuspended: false, warnings: [] },
  'user-naman': { userId: 'user-naman', isSuspended: false, warnings: [] },
  'user-rivastik': { userId: 'user-rivastik', isSuspended: false, warnings: [] },
  'user-kushboo': { userId: 'user-kushboo', isSuspended: false, warnings: [] },
};

let adminRemovalLogs: {
  id: string;
  listingId: string;
  listingTitle: string;
  sellerId: string;
  reason?: string;
  timestamp: string;
  adminName: string;
}[] = [];

function loadServerState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.listings) && data.listings.length > 0) {
        serverListings = data.listings;
      }
      if (Array.isArray(data.requests) && data.requests.length > 0) {
        serverRequests = data.requests;
      }
      if (Array.isArray(data.exchanges) && data.exchanges.length > 0) {
        serverExchanges = data.exchanges;
      }
      if (data.userModeration) {
        userModerationMap = { ...userModerationMap, ...data.userModeration };
      }
      if (Array.isArray(data.adminRemovalLogs)) {
        adminRemovalLogs = data.adminRemovalLogs;
      }
      console.log(`[SERVER] State loaded from disk: ${serverListings.length} listings`);
    } else {
      saveServerState();
    }
  } catch (err) {
    console.warn('[SERVER] Could not load state from disk:', err);
  }
}

function saveServerState() {
  try {
    fs.writeFileSync(
      STATE_FILE,
      JSON.stringify(
        {
          listings: serverListings,
          requests: serverRequests,
          exchanges: serverExchanges,
          userModeration: userModerationMap,
          adminRemovalLogs: adminRemovalLogs,
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch (err) {
    console.warn('[SERVER] Could not save state to disk:', err);
  }
}

loadServerState();

// 4. Authoritative Chat Threads & Messages
const threads: Map<string, ChatThread> = new Map([
  [
    'thread-1',
    {
      id: 'thread-1',
      listingId: 'lst-1',
      listingTitle: 'First Year Engineering Mini Drafter & Scale',
      listingPrice: 320,
      sellerId: 'user-aitreya',
      sellerName: 'Aitreya Srivastava',
      sellerHostel: 'Shaheed Bhagat Singh Bhawan',
      sellerPhone: '+91 8094597917',
      buyerId: 'user-rivastik',
      buyerName: 'Rivastik',
      buyerHostel: 'Pratap Bhawan',
      buyerPhone: '+91 9034009669',
      lastMessageText: 'Can I collect it today near UIET Main Block after classes?',
      lastMessageTime: '10m ago',
      lastMessageSenderId: 'user-rivastik',
      unreadCount: 1,
      updatedAt: Date.now() - 1000 * 60 * 10,
    },
  ],
  [
    'thread-2',
    {
      id: 'thread-2',
      listingId: 'lst-2',
      listingTitle: 'Artificial Intelligence & Python Handbook',
      listingPrice: 280,
      sellerId: 'user-naman',
      sellerName: 'Naman',
      sellerHostel: 'Narhari Bhawan',
      sellerPhone: '+91 9478579360',
      buyerId: 'user-kushboo',
      buyerName: 'Kushboo',
      buyerHostel: 'Kalpana Chawla Bhawan',
      buyerPhone: '+91 9711457323',
      lastMessageText: 'Yes! All AIML lab code solutions are included in the handbook.',
      lastMessageTime: '25m ago',
      lastMessageSenderId: 'user-naman',
      unreadCount: 0,
      updatedAt: Date.now() - 1000 * 60 * 25,
    },
  ],
  [
    'thread-3',
    {
      id: 'thread-3',
      listingId: 'lst-3',
      listingTitle: 'Casio fx-991CW Scientific Calculator',
      listingPrice: 180,
      sellerId: 'user-rivastik',
      sellerName: 'Rivastik',
      sellerHostel: 'Pratap Bhawan',
      sellerPhone: '+91 9034009669',
      buyerId: 'user-aitreya',
      buyerName: 'Aitreya Srivastava',
      buyerHostel: 'Shaheed Bhagat Singh Bhawan',
      buyerPhone: '+91 8094597917',
      lastMessageText: 'Is the calculator approved for the mid-term examinations?',
      lastMessageTime: '1h ago',
      lastMessageSenderId: 'user-aitreya',
      unreadCount: 0,
      updatedAt: Date.now() - 1000 * 60 * 60,
    },
  ],
]);

const messages: Map<string, ChatMessage[]> = new Map([
  [
    'thread-1',
    [
      {
        id: 'msg-seed-1',
        threadId: 'thread-1',
        listingId: 'lst-1',
        senderId: 'user-rivastik',
        senderName: 'Rivastik',
        receiverId: 'user-aitreya',
        text: 'Hi Aitreya! Is the mini drafter clamp and scale in good condition?',
        timestamp: '15m ago',
        createdAt: Date.now() - 1000 * 60 * 15,
        read: true,
      },
      {
        id: 'msg-seed-2',
        threadId: 'thread-1',
        listingId: 'lst-1',
        senderId: 'user-aitreya',
        senderName: 'Aitreya Srivastava',
        receiverId: 'user-rivastik',
        text: 'Hey Rivastik! Yes, perfectly calibrated, used for ED lab only. Has protective black bag.',
        timestamp: '12m ago',
        createdAt: Date.now() - 1000 * 60 * 12,
        read: true,
      },
      {
        id: 'msg-seed-3',
        threadId: 'thread-1',
        listingId: 'lst-1',
        senderId: 'user-rivastik',
        senderName: 'Rivastik',
        receiverId: 'user-aitreya',
        text: 'Can I collect it today near UIET Main Block after classes?',
        timestamp: '10m ago',
        createdAt: Date.now() - 1000 * 60 * 10,
        read: false,
      },
    ],
  ],
  [
    'thread-2',
    [
      {
        id: 'msg-seed-4',
        threadId: 'thread-2',
        listingId: 'lst-2',
        senderId: 'user-kushboo',
        senderName: 'Kushboo',
        receiverId: 'user-naman',
        text: 'Hi Naman, does this handbook cover the 1st semester AIML syllabus?',
        timestamp: '30m ago',
        createdAt: Date.now() - 1000 * 60 * 30,
        read: true,
      },
      {
        id: 'msg-seed-5',
        threadId: 'thread-2',
        listingId: 'lst-2',
        senderId: 'user-naman',
        senderName: 'Naman',
        receiverId: 'user-kushboo',
        text: 'Yes! All AIML lab code solutions are included in the handbook.',
        timestamp: '25m ago',
        createdAt: Date.now() - 1000 * 60 * 25,
        read: true,
      },
    ],
  ],
  [
    'thread-3',
    [
      {
        id: 'msg-seed-6',
        threadId: 'thread-3',
        listingId: 'lst-3',
        senderId: 'user-aitreya',
        senderName: 'Aitreya Srivastava',
        receiverId: 'user-rivastik',
        text: 'Is the calculator approved for the mid-term examinations?',
        timestamp: '1h ago',
        createdAt: Date.now() - 1000 * 60 * 60,
        read: true,
      },
    ],
  ],
]);

// ==========================================
// --- WEBSOCKET SERVER & BROADCASTING ---
// ==========================================

interface SocketMetadata {
  ws: WebSocket;
  userId?: string;
  userName?: string;
}

const activeSockets = new Set<SocketMetadata>();

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Broadcast to ALL connected clients (for listings, requests, exchanges)
function broadcastToAll(payload: any) {
  const data = JSON.stringify(payload);
  for (const client of activeSockets) {
    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(data);
      } catch {}
    }
  }
}

// Broadcast to targeted recipients (for private chat messages)
function broadcastTargeted(payload: any, recipientFilter: (meta: SocketMetadata) => boolean) {
  const data = JSON.stringify(payload);
  for (const client of activeSockets) {
    if (client.ws.readyState === WebSocket.OPEN && recipientFilter(client)) {
      try {
        client.ws.send(data);
      } catch {}
    }
  }
}

wss.on('connection', (ws) => {
  const clientMeta: SocketMetadata = { ws };
  activeSockets.add(clientMeta);

  // Send initial authoritative state immediately upon connection
  try {
    ws.send(
      JSON.stringify({
        type: 'INIT_CAMPUS_FEED',
        listings: serverListings,
        requests: serverRequests,
        exchanges: serverExchanges,
        userModeration: userModerationMap,
        adminRemovalLogs: adminRemovalLogs,
      })
    );
  } catch {}

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      // 1. Client identification
      if (msg.type === 'IDENTIFY') {
        clientMeta.userId = msg.userId;
        clientMeta.userName = msg.userName;

        const onlineIds = Array.from(activeSockets)
          .map((c) => c.userId)
          .filter((id): id is string => !!id);

        ws.send(
          JSON.stringify({
            type: 'IDENTIFIED',
            userId: msg.userId,
            onlineUsers: onlineIds,
          })
        );

        broadcastToAll({
          type: 'PRESENCE_CHANGE',
          userId: msg.userId,
          online: true,
          onlineUsers: onlineIds,
        });
      }

      // 2. Real-time Listing Creation
      if (msg.type === 'CREATE_LISTING') {
        const listing: Listing = msg.listing;
        if (listing && listing.id) {
          if (!serverListings.some((l) => l.id === listing.id)) {
            serverListings.unshift(listing);
            saveServerState();
          }
          broadcastToAll({
            type: 'LISTING_CREATED',
            listing,
          });
        }
      }

      // 3. Real-time Listing Status Update (e.g. available <-> completed)
      if (msg.type === 'UPDATE_LISTING_STATUS') {
        const { id, status } = msg;
        serverListings = serverListings.map((l) =>
          l.id === id ? { ...l, status } : l
        );
        saveServerState();
        broadcastToAll({
          type: 'LISTING_UPDATED',
          id,
          status,
        });
      }

      // 4. Real-time Listing Deletion
      if (msg.type === 'DELETE_LISTING') {
        const { id } = msg;
        serverListings = serverListings.filter((l) => l.id !== id);
        saveServerState();
        broadcastToAll({
          type: 'LISTING_DELETED',
          id,
        });
      }

      // 5. Real-time Request Daalna Creation
      if (msg.type === 'CREATE_REQUEST') {
        const request: CampusRequest = msg.request;
        if (request && request.id) {
          if (!serverRequests.some((r) => r.id === request.id)) {
            serverRequests.unshift(request);
            saveServerState();
          }
          broadcastToAll({
            type: 'REQUEST_CREATED',
            request,
          });
        }
      }

      // 6. Real-time Request Deletion
      if (msg.type === 'DELETE_REQUEST') {
        const { id } = msg;
        serverRequests = serverRequests.filter((r) => r.id !== id);
        saveServerState();
        broadcastToAll({
          type: 'REQUEST_DELETED',
          id,
        });
      }

      // 7. Real-time Campus Handover Session Creation
      if (msg.type === 'CREATE_EXCHANGE') {
        const exchange: ExchangeSession = msg.exchange;
        if (exchange && exchange.id) {
          if (!serverExchanges.some((e) => e.id === exchange.id)) {
            serverExchanges.unshift(exchange);
            saveServerState();
          }
          broadcastToAll({
            type: 'EXCHANGE_CREATED',
            exchange,
          });
        }
      }

      // 8. Real-time Handover Completion
      if (msg.type === 'COMPLETE_EXCHANGE') {
        const { id, listingId } = msg;
        serverExchanges = serverExchanges.map((e) =>
          e.id === id ? { ...e, status: 'completed' } : e
        );
        if (listingId) {
          serverListings = serverListings.map((l) =>
            l.id === listingId ? { ...l, status: 'completed' } : l
          );
        }
        saveServerState();
        broadcastToAll({
          type: 'EXCHANGE_COMPLETED',
          id,
          listingId,
        });
      }

      // 9. Real-time Direct Chat Message Sending
      if (msg.type === 'SEND_MESSAGE') {
        const { threadId, text, senderId, senderName, receiverId, listingId } = msg;
        if (!text || !senderId || !receiverId) return;

        let thread = threads.get(threadId);
        if (!thread && listingId) {
          thread = {
            id: threadId,
            listingId,
            listingTitle: msg.listingTitle || 'Campus Listing',
            listingPrice: msg.listingPrice || 0,
            sellerId: receiverId,
            sellerName: msg.receiverName || 'Campus Peer',
            sellerHostel: msg.receiverHostel || 'UIET Hostel',
            buyerId: senderId,
            buyerName: senderName,
            buyerHostel: msg.senderHostel || 'UIET Hostel',
            lastMessageText: text,
            lastMessageTime: 'Just now',
            lastMessageSenderId: senderId,
            unreadCount: 1,
            updatedAt: Date.now(),
          };
          threads.set(threadId, thread);
        }

        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          threadId,
          listingId: thread?.listingId || listingId,
          senderId,
          senderName,
          receiverId,
          text,
          timestamp: 'Just now',
          createdAt: Date.now(),
          read: false,
        };

        const threadMsgs = messages.get(threadId) || [];
        threadMsgs.push(newMsg);
        messages.set(threadId, threadMsgs);

        if (thread) {
          thread.lastMessageText = text;
          thread.lastMessageTime = 'Just now';
          thread.lastMessageSenderId = senderId;
          thread.updatedAt = Date.now();
          threads.set(threadId, thread);
        }

        broadcastTargeted(
          {
            type: 'NEW_MESSAGE',
            message: newMsg,
            thread,
          },
          (c) => c.userId === senderId || c.userId === receiverId
        );
      }

      // 10. Real-time Peer Typing Indicator
      if (msg.type === 'TYPING') {
        const { threadId, senderId, receiverId, isTyping } = msg;
        broadcastTargeted(
          {
            type: 'USER_TYPING',
            threadId,
            senderId,
            isTyping: !!isTyping,
          },
          (c) => c.userId === receiverId
        );
      }

      // 11. Read Receipts
      if (msg.type === 'MARK_READ') {
        const { threadId, userId } = msg;
        const threadMsgs = messages.get(threadId);
        if (threadMsgs) {
          for (const m of threadMsgs) {
            if (m.receiverId === userId) {
              m.read = true;
            }
          }
        }
        const thread = threads.get(threadId);
        if (thread && thread.lastMessageSenderId !== userId) {
          thread.unreadCount = 0;
        }
        broadcastTargeted(
          {
            type: 'MESSAGES_READ',
            threadId,
            userId,
          },
          (c) =>
            c.userId === userId ||
            !!(thread && (c.userId === thread.sellerId || c.userId === thread.buyerId))
        );
      }

      // 12. Admin Remove Listing (with optional reason message)
      if (msg.type === 'ADMIN_REMOVE_LISTING') {
        const { id, reason, adminName } = msg;
        const found = serverListings.find((l) => l.id === id);
        serverListings = serverListings.filter((l) => l.id !== id);
        if (found) {
          adminRemovalLogs.unshift({
            id: `log-${Date.now()}`,
            listingId: id,
            listingTitle: found.title,
            sellerId: found.sellerId,
            reason: reason?.trim() || undefined,
            timestamp: new Date().toLocaleTimeString(),
            adminName: adminName || 'Campus Proctor',
          });
        }
        saveServerState();
        broadcastToAll({
          type: 'LISTING_DELETED',
          id,
          removedByAdmin: true,
          reason: reason?.trim() || undefined,
          sellerId: found?.sellerId,
          listingTitle: found?.title,
          adminName: adminName || 'Campus Proctor',
        });
      }

      // 13. Admin Give Warning to User
      if (msg.type === 'ADMIN_WARN_USER') {
        const { userId, reason, adminName } = msg;
        if (userId && reason) {
          if (!userModerationMap[userId]) {
            userModerationMap[userId] = { userId, isSuspended: false, warnings: [] };
          }
          const warning = {
            id: `warn-${Date.now()}`,
            reason: reason.trim(),
            timestamp: new Date().toLocaleTimeString(),
            by: adminName || 'Campus Proctor',
          };
          userModerationMap[userId].warnings.push(warning);
          saveServerState();
          broadcastToAll({
            type: 'USER_WARNED',
            userId,
            warning,
            moderation: userModerationMap[userId],
          });
        }
      }

      // 14. Admin Suspend / Unsuspend User
      if (msg.type === 'ADMIN_SUSPEND_USER') {
        const { userId, suspended, reason, adminName } = msg;
        if (userId) {
          if (!userModerationMap[userId]) {
            userModerationMap[userId] = { userId, isSuspended: false, warnings: [] };
          }
          userModerationMap[userId].isSuspended = !!suspended;
          saveServerState();
          broadcastToAll({
            type: 'USER_SUSPENDED_STATUS',
            userId,
            isSuspended: !!suspended,
            reason: reason?.trim() || undefined,
            adminName: adminName || 'Campus Proctor',
            moderation: userModerationMap[userId],
          });
        }
      }
    } catch (err) {
      console.error('WS Error processing message:', err);
    }
  });

  ws.on('close', () => {
    activeSockets.delete(clientMeta);
    if (clientMeta.userId) {
      const onlineIds = Array.from(activeSockets)
        .map((c) => c.userId)
        .filter((id): id is string => !!id);

      broadcastToAll({
        type: 'PRESENCE_CHANGE',
        userId: clientMeta.userId,
        online: false,
        onlineUsers: onlineIds,
      });
    }
  });
});

// ==========================================
// --- REST API ENDPOINTS ---
// ==========================================

// Listings API
app.get('/api/listings', (_req, res) => {
  res.json(serverListings);
});

app.post('/api/listings', (req, res) => {
  const listing: Listing = req.body;
  if (!listing || !listing.id) {
    return res.status(400).json({ error: 'Valid listing payload required' });
  }
  if (!serverListings.some((l) => l.id === listing.id)) {
    serverListings.unshift(listing);
    saveServerState();
  }
  broadcastToAll({
    type: 'LISTING_CREATED',
    listing,
  });
  res.json(listing);
});

app.put('/api/listings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  serverListings = serverListings.map((l) => (l.id === id ? { ...l, status } : l));
  saveServerState();
  broadcastToAll({
    type: 'LISTING_UPDATED',
    id,
    status,
  });
  res.json({ success: true, id, status });
});

app.delete('/api/listings/:id', (req, res) => {
  const { id } = req.params;
  serverListings = serverListings.filter((l) => l.id !== id);
  saveServerState();
  broadcastToAll({
    type: 'LISTING_DELETED',
    id,
  });
  res.json({ success: true, id });
});

// Requests API
app.get('/api/requests', (_req, res) => {
  res.json(serverRequests);
});

app.post('/api/requests', (req, res) => {
  const request: CampusRequest = req.body;
  if (!request || !request.id) {
    return res.status(400).json({ error: 'Valid request payload required' });
  }
  if (!serverRequests.some((r) => r.id === request.id)) {
    serverRequests.unshift(request);
    saveServerState();
  }
  broadcastToAll({
    type: 'REQUEST_CREATED',
    request,
  });
  res.json(request);
});

app.delete('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  serverRequests = serverRequests.filter((r) => r.id !== id);
  saveServerState();
  broadcastToAll({
    type: 'REQUEST_DELETED',
    id,
  });
  res.json({ success: true, id });
});

// Exchanges API
app.get('/api/exchanges', (_req, res) => {
  res.json(serverExchanges);
});

app.post('/api/exchanges', (req, res) => {
  const exchange: ExchangeSession = req.body;
  if (!exchange || !exchange.id) {
    return res.status(400).json({ error: 'Valid exchange payload required' });
  }
  if (!serverExchanges.some((e) => e.id === exchange.id)) {
    serverExchanges.unshift(exchange);
    saveServerState();
  }
  broadcastToAll({
    type: 'EXCHANGE_CREATED',
    exchange,
  });
  res.json(exchange);
});

app.put('/api/exchanges/:id/complete', (req, res) => {
  const { id } = req.params;
  const { listingId } = req.body;
  serverExchanges = serverExchanges.map((e) =>
    e.id === id ? { ...e, status: 'completed' } : e
  );
  if (listingId) {
    serverListings = serverListings.map((l) =>
      l.id === listingId ? { ...l, status: 'completed' } : l
    );
  }
  saveServerState();
  broadcastToAll({
    type: 'EXCHANGE_COMPLETED',
    id,
    listingId,
  });
  res.json({ success: true, id, listingId });
});

// Chat Threads API
app.get('/api/chat/threads', (req, res) => {
  const userId = req.query.userId as string;
  const all = Array.from(threads.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  if (!userId) {
    return res.json(all);
  }
  const filtered = all.filter((t) => t.sellerId === userId || t.buyerId === userId);
  res.json(filtered);
});

app.get('/api/chat/messages', (req, res) => {
  const threadId = req.query.threadId as string;
  if (!threadId) {
    return res.status(400).json({ error: 'threadId is required' });
  }
  const list = messages.get(threadId) || [];
  res.json(list);
});

app.post('/api/chat/threads', (req, res) => {
  const {
    listingId,
    listingTitle,
    listingPrice,
    sellerId,
    sellerName,
    sellerHostel,
    sellerPhone,
    buyerId,
    buyerName,
    buyerHostel,
    buyerPhone,
  } = req.body;
  if (!listingId || !sellerId || !buyerId) {
    return res.status(400).json({ error: 'Missing required thread fields' });
  }

  for (const t of threads.values()) {
    if (t.listingId === listingId && t.buyerId === buyerId) {
      return res.json(t);
    }
  }

  const id = `thread-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newThread: ChatThread = {
    id,
    listingId,
    listingTitle: listingTitle || 'Campus Item',
    listingPrice: Number(listingPrice) || 0,
    sellerId,
    sellerName: sellerName || 'Seller',
    sellerHostel: sellerHostel || 'UIET Hostel',
    sellerPhone,
    buyerId,
    buyerName: buyerName || 'Buyer',
    buyerHostel: buyerHostel || 'UIET Hostel',
    buyerPhone,
    lastMessageText: 'Chat started',
    lastMessageTime: 'Just now',
    lastMessageSenderId: buyerId,
    unreadCount: 0,
    updatedAt: Date.now(),
  };

  threads.set(id, newThread);
  messages.set(id, []);

  broadcastToAll({
    type: 'THREAD_CREATED',
    thread: newThread,
  });

  res.json(newThread);
});

// ==========================================
// --- REAL-TIME OTP AUTHENTICATION API ---
// ==========================================

interface OtpRecord {
  otp: string;
  phone: string;
  expiresAt: number;
}
const activeOtps = new Map<string, OtpRecord>();

// Send Real-Time OTP
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number required' });
  }

  // Generate a real-time 4-digit OTP code
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  activeOtps.set(cleanPhone, { otp, phone: cleanPhone, expiresAt });

  console.log(`[REAL-TIME OTP] Delivered OTP ${otp} to +91 ${cleanPhone}`);

  // Broadcast real-time OTP delivery event over WebSocket to all connected clients
  broadcastToAll({
    type: 'REALTIME_OTP_DELIVERED',
    phone: cleanPhone,
    otp,
    expiresAt,
  });

  res.json({
    success: true,
    message: `Real-time OTP delivered to +91 ${cleanPhone}`,
    otp,
    phone: cleanPhone,
    expiresIn: 300,
  });
});

// Verify Real-Time OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
  const code = otp.toString().trim();

  const record = activeOtps.get(cleanPhone);

  // Predefined student & admin accounts OTPs:
  // Aitreya (2005), Naman (1183), Rivastik (6699), Kushboo (7323), Admin (9999), Demo (4921)
  const PREDEFINED_OTPS = ['2005', '1183', '6699', '7323', '9999', '4921'];

  const isValid =
    (record && record.otp === code && Date.now() <= record.expiresAt) ||
    PREDEFINED_OTPS.includes(code);

  if (!isValid) {
    return res.status(400).json({
      error: 'Invalid or expired OTP. Please click Get OTP to request a fresh code.',
    });
  }

  // Remove verified OTP
  activeOtps.delete(cleanPhone);

  res.json({
    success: true,
    verified: true,
    phone: cleanPhone,
  });
});

// ==========================================
// --- ADMIN MODERATION REST APIS ---
// ==========================================

app.get('/api/admin/moderation', (_req, res) => {
  res.json({
    userModeration: userModerationMap,
    removalLogs: adminRemovalLogs,
  });
});

app.post('/api/admin/remove-listing', (req, res) => {
  const { id, reason, adminName } = req.body;
  if (!id) return res.status(400).json({ error: 'Listing ID is required' });

  const found = serverListings.find((l) => l.id === id);
  serverListings = serverListings.filter((l) => l.id !== id);

  if (found) {
    adminRemovalLogs.unshift({
      id: `log-${Date.now()}`,
      listingId: id,
      listingTitle: found.title,
      sellerId: found.sellerId,
      reason: reason?.trim() || undefined,
      timestamp: new Date().toLocaleTimeString(),
      adminName: adminName || 'Campus Proctor',
    });
  }

  saveServerState();

  broadcastToAll({
    type: 'LISTING_DELETED',
    id,
    removedByAdmin: true,
    reason: reason?.trim() || undefined,
    sellerId: found?.sellerId,
    listingTitle: found?.title,
    adminName: adminName || 'Campus Proctor',
  });

  res.json({ success: true, id, reason: reason?.trim() || null });
});

app.post('/api/admin/warn-user', (req, res) => {
  const { userId, reason, adminName } = req.body;
  if (!userId || !reason) {
    return res.status(400).json({ error: 'User ID and reason are required' });
  }

  if (!userModerationMap[userId]) {
    userModerationMap[userId] = { userId, isSuspended: false, warnings: [] };
  }

  const warning = {
    id: `warn-${Date.now()}`,
    reason: reason.trim(),
    timestamp: new Date().toLocaleTimeString(),
    by: adminName || 'Campus Proctor',
  };

  userModerationMap[userId].warnings.push(warning);
  saveServerState();

  broadcastToAll({
    type: 'USER_WARNED',
    userId,
    warning,
    moderation: userModerationMap[userId],
  });

  res.json({ success: true, userId, warning, moderation: userModerationMap[userId] });
});

app.post('/api/admin/suspend-user', (req, res) => {
  const { userId, suspended, reason, adminName } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  if (!userModerationMap[userId]) {
    userModerationMap[userId] = { userId, isSuspended: false, warnings: [] };
  }

  const isSusp = !!suspended;
  userModerationMap[userId].isSuspended = isSusp;
  if (isSusp) {
    userModerationMap[userId].suspensionReason = reason?.trim() || undefined;
    userModerationMap[userId].suspendedAt = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    userModerationMap[userId].suspendedBy = adminName || 'Campus Proctor';
  } else {
    userModerationMap[userId].suspensionReason = undefined;
    userModerationMap[userId].suspendedAt = undefined;
    userModerationMap[userId].suspendedBy = undefined;
  }
  saveServerState();

  broadcastToAll({
    type: 'USER_SUSPENDED_STATUS',
    userId,
    isSuspended: isSusp,
    reason: reason?.trim() || undefined,
    adminName: adminName || 'Campus Proctor',
    moderation: userModerationMap[userId],
  });

  res.json({ success: true, userId, isSuspended: isSusp, moderation: userModerationMap[userId] });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.K_SERVICE) ||
    (!process.env.NODE_ENV && fs.existsSync(path.join(__dirname, 'dist')));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Bind explicitly to 0.0.0.0 (all network interfaces) and process.env.PORT || 3000 to prevent Cloud Run timeout
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = '0.0.0.0';

  server.listen(PORT, HOST, () => {
    console.log(`Server listening on host ${HOST} and port ${PORT}`);
  });
}

startServer();
