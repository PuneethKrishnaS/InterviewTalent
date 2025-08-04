import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: ".env" });
connectDB();

app.listen(process.env.PORT,()=>{
    console.log("running on port " + process.env.PORT);

})