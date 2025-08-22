import axios from "axios";

const api = axios.create({
  baseURL: "https://interviewtalentbackend-a83tlrh6i.vercel.app/",
  withCredentials: true,
});

export default api;
