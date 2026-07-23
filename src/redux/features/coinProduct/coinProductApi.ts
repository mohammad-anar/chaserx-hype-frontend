import { baseApi } from "../../api/baseApi";

export const coinProductApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCoinProducts: builder.query({
            query: (params) => ({
                url: "/coin-product",
                method: "GET",
                params,
            }),
            providesTags: ["CoinProduct"],
        }),
        getCoinProductById: builder.query({
            query: (id) => ({
                url: `/coin-product/${id}`,
                method: "GET",
            }),
            providesTags: ["CoinProduct"],
        }),
    }),
});

export const {
    useGetCoinProductsQuery,
    useGetCoinProductByIdQuery,
} = coinProductApi;
