import { baseApi } from "../../api/baseApi";
import { TAG_TYPES } from "@/constants/api";

export const coinProductApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCoinProducts: builder.query({
            query: (params) => ({
                url: "/coin-product",
                method: "GET",
                params,
            }),
            providesTags: [TAG_TYPES.COIN_PRODUCT],
        }),

        getCoinProductById: builder.query({
            query: (id) => ({
                url: `/coin-product/${id}`,
                method: "GET",
            }),
            providesTags: [TAG_TYPES.COIN_PRODUCT],
        }),

        createCoinProduct: builder.mutation({
            query: (data) => ({
                url: "/coin-product",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [TAG_TYPES.COIN_PRODUCT],
        }),

        updateCoinProduct: builder.mutation({
            query: ({ id, data }) => ({
                url: `/coin-product/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [TAG_TYPES.COIN_PRODUCT],
        }),

        deleteCoinProduct: builder.mutation({
            query: (id) => ({
                url: `/coin-product/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [TAG_TYPES.COIN_PRODUCT],
        }),
    }),
});

export const {
    useGetCoinProductsQuery,
    useGetCoinProductByIdQuery,
    useCreateCoinProductMutation,
    useUpdateCoinProductMutation,
    useDeleteCoinProductMutation,
} = coinProductApi;
