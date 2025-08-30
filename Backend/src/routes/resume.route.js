import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { saveResume, fetchResume } from "../controllers/resume.controller.js";

const router = Router();

router.route("/save").post(verifyJWT, saveResume);
router.route("/fetch").post(verifyJWT, fetchResume);

export default router;
