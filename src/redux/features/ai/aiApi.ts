import { baseApi } from "@/redux/api/baseApi";
import { TAG_TYPES } from "@/constants/api";
import {
  MoodRecommendationRequest,
  MoodRecommendationResponse,
  RecommendationHistoryResponse,
} from "@/types/ai";

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMoodRecommendation: builder.mutation<
      MoodRecommendationResponse,
      MoodRecommendationRequest
    >({
      query: (body) => ({
        url: "/ai/mood-recommendation",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.AI, TAG_TYPES.RECOMMENDATIONS],
    }),

    getRecommendationHistory: builder.query<
      RecommendationHistoryResponse,
      { page?: number; limit?: number; sortBy?: string; sortOrder?: "asc" | "desc" } | undefined
    >({
      query: (params) => ({
        url: "/ai/recommendations/history",
        method: "GET",
        params,
      }),
      providesTags: [TAG_TYPES.AI, TAG_TYPES.RECOMMENDATIONS],
    }),

    naturalLanguageProductSearch: builder.mutation<
      any,
      { query: string }
    >({
      query: (body) => ({
        url: "/ai/product-search",
        method: "POST",
        body,
      }),
    }),

    chatWithAi: builder.mutation<
      any,
      {
        message: string;
        conversationHistory?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
      }
    >({
      query: (body) => ({
        url: "/ai/chat",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetMoodRecommendationMutation,
  useGetRecommendationHistoryQuery,
  useNaturalLanguageProductSearchMutation,
  useChatWithAiMutation,
} = aiApi;
