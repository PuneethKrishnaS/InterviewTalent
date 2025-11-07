import { Router } from "express";
// Import the new controller function
import { getAptitudeQuestions, getAptitudeSummary, getTopicsByCategory, submitAptitudeResults } from "../controllers/aptitude.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/questions/:category/:topic").get(verifyJWT, getAptitudeQuestions)
router.route("/summary").get(verifyJWT, getAptitudeSummary)
router.route("/topics/:category").get(verifyJWT, getTopicsByCategory)

// --- NEW ROUTE FOR SUBMISSION ---
// Use POST request to submit the results payload
router.route("/submit-results").post(verifyJWT, submitAptitudeResults);

export default router;
 