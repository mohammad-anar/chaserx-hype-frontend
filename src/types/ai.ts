export type MoodType =
  | "happy"
  | "relaxed"
  | "stressed"
  | "tired"
  | "energetic"
  | "focused";

export interface MoodOption {
  id: MoodType;
  label: string;
  emoji: string;
  description: string;
  tagline: string;
}

export interface MoodRecommendationPreferences {
  sweet?: "low" | "medium" | "high" | boolean;
  milk?: boolean;
  caffeine?: "none" | "low" | "medium" | "high";
  temperature?: "HOT" | "COLD" | "BOTH";
}

export interface MoodRecommendationRequest {
  mood: string;
  inputText?: string;
  preferences?: MoodRecommendationPreferences;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  basePrice: number;
  price?: number;
  description?: string;
  image?: string | string[];
  caffeineMg?: number;
  sweetnessLevel?: number;
  bitternessLevel?: number;
  strengthLevel?: number;
  temperatureType?: "HOT" | "COLD" | "BOTH";
  flavorProfile?: string[];
  category?: any;
}

export interface RecommendedProductItem {
  product: RecommendedProduct;
  score: number;
  reason: string;
}

export interface MoodRecommendationData {
  mood: string;
  moodSummary?: string;
  recommendationId?: string;
  recommendations: RecommendedProductItem[];
}

export interface MoodRecommendationResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: MoodRecommendationData;
}

export interface RecommendationHistoryItem {
  id: string;
  mood: string;
  inputText?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  items: Array<{
    id: string;
    score: number;
    reason: string;
    product: RecommendedProduct;
  }>;
}

export interface RecommendationHistoryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: RecommendationHistoryItem[];
}
