import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String },
  tips: { type: Object },
  feedback: { type: String },
  feedbackRating: {
    type: String,
    enum: ["Good", "Excellent", "Needs Improvement"],
  },
  feedbackSummary: { type: String },
});

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    interviewNumber: { type: Number },

    interviewType: {
      type: String,
      enum: ["Technical Interview", "Behavioral Interview", "HR Interview"],
      required: true,
    },

    jobRole: {
      type: String,
      enum: [
        "Software Engineer",
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "DevOps Engineer",
        "QA Engineer",
        "Data Engineer",
        "Data Scientist",
        "Machine Learning Engineer",
        "Mobile Developer",
        "Cloud Engineer",
        "Security Engineer",
        "Site Reliability Engineer",
        "Database Administrator",
        "Systems Engineer",
      ],
      required: true,
    },

    difficultyLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },

    questions: [interviewQuestionSchema],

    performanceScore: { type: Number, min: 0, max: 100 },
    performanceSummary: { type: String },
  },
  { timestamps: true }
);

export const Interview = mongoose.model("Interview", interviewSchema);
