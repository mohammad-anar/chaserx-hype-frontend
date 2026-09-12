import { baseApi } from "../../api/baseApi";

export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        checkout: builder.mutation({
            query: (payload) => ({
                url: "/order/checkout",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["Cart", "Order"],
        }),
        getMyOrders: builder.query({
            query: () => ({
                url: "/order/my-orders",
                method: "GET",
            }),
            providesTags: ["Order"],
        }),
        getAllOrders: builder.query({
            query: (params) => ({
                url: "/order/all-orders",
                method: "GET",
                params,
            }),
            providesTags: ["Order"],
        }),
        getBaristaAssignedOrders: builder.query({
            query: (params) => ({
                url: "/order/barista/assigned-orders",
                method: "GET",
                params,
            }),
            providesTags: ["Order"],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ orderId, status }) => ({
                url: `/order/status/${orderId}`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Order"],
        }),
        addOrderTip: builder.mutation({
            query: ({ orderId, amount, message, payType }) => ({
                url: `/order/tip/${orderId}`,
                method: "POST",
                body: { amount, message, payType },
            }),
            invalidatesTags: ["Order"],
        }),
        getDailyTipsSummary: builder.query({
            query: (params) => ({
                url: "/order/tips/daily-summary",
                method: "GET",
                params,
            }),
            providesTags: ["Order"],
        }),
    }),
});

export const {
    useCheckoutMutation,
    useGetMyOrdersQuery,
    useGetAllOrdersQuery,
    useGetBaristaAssignedOrdersQuery,
    useUpdateOrderStatusMutation,
    useAddOrderTipMutation,
    useGetDailyTipsSummaryQuery,
} = orderApi;
