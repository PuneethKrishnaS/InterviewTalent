import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import api from "@/utils/axios";

export const useResumeStore = create((set) => ({
  resumeData: {
    personal: {
      name: null,
      email: null,
      phone: null,
      linkedin: null,
      github: null,
    },
    summary: null,
    experience: [],
    education: [],
    projects: [],
    skills: { technical: [], soft: [] },
    languages: [],
    achievements: [],
  },
  showPdf: true,
  loading: false,
  error: null,
  section: null,

  setShowPdf: (val) => set({ showPdf: val }),

  handleChange: (section, field, value, index = null) => {
    set({ showPdf: false });

    set((state) => {
      const prevData = state.resumeData;
      let updatedData = { ...prevData };

      if (["languages", "technical", "soft"].includes(field)) {
        // Handle comma-separated lists (languages and skills)
        const listValue = value
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "");
        if (section === "languages") {
          updatedData.languages = listValue;
        } else if (section === "skills") {
          updatedData.skills = {
            ...updatedData.skills,
            [field]: listValue,
          };
        }
      } else if (index !== null) {
        // Handle array sections (experience, education, projects, achievements)
        const updatedArray = [...prevData[section]];
        updatedArray[index] = { ...updatedArray[index], [field]: value };
        updatedData[section] = updatedArray;
      } else if (section === "summary") {
        // Handle the summary section
        updatedData.summary = value;
      } else {
        // Handle simple object sections (personal)
        updatedData[section] = { ...prevData[section], [field]: value };
      }

      return { resumeData: updatedData };
    });

    setTimeout(() => set({ showPdf: true }), 100);
  },

  addExperience: () => {
    set({ showPdf: false });
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        experience: [
          ...state.resumeData.experience,
          {
            id: uuidv4(),
            title: "",
            company: "",
            location: "",
            startDate: "",
            endDate: "",
            description: "",
          },
        ],
      },
    }));
    setTimeout(() => set({ showPdf: true }), 100);
  },

  removeExperience: (id) => {
    set({ showPdf: false });
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        experience: state.resumeData.experience.filter((exp) => exp.id !== id),
      },
    }));
    setTimeout(() => set({ showPdf: true }), 100);
  },

  addEducation: () => {
    set({ showPdf: false });
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        education: [
          ...state.resumeData.education,
          {
            id: uuidv4(),
            degree: "",
            institution: "",
            location: "",
            startDate: "",
            endDate: "",
            marks: "",
          },
        ],
      },
    }));
    setTimeout(() => set({ showPdf: true }), 100);
  },

  removeEducation: (id) => {
    set({ showPdf: false });
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        education: state.resumeData.education.filter((edu) => edu.id !== id),
      },
    }));
    setTimeout(() => set({ showPdf: true }), 100);
  },

  addProject: () => {
    set({ showPdf: false });
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        projects: [
          ...state.resumeData.projects,
          {
            id: uuidv4(),
            name: "",
            startDate: "",
            endDate: "",
            technologies: "",
            description: "",
            liveLink: "",
            githubLink: "",
          },
        ],
      },
    }));
    setTimeout(() => set({ showPdf: true }), 100);
  },

  removeProject: (id) => {
    set({ showPdf: false });
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        projects: state.resumeData.projects.filter((proj) => proj.id !== id),
      },
    }));
    setTimeout(() => set({ showPdf: true }), 100);
  },

  addAchievement: () => {
    set({ showPdf: false });
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        achievements: [
          ...state.resumeData.achievements,
          { id: uuidv4(), description: "", documentLink: "" },
        ],
      },
    }));
    setTimeout(() => set({ showPdf: true }), 100);
  },

  removeAchievement: (id) => {
    set({ showPdf: false });
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        achievements: state.resumeData.achievements.filter(
          (ach) => ach.id !== id
        ),
      },
    }));
    setTimeout(() => set({ showPdf: true }), 100);
  },

  moveItem: (section, index, direction) => {
    set({ showPdf: false });
    set((state) => {
      const newArray = [...state.resumeData[section]];
      const [movedItem] = newArray.splice(index, 1);
      const newIndex = direction === "up" ? index - 1 : index + 1;
      newArray.splice(newIndex, 0, movedItem);

      return {
        resumeData: {
          ...state.resumeData,
          [section]: newArray,
        },
      };
    });
    setTimeout(() => set({ showPdf: true }), 100);
  },

  handleFetchGithubProjects: async () => {
    const username = prompt("Please enter your GitHub username:");
    if (!username) return;

    try {
      set({ showPdf: false });
      const response = await fetch(
        `https://api.github.com/users/${username}/repos`
      );
      if (!response.ok) throw new Error("User not found or an error occurred.");

      const repos = await response.json();
      const newProjects = repos.map((repo) => ({
        id: uuidv4(),
        name: repo.name,
        startDate: new Date(repo.created_at).toLocaleDateString(),
        endDate: new Date(repo.updated_at).toLocaleDateString(),
        technologies: repo.language || "N/A",
        description: repo.description || "No description provided.",
        liveLink: repo.homepage || "",
        githubLink: repo.html_url,
      }));

      set((state) => ({
        resumeData: {
          ...state.resumeData,
          projects: [...state.resumeData.projects, ...newProjects],
        },
      }));

      alert(`Successfully fetched ${repos.length} projects from GitHub!`);
      setTimeout(() => set({ showPdf: true }), 100);
    } catch (error) {
      console.error("Error fetching projects:", error);
      alert(error.message);
      set({ showPdf: true });
    }
  },

  handleAIButtonClick: async (
    sectionName,
    sectionData,
    resumeData,
    userPrompt
  ) => {
    const AI_Response = await api.post("/api/v1/resume/ai", {
      sectionName: sectionName,
      sectionData: sectionData,
      resume: resumeData,
      userPrompt: userPrompt,
    });
    switch (sectionName) {
      case "Summary": {
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            summary: AI_Response.data?.data?.Summary, // overwrite summary
          },
        }));
        break;
      }

      case "Experience": {
        const aiExperiences = AI_Response?.data?.data;
        if (!aiExperiences) return;

        set((state) => ({
          resumeData: {
            ...state.resumeData,
            projects: state.resumeData.projects.map((pro) => {
              const aiExperience = aiExperiences.find((p) => p.id === pro.id);
              return {
                ...pro,
                description: aiExperience?.description || pro.description,
              };
            }),
          },
        }));
        break;
      }

      case "Projects": {
        const aiProjects = AI_Response?.data?.data;
        if (!aiProjects) return;

        set((state) => ({
          resumeData: {
            ...state.resumeData,
            projects: state.resumeData.projects.map((pro) => {
              const aiProject = aiProjects.find((p) => p.id === pro.id);
              return {
                ...pro,
                description: aiProject?.description || pro.description,
              };
            }),
          },
        }));
        break;
      }

      case "Achievements": {
        try {
          let aiAchievements = AI_Response?.data?.data;
          console.log(aiAchievements);

          if (!aiAchievements) return;

          if (!Array.isArray(aiAchievements)) {
            aiAchievements = [aiAchievements];
          }

          set((state) => ({
            resumeData: {
              ...state.resumeData,
              achievements: state.resumeData.achievements.map((ach) => {
                const aiAchievement =
                  aiAchievements.find((a) => a.id === ach.id) ||
                  aiAchievements[index];
                return {
                  ...ach,
                  description: aiAchievement?.description || ach.description,
                };
              }),
            },
          }));
        } catch (error) {
          set({ error: error });
        }
        break;
      }

      case "FixEverything": {
        try {
          set({ loading: true });
          const fetched = AI_Response?.data?.data;
          console.log("FixEverything response:", fetched);

          if (fetched) {
            set({ resumeData: fetched, loading: false });
          } else {
            set({ error: "No data returned from AI", loading: false });
          }
        } catch (error) {
          set({
            error: error.response?.data?.message || "FixEverything failed",
            loading: false,
          });
        }
        break;
      }

      default:
        set({ error: "Not able to get response from AI" });
    }
  },

  handleDownloadPdf: () => {
    console.log("This function now lives in the component.");
  },

  handleKeyDown: (e, section, field, index) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target;
      const value = textarea.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue =
        value.substring(0, start) + "\n• " + value.substring(end);

      set({ showPdf: false });
      set((state) => {
        const updatedArray = [...state.resumeData[section]];
        updatedArray[index] = {
          ...updatedArray[index],
          [field]: newValue,
        };
        return {
          resumeData: { ...state.resumeData, [section]: updatedArray },
        };
      });

      setTimeout(() => {
        set({ showPdf: true });
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 100);
    }
  },

  uploadToDataBase: async (resumeData) => {
    try {
      set({ loading: true });
      await api.post("/api/v1/resume/save", { resumeData });
      set({ loading: false });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message });
    }
  },

  fetchFromDB: async () => {
    try {
      set({ loading: true });
      const response = await api.post("/api/v1/resume/fetch");
      const fetched = response.data?.data;

      if (fetched) {
        // Map backend fields into frontend schema
        const normalized = {
          personal: {
            name: fetched.personalInformation?.name || "",
            email: fetched.personalInformation?.email || "",
            phone: fetched.personalInformation?.phone || "",
            linkedin: fetched.personalInformation?.linkedin || "",
            github: fetched.personalInformation?.github || "",
          },
          summary: fetched.summary || "",
          experience: (fetched.experiences || []).map((exp) => ({
            id: exp._id,
            title: exp.title || "",
            company: exp.company || "",
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            description: exp.description || "",
          })),
          education: (fetched.educations || []).map((edu) => ({
            id: edu._id,
            degree: edu.degree || "",
            institution: edu.institution || "",
            location: edu.location || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "",
            marks: edu.marks || "",
          })),
          projects: (fetched.projects || []).map((p) => ({
            id: p._id,
            name: p.project.projectName || "",
            startDate: p.project.startDate || "",
            endDate: p.project.endDate || "",
            technologies: (p.project.technologies || []).join(", "),
            description: p.project.description || "",
            liveLink: p.project.liveLink || "",
            githubLink: p.project.githubLink || "",
          })),
          achievements: (fetched.achivements || []).map((a) => ({
            id: a._id,
            description: a.description || "",
            documentLink: a.documentLink || "",
          })),
          skills: {
            technical: fetched.skills?.technical || [],
            soft: fetched.skills?.soft || [],
          },
          languages: fetched.languages || [],
        };

        set({ resumeData: normalized, loading: false });
      }
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false });
    }
  },
}));
