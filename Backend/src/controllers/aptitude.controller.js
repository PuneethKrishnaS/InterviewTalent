import { Aptitude } from "../models/aptitude.model.js";
import { UserAptitude } from "../models/userAptitude.model.js";
import { appError } from "../utils/appError.js";
import { appResponse } from "../utils/appResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const normalizeCategory = (category) => {
  if (typeof category !== 'string') return category;
  const lowerCategory = category.toLowerCase();

  if (lowerCategory === 'arithmetic') {
    return 'quantitative';
  }
  if (lowerCategory === 'logical-reasoning') {
    return 'logical';
  }
  if (lowerCategory === 'verbal-reasoning') {
    return 'verbal';
  }
  if (lowerCategory === 'nonverbal-reasoning') {
    return 'nonverbal';
  }
  
  return lowerCategory; 
};


const getAptitudeQuestions = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new appError(401, "Unauthorized user");
  }

  // category here is the descriptive one, e.g., 'verbal-reasoning'
  const { category, topic } = req.params; 

  if (!category || !topic) {
    throw new appError(400, "Category and topic are required");
  }

  try {
    // Query Aptitude collection using the descriptive category
    const allQuestions = await Aptitude.find({ category, topic }).lean();

    if (!allQuestions || allQuestions.length === 0) {
      throw new appError(404, `No questions found for ${topic}`);
    }

    const userProgress = await UserAptitude.findOne({ userId: req.user._id }).lean();

    let completedQuestionIds = [];
    if (userProgress && Array.isArray(userProgress.topics)) {
      // Find the topic progress using both topic and descriptive category
      const topicProgress = userProgress.topics.find((t) => t.topic === topic && t.category === category);
      
      // Read completion status from the updated 'completedQuestions' array
      if (topicProgress && Array.isArray(topicProgress.completedQuestions)) {
        completedQuestionIds = topicProgress.completedQuestions.map((r) => r.questionID.toString());
      }
    }

    const questionsWithStatus = allQuestions.map((q) => ({
      _id: q._id,
      question: q.question,
      // FIX: Added robust check for q.images existence and length before accessing index 0
      image: q.images && q.images.length > 0 ? q.images[0] : "", 
      options: q.options,
      answer_text: q.answer_text,
      explanation: q.explanation,
      category: q.category,
      topic: q.topic,
      // Check completion status based on whether the questionId is in the array
      status: completedQuestionIds.includes(q._id.toString())
        ? "completed"
        : "pending",
    }));

    const progressPercent =
      allQuestions.length > 0
        ? (completedQuestionIds.length / allQuestions.length) * 100
        : 0;

    res.status(200).json({
      success: true,
      topic,
      category, 
      progressPercent,
      totalQuestions: allQuestions.length,
      completedCount: completedQuestionIds.length,
      questions: questionsWithStatus,
    });
  } catch (error) {
    throw new appError(500, error.message || "Server error while fetching questions");
  }
});


const submitAptitudeResults = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new appError(401, "Unauthorized user");
  }

  // category is descriptive, e.g., 'verbal-reasoning'
  const { category, topic, detailedResults } = req.body; 
  // summaryKey is concise, e.g., 'verbal'
  const summaryKey = normalizeCategory(category); 

  if (!category || !topic || !Array.isArray(detailedResults)) {
    throw new appError(400, "Category, topic, and detailed results array are required");
  }
  
  // Explicitly check if the category is valid based on the model's enum
  const validTopicCategories = ["arithmetic", "logical-reasoning", "verbal-reasoning", "nonverbal-reasoning"];
  const validSummaryKeys = ["quantitative", "logical", "verbal", "nonverbal"];
  
  if (!validTopicCategories.includes(category) || !validSummaryKeys.includes(summaryKey)) {
      throw new appError(400, `Invalid category value: ${category}. Cannot map to a valid summary key.`);
  }

  // 1. Get or create user progress document (DO NOT use .lean() here, as we need Mongoose subdocument tracking)
  let userProgress = await UserAptitude.findOne({ userId: req.user._id });
  if (!userProgress) {
    userProgress = new UserAptitude({ userId: req.user._id, topics: [] });
  }

  // 2. Find or initialize topic progress using both topic and descriptive category
  // NOTE: This topicProgress is now a tracked Mongoose subdocument reference.
  let topicProgress = userProgress.topics.find((t) => t.topic === topic && t.category === category);
  let isNewTopic = false;
  
  if (!topicProgress) {
    const totalCount = await Aptitude.countDocuments({ topic: topic });
    topicProgress = {
      topic: topic,
      category: category, // Use the descriptive category for topic storage
      totalQuestions: totalCount,
      completedQuestions: [], // Initialize the array for results
    };
    userProgress.topics.push(topicProgress);
    isNewTopic = true;
  }
  
  const currentResultIds = new Set(topicProgress.completedQuestions.map(r => r.questionID.toString()));
  let newResultsAdded = 0;
  
  for (const result of detailedResults) {
    if (!result.questionID || typeof result.isCorrect !== 'boolean') {
      console.warn("Skipping invalid result object:", result);
      continue;
    }
    
    const questionId = result.questionID;
    
    if (!currentResultIds.has(questionId)) {
      userProgress.topics.id(topicProgress._id || userProgress.topics.slice(-1)[0]._id).completedQuestions.push({
        questionID: new mongoose.Types.ObjectId(questionId),
        isCorrect: result.isCorrect,
      });
      newResultsAdded++;
    }
  }
  
  const updatedTopicProgress = userProgress.topics.find((t) => t.topic === topic && t.category === category);


  // 4. Recalculate categories summary
  const categorySummary = userProgress.categoriesSummary[summaryKey];
  if (categorySummary) {
    categorySummary.completed = userProgress.topics
      // Filter by the normalized (concise) category key
      .filter((t) => normalizeCategory(t.category) === summaryKey) 
      .reduce((sum, t) => sum + t.completedQuestions.length, 0); 

    // Update total questions for the category (in case new topics were added)
    categorySummary.total = userProgress.topics
      // Filter by the normalized (concise) category key
      .filter((t) => normalizeCategory(t.category) === summaryKey)
      .reduce((sum, t) => sum + t.totalQuestions, 0);
  }

  await userProgress.save();

  res.status(200).json(new appResponse(200, {
    message: "Aptitude results submitted and progress updated successfully.",
    totalAttempted: updatedTopicProgress ? updatedTopicProgress.completedQuestions.length : 0,
    newAttempts: newResultsAdded
  }));
});

const getAptitudeSummary = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new appError(401, "Unauthorized user");
  }

  try {
    const userProgress = await UserAptitude.findOne({ userId: req.user._id });

    if (!userProgress) {
      const emptySummary = {
        quantitative: { completed: 0, total: 0 },
        logical: { completed: 0, total: 0 },
        verbal: { completed: 0, total: 0 },
        nonverbal: { completed: 0, total: 0 },
      };

      return res
        .status(200)
        .json(new appResponse(200, { categoriesSummary: emptySummary }));
    }

    const summary = userProgress.categoriesSummary; 
    const totalCompleted = Object.values(summary).reduce(
      (sum, c) => sum + c.completed,
      0
    );
    const totalQuestions = Object.values(summary).reduce(
      (sum, c) => sum + c.total,
      0
    );

    const overallProgress =
      totalQuestions > 0 ? (totalCompleted / totalQuestions) * 100 : 0;

    res.status(200).json(
      new appResponse(200, {
        success: true,
        overallProgress,
        categoriesSummary: summary,
      })
    );
  } catch (error) {
    throw new appError(500, error.message);
  }
});

const getTopicsByCategory = asyncHandler(async (req, res) => {
  if (!req.user) throw new appError(401, "Unauthorized user");

  const { category } = req.params; // category here is descriptive, e.g., 'verbal-reasoning'

  // Query Aptitude using the descriptive category
  const topics = await Aptitude.find({ category }).select("topic").lean();
  const uniqueTopics = [...new Set(topics.map((t) => t.topic))];

  const userProgress = await UserAptitude.findOne({ userId: req.user._id });

  const topicsWithProgress = await Promise.all(
    uniqueTopics.map(async (topic) => {
      const totalQuestions = await Aptitude.countDocuments({ category, topic: topic });

      let completedQuestionsCount = 0;
      if (userProgress && userProgress.topics) {
        // Find by both topic and descriptive category
        const topicProgress = userProgress.topics.find((t) => t.topic === topic && t.category === category);
        
        // Use the length of the new 'completedQuestions' array
        if (topicProgress) completedQuestionsCount = topicProgress.completedQuestions.length; 
      }

      const progressPercent = totalQuestions ? (completedQuestionsCount / totalQuestions) * 100 : 0;

      return {
        topic: topic,
        totalQuestions,
        completedQuestions: completedQuestionsCount,
        progressPercent,
      };
    })
  );

  res.status(200).json(
    new appResponse(200, { success: true, category, topics: topicsWithProgress })
  );
});


export { getAptitudeQuestions, submitAptitudeResults, getAptitudeSummary, getTopicsByCategory };
