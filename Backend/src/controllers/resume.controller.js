import { Resume } from "../models/resume.model.js";
import { User } from "../models/user.model.js";
import { appError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { appResponse } from "../utils/appResponse.js";

const saveResume = asyncHandler(async (req, res) => {
  const {
    personal,
    summary,
    experience,
    projects,
    education,
    skills,
    languages,
    achievements,
  } = req.body.resumeData;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new appError(400, "User not registered");
  }

  try {
    console.log(req.body.resumeData);

    const resumeData = {
      user: user._id,
      personalInformation: {
        name: personal.name,
        email: personal.email,
        phone: personal.phone,
        linkedin: personal.linkedin,
        github: personal.github,
      },
      summary: summary,
      experiences: experience.map((exp) => ({
        experience: {
          // <-- needs to match your schema
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          isPresent: exp.isPresent ?? false,
          description: exp.description,
        },
      })),
      projects: projects.map((pro) => ({
        project: {
          // <-- match schema
          projectName: pro.name,
          startDate: pro.startDate,
          endDate: pro.endDate,
          isPresent: pro.isPresent ?? false,
          technologies: pro.technologies,
          description: pro.description,
          liveLink: pro.liveLink,
          githubLink: pro.githubLink,
        },
      })),
      educations: education.map((edu) => ({
        degree: edu.degree,
        institution: edu.institution,
        location: edu.location,
        startDate: edu.startDate,
        endDate: edu.endDate,
      })),
      skills: {
        technical: skills.technical,
        soft: skills.soft,
      },
      languages: languages,
      achivements: achievements.map((ach) => ({
        description: ach.description,
        url: ach.url,
      })),
    };

    const resume = await Resume.findOneAndUpdate(
      { user: user._id },
      resumeData,
      { new: true, upsert: true }
    );

    if (!resume) {
      throw new appError(400, "Resume not saved in DB");
    }

    res
      .status(200)
      .json(new appResponse(200, resume, "Resume data stored successfuly"));
  } catch (error) {
    appError(400, ": not able to save");
  }
});

const fetchResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new appError(400, "User not found");
  }

  try {
    const resume = await Resume.findOne({ user: user._id });

    if (!resume) {
      throw new appError(404, "Resume not found");
    }

    res
      .status(200)
      .json(new appResponse(200, resume, "Resume data found!"));
  } catch (error) {
    throw new appError(400, error.message || "Error fetching resume");
  }
});

export { saveResume, fetchResume };
