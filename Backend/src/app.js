import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import userRouter from "./routes/user.routes.js";

const app = express();

// ✅ Dynamic CORS setup
const allowedOrigins = "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser(process.env.COOKIE_PARSER));

// Routes
app.use("/api/v1/users/auth", userRouter);

// Error handler
app.use(errorHandler);

export { app };
