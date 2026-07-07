import { apiSlice } from "./apiSlice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard"],
    }),
    getSystemLogs: builder.query({
      query: (params = {}) => ({
        url: "/admin/logs",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.logs.map((_: any, idx: number) => ({ type: "Log" as const, id: idx })),
              { type: "Log", id: "LIST" },
            ]
          : [{ type: "Log", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardStatsQuery,
  useGetSystemLogsQuery,
} = adminApi;
