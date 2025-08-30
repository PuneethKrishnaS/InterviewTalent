import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import api from "@/utils/axios";

export const useResumeStore = create((set, get) => ({
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

  setShowPdf: (val) => set({ showPdf: val }),

  handleChange: (section, field, value, index = null) => {
    set({ showPdf: false });
    set((state) => {
      const prevData = state.resumeData;

      if (section === "languages") {
        return {
          resumeData: {
            ...prevData,
            languages: value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s !== ""),
          },
        };
      } else if (index !== null) {
        const updatedArray = [...prevData[section]];
        updatedArray[index] = { ...updatedArray[index], [field]: value };
        return { resumeData: { ...prevData, [section]: updatedArray } };
      } else if (section === "skills") {
        return {
          resumeData: {
            ...prevData,
            skills: {
              ...prevData.skills,
              [field]: value
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s !== ""),
            },
          },
        };
      }
      // Add a special case for the 'summary' section
      else if (section === "summary") {
        return {
          resumeData: {
            ...prevData,
            summary: value,
          },
        };
      } else {
        return {
          resumeData: {
            ...prevData,
            [section]: { ...prevData[section], [field]: value },
          },
        };
      }
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

  handleAIButtonClick: (sectionName) => {
    console.log(`AI optimization requested for ${sectionName}`);
    alert(
      `AI optimization for ${sectionName} is not yet implemented. This will help make your content ATS-friendly.`
    );
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
      console.log(resumeData);

      const response = await api.post("/api/v1/resume/save", { resumeData });
      console.log("Saved resume:", response.data);
    } catch (err) {
      console.error("Error saving resume:", err.response.error);
    }
  },

  fetchFromDB: async () => {
    set({ loading: true });
    try {
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

        set({ resumeData: normalized });
        console.log("Normalized Resume fetched:", normalized);
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
    }
    set({ loading: false });
  },
  
}));
