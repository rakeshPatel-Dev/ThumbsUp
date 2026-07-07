import { apiSlice } from "./apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      // registration doesn't affect active session caching immediately, but let's provide clean tags if any
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Task", "Notification", "Dashboard"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User", "Task", "Notification", "Dashboard"],
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: "/auth/refresh-token",
        method: "POST",
      }),
    }),
    forgotPassword: builder.mutation({
      query: (emailData) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: emailData,
      }),
    }),
    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: resetData,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (tokenData) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: tokenData,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation({
      query: (passwords) => ({
        url: "/auth/change-password",
        method: "POST",
        body: passwords,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useChangePasswordMutation,
} = authApi;
