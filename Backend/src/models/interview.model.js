import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String },
  tips: { type: Object },
  feedback: { type: String },
  
  // FIXED: Expanded Enum to include "Poor" and "Average" to prevent crashes
  feedbackRating: {
    type: String,
    enum: ["Excellent", "Good", "Average", "Needs Improvement", "Poor"], 
    default: "Needs Improvement"
  },
  
  feedbackSummary: { type: String },
  
  // Analysis Fields
  emotionalData: {
    averageConfidence: { type: Number, default: 0 },
    dominantExpression: { type: String, default: "Neutral" },
  },
  swotAnalysis: {
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    opportunities: [{ type: String }],
    threats: [{ type: String }],
  },
});

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    interviewNumber: { type: Number },
    interviewType: { type: String, required: true },
    jobRole: { type: String, required: true },
    difficultyLevel: { type: String, required: true },
    
    questions: [interviewQuestionSchema],

    performanceScore: { type: Number, min: 0, max: 100 },
    performanceSummary: { type: String },
    averageInterviewConfidence: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Interview = mongoose.model("Interview", interviewSchema);