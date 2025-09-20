import { Router } from "express";
import {
  forgetPasswordReset,
  forgetPasswordSendOTP,
  forgetPasswordVerifyOTP,
  getCurrentUser,
  github,
  githubCallback,
  githubConnect,
  githubConnectCallback,
  loginUser,
  logoutUser,
  refreshAccessAndRefreshToken,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import "../strategies/github.strategy.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/send-otp").post(forgetPasswordSendOTP)
router.route("/verify-otp").post(forgetPasswordVerifyOTP)
router.route("/reset-password").post(forgetPasswordReset)
router.route("/refresh-token").post(refreshAccessAndRefreshToken);
router.route("/current_user").get(verifyJWT, getCurrentUser);
router.get("/github", github);
router.get("/github/callback", githubCallback);
router.get("/github/connect", verifyJWT, githubConnect);
router.get("/github/connect/callback", verifyJWT, githubConnectCallback);

export default router;
