class appResponse {
  constructor(statusCode, data, message = "Success", success = true) {
    this.statusCode = statusCode < 400;
    this.data = data;
    this.message = message;
    this.success = success;
  }
}

export { appResponse };
