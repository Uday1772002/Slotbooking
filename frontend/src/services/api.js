import axios from "axios";
import { auth } from "../config/firebase";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5002/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await auth.signOut();
    }
    return Promise.reject(error);
  }
);

export default api;
