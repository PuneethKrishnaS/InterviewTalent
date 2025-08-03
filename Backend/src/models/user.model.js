import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      first: {
        type: String,
        required: [true, "User name is required"],
        minlength: [3, "User name should be at least 3 letters long"],
        trim: true,
      },
      last: {
        type: String,
        trim: true,
      },
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [
        function () {
          return !this.isGoogleLinked || !this.isGithubLinked ? true : false;
        },
        "Password is required",
      ],
      minlength: [6, "Password must be at least 6 characters long"],
      trim: true,
    },

    isGoogleLinked: {
      type: Boolean,
      default: false,
    },
    isGithubLinked: {
      type: Boolean,
      default: false,
    },

    profileImage: String,

    performanceMetrics: {
      interviewsCompleted: {
        type: Number,
        default: 0,
      },
      resumeScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      skillsImproved: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified(this.password)) return next();
  this.password = bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIREY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIREY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
