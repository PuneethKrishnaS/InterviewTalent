import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import userRouter from "./routes/user.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import resumeRouter from "./routes/resume.route.js";
import githubRouter from "./routes/github.routes.js";
import passport from "passport";
import session from "express-session";

const app = express();

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? "https://interview-talent-5abh.vercel.app"
    : "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(
  session({
    secret: "a_strong_secret_key_here",
    resave: process.env.NODE_ENV === "production" ? true : false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" ? true : false },
  })
);

app.use(express.json({ limit: "300kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser(process.env.COOKIE_PARSER));
app.use(passport.initialize());

// Routes
app.use("/api/v1/users/auth", userRouter);
app.use("/api/v1/interview", interviewRouter);
app.use("/api/v1/resume", resumeRouter);
app.use("/api/v1/github", githubRouter);

// Error handler
app.use(errorHandler);

export { app };
