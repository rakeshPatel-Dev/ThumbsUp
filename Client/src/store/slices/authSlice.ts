import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  role: "employee" | "manager" | "admin";
  avatar?: string;
  isEmailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token?: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      if (token) {
        state.token = token;
        localStorage.setItem("token", token);
      }
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
