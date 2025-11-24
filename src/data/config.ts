import axios from "axios";

const customAxios = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_API_BASE_URL,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
  },
});

export const aqicnAxios = axios.create({
  baseURL: import.meta.env.VITE_AQICN_API_BASE_URL,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
  },
});

export default customAxios;
