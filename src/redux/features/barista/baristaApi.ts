import { baseApi } from "@/redux/api/baseApi";
import { TAG_TYPES } from "@/constants/api";

export interface Barista {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isAvailable: boolean;
  skillLevel: number;
  activeOrderCount: number;
  station?: string;
  score?: number;
  activeOrders?: any[];
}

export interface BaristaListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Barista[];
}

export interface BaristaProfileResponse {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  role: string;
  station?: string | null;
  skillLevel?: number | null;
  isAvailable: boolean;
  activeOrderCount: number;
  metrics: {
    activeOrdersCount: number;
    completedTodayCount: number;
    totalCompletedCount: number;
  };
}

export const baristaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBaristas: builder.query<BaristaListResponse, void>({
      query: () => ({
        url: "/barista",
        method: "GET",
      }),
      providesTags: [TAG_TYPES.USER],
    }),

    getMyBaristaProfile: builder.query<{ success: boolean; data: BaristaProfileResponse }, void>({
      query: () => ({
        url: "/barista/me",
        method: "GET",
      }),
      providesTags: [TAG_TYPES.USER],
    }),

    updateMyBaristaProfile: builder.mutation<
      any,
      { isAvailable?: boolean; station?: string; name?: string; phone?: string; profileImage?: string }
    >({
      query: (body) => ({
        url: "/barista/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [TAG_TYPES.USER, TAG_TYPES.ORDER],
    }),

    claimOrder: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/barista/claim/${orderId}`,
        method: "POST",
      }),
      invalidatesTags: [TAG_TYPES.ORDER, TAG_TYPES.USER],
    }),

    createBarista: builder.mutation<
      any,
      {
        name: string;
        email: string;
        password?: string;
        phone?: string;
        station?: string;
        skillLevel?: number;
      }
    >({
      query: (body) => ({
        url: "/barista",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAG_TYPES.USER],
    }),

    updateBaristaProfile: builder.mutation<
      any,
      { id: string; isAvailable?: boolean; skillLevel?: number; station?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/barista/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [TAG_TYPES.USER, TAG_TYPES.ORDER],
    }),

    assignBaristaToOrder: builder.mutation<
      any,
      { orderId: string; baristaId?: string | null }
    >({
      query: ({ orderId, baristaId }) => ({
        url: `/barista/assign/${orderId}`,
        method: "POST",
        body: { baristaId },
      }),
      invalidatesTags: [TAG_TYPES.ORDER, TAG_TYPES.USER],
    }),
  }),
});

export const {
  useGetAllBaristasQuery,
  useGetMyBaristaProfileQuery,
  useUpdateMyBaristaProfileMutation,
  useClaimOrderMutation,
  useCreateBaristaMutation,
  useUpdateBaristaProfileMutation,
  useAssignBaristaToOrderMutation,
} = baristaApi;
