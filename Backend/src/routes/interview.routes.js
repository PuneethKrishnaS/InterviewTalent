import { Router } from "express";
import {
  interviewGetQuestions,
  interviewGetFeedback,
} from "../controllers/interview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/getquestions").post(verifyJWT, interviewGetQuestions);
router.route("/getfeedback").post(verifyJWT, interviewGetFeedback);

export default router;
