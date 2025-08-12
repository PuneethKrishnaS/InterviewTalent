class appResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode < 400;
    this.data = data;
    this.message = message;
  }
}

export { appResponse };
