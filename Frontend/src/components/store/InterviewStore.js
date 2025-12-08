import { create } from "zustand";
import api from "../../utils/axios";

export const interviewStore = create((set, get) => ({
  details: null,
  loading: false,
  questions: [],
  error: false,
  transcriptsAnswers: [], // stores { questionNumber, answer, emotionalData }
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

  // UPDATED: Now accepts emotionalData
  addTranscript: (questionNumber, answer, emotionalData) => {
    const { transcriptsAnswers } = get();
    // Remove existing answer for this question if it exists (to prevent duplicates)
    const filtered = transcriptsAnswers.filter(t => t.questionNumber !== questionNumber);
    
    const newEntry = { 
        questionNumber, 
        answer, 
        emotionalData: emotionalData || { averageConfidence: 0, dominantExpression: "neutral" } 
    };
    
    set({ transcriptsAnswers: [...filtered, newEntry] });
  },

  getFeedback: async (questions, answers, details) => {
    set({ loading: true });

    // Merge Questions with User Answers AND Emotional Data
    const allInterviewData = questions.map((q) => {
      const match = answers.find((a) => a.questionNumber === q.number);
      return {
        ...q,
        userAnswer: match ? match.answer : "",
        emotionalData: match ? match.emotionalData : { averageConfidence: 0, dominantExpression: "neutral" }
      };
    });

    const interviewData = {
      interviewType: details.interviewType,
      jobRole: details.jobRole,
      difficultyLevel: details.difficultyLevel,
      allInterviewData,
    };

    const res = await api.post("/api/v1/interview/getfeedback", {
      interviewData, // This now contains the merged data
      questions,
      details,
    });

    set({ interviewFeedback: res.data?.data, loading: false });
  },
}));