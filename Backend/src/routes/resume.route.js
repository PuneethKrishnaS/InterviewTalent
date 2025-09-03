import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { saveResume, fetchResume, getAIResumeATS } from "../controllers/resume.controller.js";

const router = Router();

router.route("/save").post(verifyJWT, saveResume);
router.route("/fetch").post(verifyJWT, fetchResume);
router.route("/ai").post(verifyJWT, getAIResumeATS);

export default router;
