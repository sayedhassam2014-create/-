
export interface User {
  name: string;
  avatarUrl: string;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
}

export interface SocialPost {
  id: string;
  user: User;
  outfitImageUrl?: string;
  videoUrl?: string;
  caption: string;
  likes: number;
  comments: Comment[];
}

export interface Product {
  id:string;
  name: string;
  price: string;
  imageUrl: string;
  isVerified?: boolean;
  brandId?: string;
}

export interface ProductItem {
    name: string;
    brand: string;
    price: string;
    url: string;
    isFromCloset?: boolean;
    isVerified?: boolean;
    keywords_en?: string[];
    keywords_ar?: string[];
    recommended_stores?: string[];
}

export interface Outfit {
  name: string;
  description: string;
  items: ProductItem[];
  imageUrl?: string;
  error?: string;
  sources?: GroundingChunks[];
  stylistNote?: string; // New: Expert stylist explanation
  occasion?: 'Casual' | 'Formal' | 'Evening'; // New: Occasion categorization
}

export interface SavedOutfit {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: number;
}

export interface UserClosetItem {
  id: string;
  imageUrl: string;
}

export enum AppView {
  HOME = 'home',
  AI_STYLIST = 'ai_stylist',
  CLOSET = 'closet',
  SOCIAL_FEED = 'social_feed',
  PROFILE = 'profile',
  VIRTUAL_DRESSING_ROOM = 'virtual_dressing_room',
  VOICEOVER_GENERATOR = 'voiceover_generator',
}

export interface UserProfile {
    gender: string;
    ageCategory: string;
}

export interface BodyProfile extends UserProfile {
    height: string;
    weight: string;
    chest: string;
    waist: string;
    analysis: string;
    bodyMeshSvg?: string;
}

export interface SizeRecommendation {
    size: string;
    analysis: string;
    confidence: number;
}

export interface GroundingChunks {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface DailyChallenge {
    id: string;
    title: string;
    description: string;
    participantsCount: number;
    timeLeft: string;
    reward: string;
}

export interface StyleBattle {
    id: string;
    imgA: string;
    imgB: string;
    userA: string;
    userB: string;
    votesA: number;
    votesB: number;
}

export interface ProductSearchItem {
  category: string;
  description: string;
  keywords_en: string[];
  keywords_ar: string[];
  recommended_stores: string[];
}

export interface ProductSearchOutfit {
  outfitName: string;
  outfit: ProductSearchItem[];
}
