import { create } from "zustand";
import api from "../../utils/axios";

export const githubStore = create((set, get) => ({
  githubData: null,
  loading: false,
  error: null,

  fetchGithubData: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/v1/github/user");
      if (res.data?.success) {
        set({ githubData: res.data.data, loading: false });
      } else {
        set({
          error: res.data?.message || "Failed to fetch GitHub data.",
          loading: false,
        });
      }
    } catch (err) {
      console.error(err);
      set({
        error: err.response?.data?.message || "An unexpected error occurred.",
        loading: false,
      });
    }
  },

  setGithubData: (data) => {
    set({ githubData: data });
  },

  clearGithubData: () => {
    set({ githubData: null, error: null, loading: false });
  },
}));