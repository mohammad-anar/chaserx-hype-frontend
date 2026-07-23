import { baseApi } from "../../api/baseApi";

export const productApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: (params) => ({
                url: "/product",
                method: "GET",
                params,
            }),
            providesTags: ["Product"],
        }),
        getProductById: builder.query({
            query: (id) => ({
                url: `/product/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Product", id }],
        }),
    }),
});

export const { useGetProductsQuery, useGetProductByIdQuery } = productApi;
