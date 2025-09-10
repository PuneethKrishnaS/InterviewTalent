import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { appError } from "../utils/appError.js";
import { appResponse } from "../utils/appResponse.js";
import { userSignupValidater } from "../validators/user.validators.js";
import jwt from "jsonwebtoken";
import passport from "passport";

const generateAccessAndRefreshToken = async (user_id) => {
  const user = await User.findById(user_id);

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const refreshAccessAndRefreshToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies?.refreshToken ||
    res.header("Authorization")?.replace("Bearer ", "") ||
    req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new appError(401, "Refresh token required");
  }

  try {
    const decodedInfo = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedInfo._id).select(
      "-password -refreshToken"
    );

    if (!user || user.refreshToken !== incommingRefreshToken) {
      throw new appError(401, "Invalid refresh token");
    }

    const newRefreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true })
      .json(new appResponse(200, { accessToken }, "Token refreshed"));
  } catch (error) {
    throw new appError(401, "Invalid or expired refresh token");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  //validate inputs
  const { error, value } = userSignupValidater.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const validationError = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    throw new appError(400, "Validation error", validationError);
  }

  try {
    const { userName, email, password } = value; // accesing valid inputs

    const isUserExist = await User.findOne({ email }); //find user if exist

    //throe error if user exist
    if (isUserExist) {
      throw new appError(400, "User already exist");
    }

    //store new user data
    const user = await User.create({
      userName: {
        first: userName.first,
        last: userName.last,
      },
      email: email,
      password: password,
      refreshToken: undefined,
    });

    //Check user created or not
    const UserCreated = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    //if not throw user not created
    if (!UserCreated) {
      throw new appError(500, "User creation failed");
    }
    //send response to user client
    res
      .status(201)
      .json(new appResponse(201, { UserCreated }, "User created sucessfully"));
  } catch (error) {
    throw new appError(400, `${error}`);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new appError(401, "Email and Password is required");
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    throw new appError(400, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new appError(400, "User does not exist");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const userLogin = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    .json(
      new appResponse(
        200,
        {
          user: userLogin,
          accessToken,
        },
        "User Login successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: null } },
    { new: true }
  );
  res
    .status(200)
    .clearCookie("accessToken", { httpOnly: true, secure: true })
    .json(new appResponse(200, {}, "User Logged Out"));
});

const github = passport.authenticate("github", {
  scope: ["user:email"],
  session: false,
});

const githubCallback = (req, res, next) => {
  passport.authenticate(
    "github",
    { failureRedirect: "/login", session: false },
    async (err, user) => {
      if (err || !user) {
        return res.redirect(
          process.env.NODE_ENV === "production"
            ? "https://interview-talent-5abh.vercel.app/login"
            : "http://localhost:5173/login"
        );
      }

      try {
        const { accessToken, refreshToken } =
          await generateAccessAndRefreshToken(user._id);

        res
          .status(200)
          .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          })
          .redirect(
            process.env.NODE_ENV === "production"
              ? "https://interview-talent-5abh.vercel.app/dashboard"
              : "http://localhost:5173/dashboard"
          );
      } catch (error) {
        next(error);
      }
    }
  )(req, res, next);
};

const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new appResponse(200, req.user, "User fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessAndRefreshToken,
  getCurrentUser,
  generateAccessAndRefreshToken,
  githubCallback,
  github,
};
