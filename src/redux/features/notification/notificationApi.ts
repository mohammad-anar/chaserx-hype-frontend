import { baseApi } from "../../api/baseApi";
import { TAG_TYPES } from "@/constants/api";

export const notificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMyNotifications: builder.query({
            query: () => ({
                url: "/notification/my-notifications",
                method: "GET",
            }),
            providesTags: [TAG_TYPES.NOTIFICATIONS],
        }),
        markAsRead: builder.mutation({
            query: (id: string) => ({
                url: `/notification/read/${id}`,
                method: "PATCH",
            }),
            invalidatesTags: [TAG_TYPES.NOTIFICATIONS],
        }),
        markAllAsRead: builder.mutation({
            query: () => ({
                url: "/notification/read-all",
                method: "PATCH",
            }),
            invalidatesTags: [TAG_TYPES.NOTIFICATIONS],
        }),
    }),
});

export const {
    useGetMyNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} = notificationApi;
