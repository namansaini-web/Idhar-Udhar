export type CategoryType = 
  | 'Books'
  | 'Lab Gear'
  | 'Drafters & Tools'
  | 'Electronics'
  | 'Academics'
  | 'Lifestyle'
  | 'Sports and Fitness'
  | 'Accessories'
  | 'Other';

export type ListingType = 'sell' | 'rent';

export type RentPeriod = 'day' | 'week' | 'month' | 'semester';

export type ListingCondition = 'Brand New' | 'Like New' | 'Good' | 'Fair' | 'Heavily Used' | 'Almost New';

export interface UserWarning {
  id: string;
  reason: string;
  timestamp: string;
  by: string;
}

export interface UserModerationRecord {
  userId: string;
  isSuspended: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  warnings: UserWarning[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  gender?: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  rollNumber?: string;
  collegeId: string;
  collegeName: string;
  hostelName: string;
  roomNumber: string;
  course?: string;
  year?: string;
  studentId?: string;
  avatarSeed: string;
  joinedDate: string;
  isAdmin?: boolean;
  isSuspended?: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
  warnings?: UserWarning[];
}

export interface College {
  id: string;
  name: string;
  shortName: string;
  city: string;
  hostels: string[];
  safeMeetupSpots: string[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  originalCostPrice?: number;
  reasonForSelling?: string;
  listingType: ListingType;
  rentPeriod?: RentPeriod;
  category: CategoryType;
  condition: ListingCondition;
  collegeId: string;
  collegeName: string;
  hostelName: string;
  roomNumber: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  createdAt: string;
  imageUrl?: string;
  tags: string[];
  status: 'available' | 'reserved' | 'completed' | 'removed';
  removedByAdmin?: boolean;
  removalReason?: string;
}

export interface CampusRequest {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  maxBudget: number;
  urgency: 'Urgent (Today)' | 'Needed in 1-2 Days' | 'This Week';
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  collegeId: string;
  collegeName: string;
  hostelName: string;
  roomNumber: string;
  createdAt: string;
  imageUrl?: string;
  status: 'open' | 'fulfilled';
  responsesCount: number;
}

export interface ChatMessage {
  id: string;
  threadId?: string;
  listingId?: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  text: string;
  timestamp: string;
  createdAt?: number;
  isSeller?: boolean;
  read?: boolean;
}

export interface ChatThread {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage?: string;
  sellerId: string;
  sellerName: string;
  sellerHostel: string;
  sellerPhone?: string;
  buyerId: string;
  buyerName: string;
  buyerHostel?: string;
  buyerPhone?: string;
  lastMessageText: string;
  lastMessageTime: string;
  lastMessageSenderId?: string;
  unreadCount?: number;
  updatedAt?: number;
  messages?: ChatMessage[];
}

export interface ExchangeSession {
  id: string;
  listingId: string;
  listingTitle: string;
  price: number;
  listingType: ListingType;
  rentPeriod?: RentPeriod;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerHostel: string;
  sellerRoom: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerHostel: string;
  buyerRoom: string;
  campusLocation: string;
  exchangeCode: string;
  scheduledTime: string;
  status: 'scheduled' | 'met_on_campus' | 'completed' | 'cancelled';
  createdAt: string;
  buyerRating?: number;
  buyerReview?: string;
  ratedAt?: string;
}

export interface SellerRatingRecord {
  id: string;
  exchangeId: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  rating: number; // 1 to 5 stars
  reviewText?: string;
  listingTitle: string;
  createdAt: string;
}

export interface SellerReputation {
  sellerId: string;
  ratingsCount: number;
  averageRating: number;
  consecutiveFourPlus: number; // continuous streak of ratings >= 4
  totalFourPlus: number;
  oneStarCount: number; // number of 1-star ratings received
  isTrustworthy: boolean; // continuously rated 4+ stars 10+ times
  hasOneStarWarning: boolean; // rated 1 star 5+ times
  ratingHistory: number[];
}

export interface PushNotificationAlert {
  id: string;
  title: string;
  body: string;
  collegeName: string;
  hostelName: string;
  requesterName: string;
  requesterPhone: string;
  roomNumber: string;
  timestamp: string;
  requestId: string;
  imageUrl?: string;
}
