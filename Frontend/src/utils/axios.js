import axios from "axios";

const URL =
  import.meta.env.REACT_ENV === "production"
    ? import.meta.env.BACKEND_URL
    : "http://localhost:8000/";

const api = axios.create({
  baseURL: "http://localhost:8000/",
  withCredentials: true,
});

export default api;
