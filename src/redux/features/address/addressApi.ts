import { baseApi } from "../../api/baseApi";

export const addressApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMyAddresses: builder.query({
            query: () => ({
                url: "/address/my-addresses",
                method: "GET",
            }),
            providesTags: ["Address"],
        }),
        createAddress: builder.mutation({
            query: (data) => ({
                url: "/address",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Address"],
        }),
        updateAddress: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/address/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Address"],
        }),
        deleteAddress: builder.mutation({
            query: (id) => ({
                url: `/address/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Address"],
        }),
    }),
});

export const {
    useGetMyAddressesQuery,
    useCreateAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
} = addressApi;
