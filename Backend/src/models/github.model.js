import mongoose from "mongoose";

const CommitSchema = new mongoose.Schema({
  sha: { type: String, required: true },
  message: { type: String },
  author: {
    name: { type: String },
  },
});

const GitHubEventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String },
    actor: {
      login: { type: String },
      avatar_url: { type: String },
    },
    repo: {
      name: { type: String },
      url: { type: String },
    },
    payload: {
      commits: [CommitSchema],
    },
    public: { type: Boolean, default: true },
    created_at: { type: Date },
  },
  { _id: false }
);

const GitHubRepoSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    full_name: { type: String },
    html_url: { type: String },
    description: { type: String },
    homepage: { type: String },
    language: { type: String },

    // Stats
    stargazers_count: { type: Number, default: 0 },
    forks_count: { type: Number, default: 0 },
    watchers_count: { type: Number, default: 0 },
    open_issues_count: { type: Number, default: 0 },

    // Activity
    updated_at: { type: Date },
    pushed_at: { type: Date },
    size: { type: Number },

    // Owner
    owner: {
      id: { type: Number },
      login: { type: String },
      avatar_url: { type: String },
      html_url: { type: String },
    },
  },
  { _id: false }
);

const GitHubSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    login: { type: String, required: true },
    name: { type: String },
    avatar_url: { type: String },
    html_url: { type: String },
    bio: { type: String },
    location: { type: String },
    blog: { type: String },
    twitter_username: { type: String },
    public_repos: { type: Number, default: 0 },
    public_gists: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    created_at: { type: Date },
    updated_at: { type: Date },

    // Repositories
    repos: [GitHubRepoSchema],

    // Events
    events: [GitHubEventSchema],
  },
  { timestamps: true }
);

export const GitHub = mongoose.model("GitHub", GitHubSchema);
