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
        updateOrderStatus: builder.mutation({
            query: ({ orderId, status }) => ({
                url: `/order/status/${orderId}`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Order"],
        }),
    }),
});

export const {
    useCheckoutMutation,
    useGetMyOrdersQuery,
    useGetAllOrdersQuery,
    useUpdateOrderStatusMutation,
} = orderApi;
