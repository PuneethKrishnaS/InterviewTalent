import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { appError } from "../utils/appError.js";
import { appResponse } from "../utils/appResponse.js";
import { userSchemaValidater } from "../validators/user.validators.js";

const registerUser = asyncHandler(async (req, res) => {
  //validate inputs
  const { error, value } = userSchemaValidater.validate(req.body, {
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
    throw new appError(400, `Something went worng error -- ${error}`);
  }
});

export { registerUser };
