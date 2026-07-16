import { apiSlice } from "./apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => "/users/profile",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: "/users/profile",
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: ["User"],
    }),
    getUsers: builder.query({
      query: (params = {}) => ({
        url: "/users",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.users.map(({ id }: { id: string }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/users/${userId}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        "Dashboard",
      ],
    }),
    suspendUser: builder.mutation({
      query: ({ userId, action }) => ({
        url: `/users/${userId}/suspend`,
        method: "PUT",
        body: { action },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        "Dashboard",
      ],
    }),
    deleteAccount: builder.mutation({
      query: () => ({
        url: "/users/account",
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useSuspendUserMutation,
  useDeleteAccountMutation,
} = userApi;
