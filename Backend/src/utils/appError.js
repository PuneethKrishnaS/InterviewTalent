class appError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack
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
