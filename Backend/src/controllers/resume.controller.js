import { Resume } from "../models/resume.model.js";
import { User } from "../models/user.model.js";
import { appError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { appResponse } from "../utils/appResponse.js";
import { groqHamdlerAI } from "../utils/groqAI.js";

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

    res.status(200).json(new appResponse(200, resume, "Resume data found!"));
  } catch (error) {
    throw new appError(400, error.message || "Error fetching resume");
  }
});

const resumeSummaryAI = async (sectionName, sectionData, res) => {
  try {
    console.log("Summer get to ai function");

    const prompt = `
You are given the "${sectionName}" section of a resume.  

Original text: ${sectionData}

Instructions:
1. Rewrite this section to be more professional, concise, and ATS-friendly.  
2. Keep the meaning and intent but improve clarity, grammar, and keyword optimization.  
3. Return only the improved "${sectionName}" text (do not include explanations, or formatting).
4. Give response in "Summary":"" json format  
`;
    const response = await groqHamdlerAI({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log(response);

    return res
      .status(200)
      .json(new appResponse(200, response, `Updated ${sectionName} by AI`));
  } catch (error) {
    throw new appError(400, error || "Failed to update resume summary");
  }
};

const resumeExperienceAI = async (sectionName, sectionData, res) => {
  const prompt = `
You are given the "${sectionName}" section of a resume.  

Original content: ${JSON.stringify(sectionData)}

Instructions:
1. Rewrite each experience entry to be more professional, results-oriented, and ATS-friendly.  
2. Preserve the JSON object/array structure exactly as provided.  
3. Do not remove, rename, or add fields (e.g., jobTitle, company, duration, responsibilities, etc.).  
4. Improve clarity, grammar, and emphasize achievements with strong action verbs where appropriate.  
5. Return the updated "${sectionName}" strictly in valid JSON format with no extra text.  
`;

  const response = await groqHamdlerAI({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  res
    .status(200)
    .json(new appResponse(200, response, `Updated ${sectionName} by AI`));
};

const resumeProjectsAI = async (sectionName, sectionData, res) => {
  try {
    const prompt = `
  You are given the "${sectionName}" section of a resume.  
  
  Original content: ${JSON.stringify(sectionData)}
  
  Instructions:
  1. Rewrite each project description to be more professional, concise, and ATS-friendly.  
  2. Preserve the JSON object structure exactly as provided.  
  3. Do not remove or rename any fields (e.g., title, description, technologies, duration, etc.).  
  4. Only improve the wording, grammar, and clarity.  
  5. Return the updated "${sectionName}" strictly in valid JSON format with no extra text.  
  `;

    const response = await groqHamdlerAI({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    res
      .status(200)
      .json(new appResponse(200, response, `Updated ${sectionName} by AI`));
  } catch (error) {
    throw new appError(401, error);
  }
};

const resumeAchievementsAI = async (sectionName, sectionData, res) => {
  try {
    const prompt = `
  You are given the "${sectionName}" section of a resume.  
  
  Original content: ${JSON.stringify(sectionData)}
  
  Instructions:
  1. Rewrite each achievement to be more professional, impactful, and ATS-friendly.  
  2. Preserve the JSON object/array structure exactly as provided.  
  3. Do not remove, rename, or add new fields.  
  4. Only improve the wording, clarity, grammar, and keyword strength.  
  5. Return the updated "${sectionName}" strictly in valid JSON format with no extra text.  
  `;

    const response = await groqHamdlerAI({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    res
      .status(200)
      .json(new appResponse(200, response, `Updated ${sectionName} by AI`));
  } catch (error) {
    throw new appError(401, error);
  }
};

const resumeFixEverythingAI = async (userPrompt, resume, res) => {
  try {
    const prompt = `
  You are given a resume in JSON format. 
  
  Instructions:
  1. Do not change any sensitive information (such as name, email, phone, address, or other personal identifiers).  
  2. Keep the JSON structure exactly the same as provided.  
  3. Only improve or rewrite the following sections based on the user request: 
     - summary
     - experience (if present)
     - projects (if present)
     - achievements (if present)
  4. Return the updated resume strictly in valid JSON format with no extra text or explanation.
  
  User request: "${userPrompt}"  
  Resume: "${JSON.stringify(resume)}"
  `;

    const response = await groqHamdlerAI({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    console.log(response);

    res
      .status(200)
      .json(new appResponse(200, response, "Updated resume by AI"));
  } catch (error) {
    throw new appError(401, error);
  }
};

const getAIResumeATS = asyncHandler(async (req, res) => {
  try {
    const { sectionName, sectionData, resume, userPrompt } = req.body;
    console.log(sectionData);

    switch (sectionName) {
      case "Summary":
        await resumeSummaryAI(sectionName, sectionData, res);
        break;
      case "Experience":
        resumeExperienceAI(sectionName, sectionData, res);
        break;
      case "Projects":
        resumeProjectsAI(sectionName, sectionData, res);
        break;
      case "Achievements":
        resumeAchievementsAI(sectionName, sectionData, res);
        break;
      case "FixEverything":
        resumeFixEverythingAI(userPrompt, resume, res);
        break;
      default:
        throw new appError(500, "Unauthorized sections of resume");
    }
  } catch (error) {
    throw new appError(401, error.message);
  }
});

export { saveResume, fetchResume, getAIResumeATS };
