import mongoose from "mongoose";
import express from "express";
import { dbName } from "../constants.js";

const app = express();

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${dbName}`
    );
    console.log("mongoDB connected successfully");

    app.on("error", (error) => {
      console.log(error);
    });

    console.log(connection.connection.host);
  } catch (error) {
    console.error("mongoDB connection error " + error);
  }
};
