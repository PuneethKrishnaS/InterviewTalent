import mongoose from "mongoose";

const experienceSchema = mongoose.Schema({
  experience: {
    title: String,
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
    technologies: [String],
    startDate: Date,
    endDate: Date,
    isPresent: {
      type: Boolean,
      default: false,
    },
    description: String,
    githubLink: String,
    liveLink: String,
  },
});

const educationSchema = mongoose.Schema({
  degree: String,
  institution: String,
  location: String,
  startDate: Date,
  endDate: Date,
});

const achivementsSchema = mongoose.Schema({
  description: String,
  url: String,
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

    experiences: [experienceSchema],

    projects: [projectSchema],

    educations: [educationSchema],

    skills: {
      technical: [String],
      soft: [String],
    },
    achivements: [achivementsSchema],

    languages: [String],
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", resumeScheme);
