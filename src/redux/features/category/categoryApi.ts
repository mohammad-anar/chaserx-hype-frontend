import { baseApi } from "../../api/baseApi";

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: () => ({
                url: "/category",
                method: "GET",
            }),
            providesTags: ["Category"],
        }),
    }),
});

export const { useGetCategoriesQuery } = categoryApi;
