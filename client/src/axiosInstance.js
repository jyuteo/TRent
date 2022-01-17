import axios from "axios";

const PORT = process.env.REACT_APP_API_PORT || 5000;
const axiosInstance = axios.create({
  baseURL: `http://localhost:${PORT}`,
  withCredentials: true,
});

export default axiosInstance;
