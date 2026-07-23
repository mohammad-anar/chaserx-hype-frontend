import { baseApi } from "../../api/baseApi";

export const cartApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        addToCart: builder.mutation({
            query: (data) => ({
                url: "/cart/add-item",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Cart"],
        }),
        getCart: builder.query({
            query: () => ({
                url: "/cart",
                method: "GET",
            }),
            providesTags: ["Cart"],
        }),
        updateCartItem: builder.mutation({
            query: ({ cartItemId, ...data }) => ({
                url: `/cart/update-item/${cartItemId}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Cart"],
        }),
        removeCartItem: builder.mutation({
            query: (cartItemId) => ({
                url: `/cart/remove-item/${cartItemId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Cart"],
        }),
    }),
});

export const {
    useAddToCartMutation,
    useGetCartQuery,
    useUpdateCartItemMutation,
    useRemoveCartItemMutation,
} = cartApi;
