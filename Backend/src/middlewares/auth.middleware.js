import jwt from "jsonwebtoken";
import { appError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookie?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new appError(400, "Unauthorized user or request");
    }

    const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedInfo._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new appError(400, "User does not exist");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new appError(401, error);
  }
});

export { verifyJWT };
