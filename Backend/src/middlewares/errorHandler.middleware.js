import { appError } from "../utils/appError.js";

const errorHandler = (err, req, res, next) => {
  // If it's not an AppError, wrap it into one
  if (!(err instanceof appError)) {
    err = new appError(500, err.message || "Internal Server Error");
  }

  res.status(err.statusCode).json({
    success: false,
    statusCode: err.statusCode,
    message: err.message,
    errors: err.errors || [],
  });
};

export { errorHandler };
