import mongoose from "mongoose";

const experienceSchema = mongoose.Schema({
  experience: {
    jobTitle: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    isPresent: {
      type: Boolean,
      default: false,
    },
    description: String,
  },
});

const projectSchema = mongoose.Schema({
  project: {
    projectName: String,
    Technologies: [String],
    startDate: Date,
    endDate: Date,
    isPresent: {
      type: Boolean,
      default: false,
    },
    description: String,
    projectUrl: String,
    liveUrl: String,
  },
});

const educationSchema = mongoose.Schema({
  degree: String,
  university: String,
  location: String,
  startDate: Date,
  endDate: Date,
});

const resumeScheme = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    personalInformation: {
      name: String,
      email: String,
      phone: String,
      linkedin: String,
      github: String,
    },
    summary: String,

    experience: [experienceSchema],

    project: [projectSchema],

    education: [educationSchema],

    skills: {
      technical: [String],
      soft: [String],
    },
    
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", resumeScheme);
