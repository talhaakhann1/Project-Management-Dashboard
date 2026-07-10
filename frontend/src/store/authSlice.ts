import React from "react";
import { createSlice } from "@reduxjs/toolkit";
import { User } from "@/Schemas/user.schema";
import { PayloadAction } from "@reduxjs/toolkit";

type AuthSlice = {
  isLoggedIn: boolean;
  user: User | null;
};

const initialState: AuthSlice = {
  isLoggedIn: false,
  user: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    logout(state) {
      state.isLoggedIn = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
