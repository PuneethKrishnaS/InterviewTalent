import { create } from "zustand";
import api from "../../utils/axios";

export const interviewStore = create((set, get) => ({
  details: null,
  loading: false,
  questions: [],
  error: false,
  transcriptsAnswers: [],
  interviewData: {},
  interviewFeedback: {},

  setDetails: (details) => {
    set({ details: details });
  },

  getQuestions: async (details) => {
    try {
      set({ loading: true });
      const res = await api.post("/api/v1/interview/getquestions", details);
      const parsedQuestions = res.data?.data || [];
      set({
        questions: parsedQuestions,
        loading: false,
        details,
      });
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false });
    }
  },

  addTranscript: (questionNumber, answer) => {
    const { transcriptsAnswers } = get();
    const updated = [...transcriptsAnswers];
    updated.push({ questionNumber, answer });
    set({ transcriptsAnswers: updated });
  },

  getFeedback: async (questions, answers, details) => {
    set({ loading: true });

    const allInterviewData = questions.map((q) => {
      const match = answers.find((a) => a.questionNumber === q.number);
      return {
        ...q,
        userAnswer: match ? match.answer : "",
      };
    });

    const interviewData = {
      interviewType: details.interviewType,
      jobRole: details.jobRole,
      difficultyLevel: details.difficultyLevel,
      allInterviewData,
    };

    const res = await api.post("/api/v1/interview/getfeedback", {
      interviewData,
      questions,
      details,
    });

    set({ interviewFeedback: res.data?.data, loading: false });
  },
}));
