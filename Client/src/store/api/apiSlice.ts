import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Get base URL from environment or default to local server
const baseUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      // Credentials are sent via cookies (httpOnly), but if a token is stored locally, we can append it here.
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include", // Required to send/receive cookies
  }),
  tagTypes: ["User", "Task", "Notification", "Log", "Dashboard"],
  endpoints: () => ({}), // Endpoints are injected from split slice files
});
