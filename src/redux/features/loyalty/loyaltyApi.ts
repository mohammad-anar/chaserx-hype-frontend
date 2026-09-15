import { baseApi } from "@/redux/api/baseApi";
import { TAG_TYPES } from "@/constants/api";

export const loyaltyApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get authenticated user's loyalty profile with QR code and points
        getMyLoyaltyProfile: builder.query<any, void>({
            query: () => ({
                url: "/loyalty/my-profile",
                method: "GET",
            }),
            providesTags: [TAG_TYPES.LOYALTY, TAG_TYPES.WALLET, TAG_TYPES.USER_PROFILE],
        }),

        // Get customer's points history
        getMyPointsHistory: builder.query<any, Record<string, any> | void>({
            query: (params) => ({
                url: "/loyalty/my-history",
                method: "GET",
                params: params || {},
            }),
            providesTags: [TAG_TYPES.LOYALTY],
        }),

        // Barista/Admin lookup by QR loyalty code
        lookupLoyaltyCode: builder.query<any, string>({
            query: (code) => ({
                url: `/loyalty/lookup/${code}`,
                method: "GET",
            }),
            providesTags: [TAG_TYPES.LOYALTY],
        }),

        // Barista/Admin process manual points
        processManualPoints: builder.mutation<any, {
            loyaltyCode: string;
            points: number;
            type?: string;
            reason?: string;
        }>({
            query: (data) => ({
                url: "/loyalty/scan",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [TAG_TYPES.LOYALTY, TAG_TYPES.WALLET, TAG_TYPES.USER],
        }),

        // Admin: all point transactions log
        getAllPointTransactions: builder.query<any, Record<string, any> | void>({
            query: (params) => ({
                url: "/loyalty/admin/transactions",
                method: "GET",
                params: params || {},
            }),
            providesTags: [TAG_TYPES.LOYALTY],
        }),
    }),
});

export const {
    useGetMyLoyaltyProfileQuery,
    useGetMyPointsHistoryQuery,
    useLazyLookupLoyaltyCodeQuery,
    useLookupLoyaltyCodeQuery,
    useProcessManualPointsMutation,
    useGetAllPointTransactionsQuery,
} = loyaltyApi;
