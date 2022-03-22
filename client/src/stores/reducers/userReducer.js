import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    isFetchingLogin: false,
    loginSuccess: false,
    loginError: false,
    isFetchingRegister: false,
    registerSuccess: false,
    registerError: false,
  },
  reducers: {
    registerReset: (state) => {
      state.isFetchingRegister = false;
      state.registerSuccess = false;
      state.registerError = false;
    },
    registerStart: (state) => {
      state.isFetchingRegister = true;
      state.registerSuccess = false;
      state.registerError = false;
    },
    registerSuccess: (state) => {
      state.isFetchingRegister = false;
      state.registerSuccess = true;
      state.registerError = false;
      console.log("[debug] register successful");
    },
    registerFailure: (state) => {
      state.isFetchingRegister = false;
      state.registerSuccess = false;
      state.registerError = true;
      console.log("[debug] register failed");
    },
    loginStart: (state) => {
      state.isFetchingLogin = true;
      state.loginSuccess = false;
      state.loginError = false;
      state.currentUser = null;
    },
    loginSuccess: (state, action) => {
      state.isFetchingLogin = false;
      state.loginSuccess = true;
      state.loginError = false;
      state.currentUser = action.payload;
      console.log("[debug] login successful");
    },
    loginFailure: (state) => {
      state.isFetchingLogin = false;
      state.loginSuccess = false;
      state.loginError = true;
      state.currentUser = null;
      console.log("[debug] login failed");
    },
    logoutSuccess: (state) => {
      state.currentUser = null;
      state.isFetchingLogin = false;
      state.loginSuccess = false;
      state.loginError = false;
      state.isFetchingRegister = false;
      state.registerSuccess = false;
      state.registerError = false;
      console.log("[debug] logout successful");
    },
  },
});

export const {
  registerReset,
  registerStart,
  registerSuccess,
  registerFailure,
  loginStart,
  loginSuccess,
  loginFailure,
  logoutSuccess,
} = userSlice.actions;
export default userSlice.reducer;
