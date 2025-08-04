class appError extends Error {
  constructor(
    errors = [],
    stack,
    message = "Something went wrong",
    statusCode
  ) {
    super(message);
    this.message = message;
    this.errors = errors;
    this.data = null;
    this.statusCode = statusCode;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { appError };
