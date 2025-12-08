import { Interview } from "../models/interview.model.js";
import { Resume } from "../models/resume.model.js";
import { User } from "../models/user.model.js";
import { appError } from "../utils/appError.js";
import { appResponse } from "../utils/appResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { groqHamdlerAI } from "../utils/groqAI.js";

// --- 1. Safe JSON Parser ---
const safeJsonParse = (input) => {
  if (!input) return {};
  if (typeof input === 'object') return input;
  const text = String(input);
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try stripping markdown blocks
    const jsonMatch = text.match(/```json([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      try { return JSON.parse(jsonMatch[1]); } catch (e2) {}
    }
    // Try finding boundary braces
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
        try { return JSON.parse(text.substring(startIndex, endIndex + 1)); } catch(e3) {}
    }
    console.error("Failed to parse AI response:", text);
    return {}; 
  }
};

// --- 2. Sanitize Ratings (Prevents DB Crashes) ---
const sanitizeRating = (rating) => {
  const validRatings = ["Excellent", "Good", "Average", "Needs Improvement", "Poor"];
  const cleanRating = (rating || "").trim();
  
  if (validRatings.includes(cleanRating)) return cleanRating;
  
  // Map invalid AI outputs to valid Enums
  const lower = cleanRating.toLowerCase();
  if (lower.includes("bad") || lower.includes("terrible")) return "Poor";
  if (lower.includes("fair") || lower.includes("okay")) return "Average";
  if (lower.includes("great") || lower.includes("perfect")) return "Excellent";
  
  return "Needs Improvement"; // Default fallback
};

// --- Controller: Get Questions ---
const interviewGetQuestions = asyncHandler(async (req, res) => {
  try {
    if (!req.user) throw new appError(401, "Unauthorized user");

    const { InterviewType, JobRole, DifficultyLevel, isResumeAnalysis } = req.body;

    const previousInterviews = await Interview.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("questions.question");

    const pastQuestions = previousInterviews
      .flatMap((i) => i.questions.map((q) => q.question))
      .filter((q) => q && q.length > 10);

    const exclusionContext = pastQuestions.length > 0 
      ? `NOTE: Do NOT repeat these questions: ${JSON.stringify(pastQuestions.slice(0, 15))}.` 
      : "";

    let fetchedResume = {};
    if (isResumeAnalysis) {
      const resume = await Resume.findOne({ user: req.user._id });
      if (!resume) throw new appError(500, "Please update the resume");
      fetchedResume = {
        skills: resume.skills?.technical || [],
        experience: (resume.experiences || []).map(e => `${e.title} at ${e.company}`),
      };
    }

    const promptContext = isResumeAnalysis
      ? `Resume Context: ${JSON.stringify(fetchedResume, null, 2)}`
      : `Role: ${JobRole}`;

    const finalPrompt = `
      You are an AI Technical Interviewer. 
      Generate 2 ${InterviewType} interview questions. Difficulty: ${DifficultyLevel}.
      ${promptContext}
      ${exclusionContext}

      RETURN FORMAT: Strict JSON Array.
      [
        {
          "number": 1,
          "question": "string",
          "timer": 180,
          "tips": { "Hint": "text" }
        }
      ]
    `;

    const groqResponse = await groqHamdlerAI({
      messages: [{ role: "user", content: finalPrompt }],
    });

    const parsedQuestions = safeJsonParse(groqResponse);
    res.status(201).json(new appResponse(201, parsedQuestions, "AI data stored"));
    
  } catch (error) {
    throw new appError(401, error.message);
  }
});

// --- Controller: Get Feedback ---
const interviewGetFeedback = asyncHandler(async (req, res) => {
  try {
    if (!req.user) throw new appError(401, "Unauthorized user");

    const { interviewData, questions, details } = req.body;

    const feedbackPrompt = `
      Evaluate candidate.
      Role: ${details.JobRole}
      Data: ${JSON.stringify(interviewData, null, 2)}
      
      Instructions:
      1. Analyze correctness.
      2. Analyze confidence (from emotionalData).
      3. Create SWOT.
      4. Rating MUST be one of: ["Excellent", "Good", "Average", "Needs Improvement", "Poor"].

      Output JSON:
      {
        "interviewType": "${details.InterviewType}",
        "jobRole": "${details.JobRole}",
        "difficultyLevel": "${details.DifficultyLevel}",
        "averageInterviewConfidence": 0,
        "questions": [
          {
            "number": 1,
            "question": "text",
            "answer": "text",
            "tips": {},
            "feedback": "text",
            "feedbackRating": "Good",
            "feedbackSummary": "text",
            "swotAnalysis": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] },
            "emotionalData": { "averageConfidence": 0, "dominantExpression": "neutral" }
          }
        ],
        "performanceScore": 0,
        "performanceSummary": "text"
      }
    `;

    const groqResponse = await groqHamdlerAI({
      messages: [{ role: "user", content: feedbackPrompt }],
    });

    const feedbackData = safeJsonParse(groqResponse);
    
    // --- SANITIZE DATA HERE ---
    if (feedbackData.questions) {
        feedbackData.questions = feedbackData.questions.map(q => ({
            ...q,
            // Force the rating to be valid before saving
            feedbackRating: sanitizeRating(q.feedbackRating) 
        }));
    }

    await storeInterviewData(feedbackData, req.user);

    res.status(201).json(new appResponse(201, feedbackData, "AI analysis complete"));
  } catch (error) {
    throw new appError(error.statusCode || 500, error.message);
  }
});

const storeInterviewData = async (feedbackData, user) => {
  try {
    const interviewCount = await Interview.countDocuments({ user: user._id });

    const interview = await Interview.create({
      user: user._id,
      interviewNumber: interviewCount + 1,
      interviewType: feedbackData.interviewType,
      jobRole: feedbackData.jobRole,
      difficultyLevel: feedbackData.difficultyLevel,
      averageInterviewConfidence: feedbackData.averageInterviewConfidence || 0,
      questions: feedbackData.questions,
      performanceScore: feedbackData.performanceScore,
      performanceSummary: feedbackData.performanceSummary,
    });

    await User.findByIdAndUpdate(
      user._id,
      { $inc: { "performanceMetrics.interviewsCompleted": 1 } },
      { new: true }
    );

    return interview;
  } catch (error) {
    console.error("DB Save Error:", error);
    throw new appError(500, `Database Save Failed: ${error.message}`);
  }
};

export { interviewGetQuestions, interviewGetFeedback };