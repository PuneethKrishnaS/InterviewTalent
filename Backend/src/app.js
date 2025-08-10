import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//routes import
import userRouter from "./routes/user.routes.js";

const app = express();

//epxress config
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser({ secret: process.env.COOKIE_PARSER }));

//route decleration

app.use("/users", userRouter);

export { app };
