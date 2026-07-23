import { baseApi } from "../../api/baseApi";

export const paymentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMyRewardPayments: builder.query({
            query: (params) => ({
                url: "/payment/my-reward-payments",
                method: "GET",
                params,
            }),
            providesTags: ["Payment"],
        }),
        getMyPayments: builder.query({
            query: (params) => ({
                url: "/payment/my-payments",
                method: "GET",
                params,
            }),
            providesTags: ["Payment"],
        }),
    }),
});

export const {
    useGetMyRewardPaymentsQuery,
    useGetMyPaymentsQuery,
} = paymentApi;
