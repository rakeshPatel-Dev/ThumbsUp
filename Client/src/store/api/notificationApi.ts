import { apiSlice } from "./apiSlice";

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params = {}) => ({
        url: "/notifications",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.notifications.map(({ id }: { id: string }) => ({
                type: "Notification" as const,
                id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),
    markNotificationRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, notificationId) => [
        { type: "Notification", id: notificationId },
        { type: "Notification", id: "LIST" },
      ],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: "/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, notificationId) => [
        { type: "Notification", id: notificationId },
        { type: "Notification", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
