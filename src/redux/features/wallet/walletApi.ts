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
    }),
});

export const { useGetMyWalletQuery } = walletApi;
