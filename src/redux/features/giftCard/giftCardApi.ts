import { baseApi } from "@/redux/api/baseApi";
import { TAG_TYPES } from "@/constants/api";

export const giftCardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Purchase a gift card
        createGiftCardCheckout: builder.mutation<any, {
            amount: number;
            recipientName: string;
            recipientEmail: string;
            personalMessage?: string;
            designIndex?: number;
            nickname?: string;
        }>({
            query: (data) => ({
                url: "/gift-cards/checkout",
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
    useCreateGiftCardCheckoutMutation,
    useGetMyGiftCardsQuery,
    useRedeemGiftCardCodeMutation,
    useUpdateGiftCardMutation,
    useCheckGiftCardBalanceQuery,
    useGetAllGiftCardsQuery,
    useAdminAddFundsMutation,
} = giftCardApi;
