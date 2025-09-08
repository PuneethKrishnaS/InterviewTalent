import { create } from "zustand";
import api from "../../utils/axios";

export const voiceInterviewStore = create((set) => ({
  details: {
    InterviewType: "Not selected",
    JobRole: "Not selected",
    DifficultyLevel: "Not selected",
    duration: "--:--",
    isStrictMock: false,
    isResumeAnalysis: false,
  },
  loading: false,
  questions: null,
  error: false,
  interviewData: {},

  setDetails: (details) => {
    set((state) => ({
      details: { ...state.details, ...details }
    }));
  },

  getQuestions: async (details) => {
    try {
      set({ loading: true });
      const res = await api.post("/api/v1/interview/getquestions", details);
      const parsedQuestions = res.data?.data || [];

      set((state) => ({
        questions: parsedQuestions
          .map((question) => `${question.number}: ${question.question}`)
          .join(", "),
        details: { ...state.details, ...details }, // merge here too
        loading: false,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false });
    }
  },
}));
