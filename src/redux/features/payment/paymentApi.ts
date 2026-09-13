import { baseApi } from "../../api/baseApi";

export const paymentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        confirmPayment: builder.mutation({
            query: (data: { sessionId: string }) => ({
                url: "/payment/confirm",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Payment", "Order", "Cart", "User"],
        }),
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
    useConfirmPaymentMutation,
    useGetMyRewardPaymentsQuery,
    useGetMyPaymentsQuery,
} = paymentApi;
