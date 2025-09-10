import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { connectDB } from "./db/index.js";
import { app } from "./app.js";

connectDB();

app.listen(process.env.PORT || 5000, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`running on http://localhost:${process.env.PORT}/`);
  } else {
    console.log(`running on https://interviewtalent.onrender.com/`);
  }
});
