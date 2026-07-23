import { baseApi } from "../../api/baseApi";
import { TAG_TYPES } from "@/constants/api";

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllUsers: builder.query({
            query: (params) => ({
                url: "/user",
                method: "GET",
                params,
            }),
            providesTags: [TAG_TYPES.USER],
        }),

        getUserById: builder.query({
            query: (id: string) => ({
                url: `/user/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: TAG_TYPES.USER, id }],
        }),

        updateUserStatus: builder.mutation({
            query: ({ id, status }: { id: string; status: string }) => ({
                url: `/user/${id}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: [TAG_TYPES.USER],
        }),

        deleteUser: builder.mutation({
            query: (id: string) => ({
                url: `/user/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [TAG_TYPES.USER],
        }),
    }),
});

export const {
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useUpdateUserStatusMutation,
    useDeleteUserMutation,
} = userApi;
