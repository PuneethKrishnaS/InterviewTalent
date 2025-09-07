import { GitHub } from "../models/github.model.js";
import { User } from "../models/user.model.js";
import { appError } from "../utils/appError.js";
import { appResponse } from "../utils/appResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";

const fetchRepoFromGithub = async (url, config) => {
  try {
    const allRepo = await axios.get(url, config);

    const properRepo = allRepo.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      description: repo.description,
      homepage: repo.homepage || null,
      language: repo.language,

      // Stats
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      watchers_count: repo.watchers_count,
      open_issues_count: repo.open_issues_count,

      // Activity
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      size: repo.size,

      // Owner
      owner: {
        id: repo.owner?.id,
        login: repo.owner?.login,
        avatar_url: repo.owner?.avatar_url,
        html_url: repo.owner?.html_url,
      },
    }));

    return properRepo;
  } catch (error) {
    throw new appError(403, error.response?.data);
  }
};

const fetchEventFromGithub = async (url, config) => {
  try {
    // Remove placeholder parts from URLs like "...{/privacy}" or "...{/sha}"
    const cleanUrl = url?.replace(/\{.*\}$/, "");

    const allEvents = await axios.get(cleanUrl, config);

    const properEvents = allEvents.data.map((event) => ({
      id: event.id,
      type: event.type,
      actor: {
        login: event.actor?.login,
        avatar_url: event.actor?.avatar_url,
      },
      repo: {
        name: event.repo?.name,
        url: event.repo?.url,
      },
      payload: {
        commits:
          event.payload?.commits?.map((commit) => ({
            sha: commit.sha,
            message: commit.message,
            author: {
              name: commit.author?.name,
            },
          })) || [],
      },
      public: event.public,
      created_at: event.created_at,
    }));

    return properEvents;
  } catch (error) {
    throw new appError(403, error.response?.data);
  }
};

const fetchUserFromGithub = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new appError(500, "Unauthorised User");
    }
    if (!user.github.isConnected) {
      throw new appError(500, "User not connected to GitHub");
    }

    const config = {
      headers: { Authorization: `token ${user.github.accessToken}` },
    };

    // Get GitHub user profile
    const githubResponse = await axios.get(user.github.url, config);

    console.log(githubResponse.data);

    const {
      repos_url,
      events_url,
      public_repos,
      public_gists,
      followers,
      following,
      created_at,
      updated_at,
      id,
      login,
      name,
      avatar_url,
      html_url,
      bio,
      location,
      blog,
      twitter_username,
    } = githubResponse.data;

    if (user.github.githubId !== id) {
      throw new appError(403, "Unauthorized user");
    }

    // Fetch repos & events
    const fetchedRepos = await fetchRepoFromGithub(repos_url, config);
    const fetchedEvents = await fetchEventFromGithub(events_url, config);


    // Build full object
    const githubData = {
      user: {
        login,
        name,
        avatar_url,
        html_url,
        bio,
        location,
        blog,
        twitter_username,
        public_repos,
        public_gists,
        followers,
        following,
        created_at,
        updated_at,
      },
      repos: fetchedRepos,
      events: fetchedEvents,
    };

    await GitHub.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          user: user._id,
          login,
          name,
          avatar_url,
          html_url,
          bio,
          location,
          blog,
          twitter_username,
          public_repos,
          public_gists,
          followers,
          following,
          created_at,
          updated_at,
          repos: fetchedRepos,
          events: fetchedEvents,
        },
      },
      { new: true, upsert: true }
    );

    res
      .status(200)
      .json(
        new appResponse(
          200,
          githubData,
          "github data fetched sucessfully",
          true
        )
      );
  } catch (error) {
    throw new appError(500, error);
  }
});

export { fetchUserFromGithub };
