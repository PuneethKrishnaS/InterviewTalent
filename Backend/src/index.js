import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { connectDB } from "./db/index.js";
import { app } from "./app.js";

connectDB();

console.log();

const mask = (value) => {
  if (!value) return undefined;
  if (value.length <= 8) return "*****";
  return "*****" + value.slice(-4);
};

const envSummary = {
  PORT: process.env.PORT,
  GROQ_API_KEY: mask(process.env.GROQ_API_KEY),
  MONGO_DB_URI: process.env.MONGO_DB_URI
    ? "mongodb+srv://***" + process.env.MONGO_DB_URI.slice(-10)
    : undefined,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  COOKIE_PARSER: mask(process.env.COOKIE_PARSER),
  ACCESS_TOKEN_SECRET: mask(process.env.ACCESS_TOKEN_SECRET),
  ACCESS_TOKEN_EXPIREY: process.env.ACCESS_TOKEN_EXPIREY,
  REFRESH_TOKEN_SECRET: mask(process.env.REFRESH_TOKEN_SECRET),
  REFRESH_TOKEN_EXPIREY: process.env.REFRESH_TOKEN_EXPIREY,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: mask(process.env.GITHUB_CLIENT_SECRET),
  NODE_ENV: process.env.NODE_ENV,
  CALLBACK_URL:
    process.env.NODE_ENV === "production"
      ? "https://interviewtalent.onrender.com/api/v1/users/auth/github/callback"
      : "http://localhost:8000/api/v1/users/auth/github/callback",
};

console.log("🔍 Loaded Environment Variables:");
console.table(envSummary);

app.listen(process.env.PORT || 5000, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`running on http://localhost:${process.env.PORT}/`);
  } else {
    console.log(`running on https://interviewtalent.onrender.com/`);
  }
});
