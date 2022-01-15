import axios from "../axiosInstance.js";
import {
  loginFailure,
  loginStart,
  loginSuccess,
  logoutSuccess,
  registerFailure,
  registerStart,
  registerSuccess,
} from "../stores/reducers/userReducer.js";

export const register = async (dispatch, reqBody) => {
  dispatch(registerStart());
  try {
    await axios.post("/api/auth/register", reqBody);
    dispatch(registerSuccess());
  } catch (err) {
    dispatch(registerFailure());
  }
};

export const login = async (dispatch, reqBody) => {
  dispatch(loginStart());
  try {
    const res = await axios.post("/api/auth/login", reqBody);
    dispatch(loginSuccess(res.data.user));
  } catch (err) {
    dispatch(loginFailure());
  }
};

export const logout = async (dispatch) => {
  try {
    await axios.delete("/api/auth/logout");
    dispatch(logoutSuccess());
  } catch (err) {
    console.log(err);
  }
};
