function handleError(message, code, errorData = {}) {
  this.code = code;
  this.message = message;
  this.errorData = errorData;
}

handleError.prototype = Error.prototype;

module.exports = {
  handleError,
};
