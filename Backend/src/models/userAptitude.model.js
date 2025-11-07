import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "arithmetic",
      "logical-reasoning",
      "verbal-reasoning",
      "nonverbal-reasoning",
    ],
    required: true,
  },
  totalQuestions: { type: Number, required: true },
  completedQuestions: [
    {
      questionID: { type: mongoose.Schema.Types.ObjectId, ref: "Aptitude" },
      isCorrect: { type: Boolean },
    },
  ],
});

const userAptitudeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topics: [topicSchema],
  categoriesSummary: {
    quantitative: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    logical: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    verbal: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    nonverbal: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
  },
});

export const UserAptitude = mongoose.model("UserAptitude", userAptitudeSchema);
