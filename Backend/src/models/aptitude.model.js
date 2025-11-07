import mongoose from "mongoose";

const AptitudeSchema = new mongoose.Schema({}, {});

export const Aptitude = mongoose.model("Aptitude", AptitudeSchema);
