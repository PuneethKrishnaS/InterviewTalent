// src/strategies/github.strategy.js
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/user.model.js";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://interview-talent-5abh.vercel.app/api/v1/users/auth/github/callback"
          : "http://localhost:8000/api/v1/users/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0]?.value;
        console.log(profile);

        if (!email) {
          return done(new Error("No email from GitHub"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            userName: {
              first: profile.displayName || profile.username,
              last: "",
            },
            email: email,
            isloggedInFromSocialLinks: { fromGithub: true },
            profileImage: profile.photos?.[0]?.value || null,
            github: {
              isConnected: true,
              githubId: profile._json.id,
              url: profile._json.url,
              username: profile.username,
              email: email,
              accessToken: accessToken,
            },
          });
        } else {
          if (!user.profileImage) {
            user.profileImage = profile.photos?.[0]?.value;
          }
          user.github = {
            isConnected: true,
            githubId: profile._json.id,
            url: profile._json.url,
            username: profile.username,
            email: email,
            accessToken: accessToken,
          };
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
