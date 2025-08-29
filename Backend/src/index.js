import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: ".env" });

connectDB();

app.listen(process.env.PORT || 5000, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`running on http://localhost:${process.env.PORT}/`);
  } else {
    console.log(
      `running on https://interviewtalentbackend-a83tlrh6i.vercel.app/`
    );
  }
});
