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
        getAdminCategories: builder.query({
            query: () => ({
                url: "/category/admin",
                method: "GET",
            }),
            providesTags: ["Category"],
        }),
        createCategory: builder.mutation({
            query: (data) => ({
                url: "/category",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Category"],
        }),
        updateCategory: builder.mutation({
            query: ({ id, data }) => ({
                url: `/category/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Category"],
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Category"],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetAdminCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;

