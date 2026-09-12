import { baseApi } from "../../api/baseApi";

export const walletApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMyWallet: builder.query({
            query: () => ({
                url: "/wallet/my-wallet",
                method: "GET",
            }),
            providesTags: ["Wallet"],
        }),
        claimDailyDrop: builder.mutation({
            query: () => ({
                url: "/wallet/claim-daily-drop",
                method: "POST",
            }),
            invalidatesTags: ["Wallet", "User"],
        }),
        claimFreePour: builder.mutation({
            query: () => ({
                url: "/wallet/claim-free-pour",
                method: "POST",
            }),
            invalidatesTags: ["Wallet", "User", "Order", "Cart"],
        }),
    }),
});

export const { 
    useGetMyWalletQuery,
    useClaimDailyDropMutation,
    useClaimFreePourMutation,
} = walletApi;

