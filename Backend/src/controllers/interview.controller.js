import { Interview } from "../models/interview.model.js";
import { Resume } from "../models/resume.model.js";
import { User } from "../models/user.model.js";
import { appError } from "../utils/appError.js";
import { appResponse } from "../utils/appResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { groqHamdlerAI } from "../utils/groqAI.js";

const interviewGetQuestions = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      throw new appError(500, "Unauthorized user");
    }

    const { InterviewType, JobRole, DifficultyLevel, isResumeAnalysis } =
      req.body;

    if (isResumeAnalysis) {
      var resume = await Resume.findOne({ user: req.user._id });
      if (!resume) {
        throw new appError(500, "Please update the resume");
      }
      var fetchedResume = {
        personal: {
          name: resume.personalInformation?.name || "",
          email: resume.personalInformation?.email || "",
          phone: resume.personalInformation?.phone || "",
          linkedin: resume.personalInformation?.linkedin || "",
          github: resume.personalInformation?.github || "",
        },
        summary: resume.summary || "",
        experience: (resume.experiences || []).map((exp) => ({
          id: exp._id,
          title: exp.title || "",
          company: exp.company || "",
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          description: exp.description || "",
        })),
        education: (resume.educations || []).map((edu) => ({
          id: edu._id,
          degree: edu.degree || "",
          institution: edu.institution || "",
          location: edu.location || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
          marks: edu.marks || "",
        })),
        projects: (resume.projects || []).map((p) => ({
          id: p._id,
          name: p.project.projectName || "",
          startDate: p.project.startDate || "",
          endDate: p.project.endDate || "",
          technologies: (p.project.technologies || []).join(", "),
          description: p.project.description || "",
          liveLink: p.project.liveLink || "",
          githubLink: p.project.githubLink || "",
        })),
        achievements: (resume.achivements || []).map((a) => ({
          id: a._id,
          description: a.description || "",
          documentLink: a.documentLink || "",
        })),
        skills: {
          technical: resume.skills?.technical || [],
          soft: resume.skills?.soft || [],
        },
        languages: resume.languages || [],
      };
    }

    const selectedPrompt = isResumeAnalysis
      ? `You are an AI interview assistant. Generate 2 ${InterviewType} interview questions based ONLY on the candidate’s resume data below with  Difficulty: ${DifficultyLevel}. Focus on their tech stack, projects, experience, and achievements.

Resume JSON:
${JSON.stringify(fetchedResume, null, 2)}


Each object must have this structure:
[
  {
    "number": 1,
    "question": "string",
    "timer": number (in seconds, e.g., 180),
    "tips": {
      "Keyword1": "string explanation",
      "Keyword2": "string explanation",
      "Keyword3": "string explanation"
    }
  }
]

Rules:
- "number" should be sequential starting from 1 to 10.
- "question" must be role-specific, relevant to the candidate’s skills, projects, or leadership experience.
- "timer" should be between 120 and 300 seconds depending on complexity.
- "tips" must contain 2–4 entries. Each key should be a short bold-style keyword (e.g., React, Problem-Solving, MongoDB, Leadership) and the value should be a one-sentence explanation.
- Do not include Markdown, extra text, or explanations outside of the JSON.
`
      : `You are an AI interview assistant. Generate 2 interview questions for a ${JobRole} in a ${InterviewType} interview. Difficulty: ${DifficultyLevel}.
  Return the result strictly in JSON format as an array. 
  Each object must have this structure:
  
  [
    {
      "number": 1,
      "question": "string",
      "timer": number (in seconds, e.g., 180),
      "tips": {
        "Keyword1": "string explanation",
        "Keyword2": "string explanation",
        "Keyword3": "string explanation"
      }
    }
  ]
  
  Rules:
  - "number" should be sequential starting from 1 to 10.
  - "question" must be clear, role-specific, and match the difficulty.
  - "timer" should be between 120 and 300 seconds depending on question complexity.
  - "tips" must contain 2–4 entries. Each key should be a short bold-style keyword (e.g., HTML, Problem-Solving, Algorithms) and the value should be a one-sentence explanation.
  - Do not include Markdown formatting, extra text, or explanations outside of the JSON.
`;

    const groqQuestions = await groqHamdlerAI({
      messages: [
        {
          role: "user",
          content: selectedPrompt,
        },
      ],
    });

    res.status(201).json(new appResponse(201, groqQuestions, "AI data stored"));
    
  } catch (error) {
    throw new appError(401, error.message);
  }
});

const interviewGetFeedback = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      throw new appError(401, "Unauthorized user");
    }

    const { interviewData, questions, details } = req.body;

    const groqFeedback = await groqHamdlerAI({
      messages: [
        {
          role: "user",
          content: `Generate 1 interview questions for a ${details.JobRole} in a ${details.InterviewType} interview. Difficulty: ${details.DifficultyLevel}.
  Return the result strictly in JSON format as an array. 
  Each object must have this structure:
  
  [
    {
      "number": 1,
      "question": "string",
      "timer": number (in seconds, e.g., 180),
      "tips": {
        "Keyword1": "string explanation",
        "Keyword2": "string explanation",
        "Keyword3": "string explanation"
      }
    }
  ]
  
  Rules:
  - "number" should be sequential starting from 1 to 10.
  - "question" must be clear, role-specific, and match the difficulty.
  - "timer" should be between 120 and 300 seconds depending on question complexity.
  - "tips" must contain 2–4 entries. Each key should be a short bold-style keyword (e.g., HTML, Problem-Solving, Algorithms) and the value should be a one-sentence explanation.
  - Do not include Markdown formatting, extra text, or explanations outside of the JSON.
  `,
        },
        {
          role: "assistant",
          content: `${questions}`,
        },
        {
          role: "user",
          content: `
  You are an expert technical interviewer. Evaluate the following interview.
  
  ### Candidate Details:
  - Interview Type: ${details.InterviewType}
  - Job Role: ${details.JobRole}
  - Difficulty Level: ${details.DifficultyLevel}
  
  ### Data:
  ${JSON.stringify(interviewData, null, 2)}
  
  ---
  
  ### Instructions:
  For each question in the data:
  1. Use the "userAnswer" field as the candidate’s answer.
  2. Compare with the "tips" to check correctness and completeness.
  3. Provide:
     - "feedback": specific, constructive evaluation.
     - "feedbackRating": one of ["Excellent", "Good", "Needs Improvement"].
     - "feedbackSummary": one concise sentence.
  
  After all questions, also provide:
  - "performanceScore": an integer 0–100 reflecting overall performance.
  - "performanceSummary": a short paragraph summarizing strengths and weaknesses.
  
  ### Output Format:
  Return a single JSON object strictly in this structure (no extra text):
  
  {
    "interviewType": "${details.InterviewType}",
    "jobRole": "${details.JobRole}",
    "difficultyLevel": "${details.DifficultyLevel}",
    "questions": [
      {
        "number": 1,
        "question": "string",
        "answer": "string",
        "tips": {
          "Keyword1": "string",
          "Keyword2": "string",
          "Keyword3": "string"
        },
        "feedback": "string",
        "feedbackRating": "Excellent | Good | Needs Improvement",
        "feedbackSummary": "string"
      }
    ],
    "performanceScore": <number>,
    "performanceSummary": "string"
  }
  `,
        },
      ],
    });

    await storeInterviewData(groqFeedback, req.user);

    res.status(201).json(new appResponse(201, groqFeedback, "AI data stored"));
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
      questions: feedbackData.questions.map((q) => ({
        question: q.question,
        answer: q.answer,
        tips: q.tips,
        feedback: q.feedback,
        feedbackRating: q.feedbackRating,
        feedbackSummary: q.feedbackSummary,
      })),
      performanceScore: feedbackData.performanceScore,
      performanceSummary: feedbackData.performanceSummary,
    });

    // Update user interview counter
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $inc: { "performanceMetrics.interviewsCompleted": 1 } },
      { new: true }
    );

    if (!interview) {
      throw new appError(500, "Interview data not stored");
    }

    if (!updatedUser) {
      throw new appError(500, "Failed to update user interview count");
    }

    return interview;
  } catch (error) {
    throw new appError(error.statusCode || 500, error.message);
  }
};

export { interviewGetQuestions, interviewGetFeedback };
