import { User } from "@/types/enums/user.enum";
import { createSlice } from "@reduxjs/toolkit";
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
      state.user=null;
    },
    updateUserDetails(state,action:PayloadAction<User>){
      state.user=action.payload;
    }
  },
});

export const { login, logout,updateUserDetails } = authSlice.actions;

export default authSlice.reducer;
