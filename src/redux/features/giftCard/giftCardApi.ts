import { baseApi } from "@/redux/api/baseApi";
import { TAG_TYPES } from "@/constants/api";

export const giftCardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Direct purchase of a gift card for a recipient
        createGiftCardOrderCheckout: builder.mutation<any, {
            amount: number;
            recipientName: string;
            recipientEmail: string;
            personalMessage?: string;
            designIndex?: number;
            nickname?: string;
        }>({
            query: (data) => ({
                url: "/gift-cards/order-checkout",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [TAG_TYPES.GIFT_CARD, TAG_TYPES.USER_PROFILE],
        }),

        // Poll single gift card order by ID
        getGiftCardOrderById: builder.query<any, string>({
            query: (id) => ({
                url: `/gift-cards/orders/${id}`,
                method: "GET",
            }),
            providesTags: [TAG_TYPES.GIFT_CARD],
        }),

        // Get user's purchased gift card orders
        getMyGiftCardOrders: builder.query<any, Record<string, any> | void>({
            query: (params) => ({
                url: "/gift-cards/my-orders",
                method: "GET",
                params: params || {},
            }),
            providesTags: [TAG_TYPES.GIFT_CARD],
        }),

        // Admin: get all gift card orders and payment statuses
        getAllGiftCardOrders: builder.query<any, Record<string, any> | void>({
            query: (params) => ({
                url: "/gift-cards/admin/orders",
                method: "GET",
                params: params || {},
            }),
            providesTags: [TAG_TYPES.GIFT_CARD],
        }),

        // Legacy / fallback checkout
        createGiftCardCheckout: builder.mutation<any, {
            amount: number;
            recipientName: string;
            recipientEmail: string;
            personalMessage?: string;
            designIndex?: number;
            nickname?: string;
        }>({
            query: (data) => ({
                url: "/gift-cards/order-checkout",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [TAG_TYPES.GIFT_CARD, TAG_TYPES.USER_PROFILE],
        }),

        // Get authenticated user's gift cards, balance, transactions
        getMyGiftCards: builder.query<any, void>({
            query: () => ({
                url: "/gift-cards/my-cards",
                method: "GET",
            }),
            providesTags: [TAG_TYPES.GIFT_CARD],
        }),

        // Redeem a 16-digit/alphanumeric code
        redeemGiftCardCode: builder.mutation<any, { code: string }>({
            query: (data) => ({
                url: "/gift-cards/redeem",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [TAG_TYPES.GIFT_CARD, TAG_TYPES.USER_PROFILE, TAG_TYPES.WALLET],
        }),

        // Update card nickname or toggle active status
        updateGiftCard: builder.mutation<any, { id: string; nickname?: string; isActive?: boolean; status?: string }>({
            query: ({ id, ...data }) => ({
                url: `/gift-cards/my-cards/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [TAG_TYPES.GIFT_CARD],
        }),

        // Public check balance by code
        checkGiftCardBalance: builder.query<any, string>({
            query: (code) => ({
                url: `/gift-cards/balance/${code}`,
                method: "GET",
            }),
        }),

        // Admin: get all gift cards
        getAllGiftCards: builder.query<any, Record<string, any> | void>({
            query: (params) => ({
                url: "/gift-cards/admin/all",
                method: "GET",
                params: params || {},
            }),
            providesTags: [TAG_TYPES.GIFT_CARD],
        }),

        // Admin: add funds to a gift card or user
        adminAddFunds: builder.mutation<any, {
            giftCardId?: string;
            userId?: string;
            email?: string;
            amount: number;
            reason?: string;
        }>({
            query: (data) => ({
                url: "/gift-cards/admin/add-funds",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [TAG_TYPES.GIFT_CARD, TAG_TYPES.USER_PROFILE, TAG_TYPES.WALLET],
        }),
    }),
});

export const {
    useCreateGiftCardOrderCheckoutMutation,
    useGetGiftCardOrderByIdQuery,
    useGetMyGiftCardOrdersQuery,
    useGetAllGiftCardOrdersQuery,
    useCreateGiftCardCheckoutMutation,
    useGetMyGiftCardsQuery,
    useRedeemGiftCardCodeMutation,
    useUpdateGiftCardMutation,
    useCheckGiftCardBalanceQuery,
    useGetAllGiftCardsQuery,
    useAdminAddFundsMutation,
} = giftCardApi;
