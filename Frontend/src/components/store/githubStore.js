import { create } from "zustand";

export const githubStore = create((set) => ({
  isGithubLinked: false,
  username: null,
  name: null,
  avatarUrl: null,
  bio: null,
  followers: null,
  following: null,
  publicRepos: null,
  starredRepos: null,
  contributions: null,
  topLanguages: [{ name: "JavaScript", percentage: "60%" }],
  popularRepositories: [
    {
      id: 1,
      name: "my-portfolio",
      description:
        "A modern personal portfolio website built with React and Tailwind CSS.",
      stars: 120,
      forks: 30,
      language: "JavaScript",
    },
  ],
  recentActivity: [
    {
      id: 1,
      type: "Pushed to",
      repo: "my-portfolio",
      message: "feat: add dark mode toggle",
      time: "2 hours ago",
    },
  ],
}));
