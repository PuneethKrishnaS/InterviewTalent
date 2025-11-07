import { create } from "zustand";

export const useAptitudeStore = create((set, get) => ({
  category: "",
  topic: "",
  questions: [],
  userAnswers: {}, // { questionId: "selectedOption" }
  startTime: null,

  // initialize test
  setTestData: (category, topic, questions) =>
    set({
      category,
      topic,
      questions,
      userAnswers: {},
      startTime: Date.now(),
    }),

  // store answer for a question
  setAnswer: (questionId, answer) => {
    const currentAnswers = get().userAnswers;
    set({
      userAnswers: { ...currentAnswers, [questionId]: answer },
    });
  },

  // get time taken in seconds
  getTimeTaken: () => {
    const { startTime } = get();
    return startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  },

  // reset everything
  resetTest: () =>
    set({
      category: "",
      topic: "",
      questions: [],
      userAnswers: {},
      startTime: null,
    }),
}));
