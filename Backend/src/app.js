import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import userRouter from "./routes/user.routes.js";
import interviewRouter from "./routes/interview.routes.js";

const app = express();

// ✅ Dynamic CORS setup
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

app.use(express.json({ limit: "300kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser(process.env.COOKIE_PARSER));

// Routes
app.use("/api/v1/users/auth", userRouter);
app.use("/api/v1/interview", interviewRouter);

// Error handler
app.use(errorHandler);

export { app };
