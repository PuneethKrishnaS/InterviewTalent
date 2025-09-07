import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { fetchUserFromGithub } from "../controllers/github.controller.js";

const router = Router();

router.route("/user").get(verifyJWT, fetchUserFromGithub);

export default router;
