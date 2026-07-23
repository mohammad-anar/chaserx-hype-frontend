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
    }),
});

export const { useCheckoutMutation, useGetMyOrdersQuery } = orderApi;
