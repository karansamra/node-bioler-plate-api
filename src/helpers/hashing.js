let bcrypt = require("bcrypt");
let crypto = require("crypto");
module.exports.cryptPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

module.exports.comparePassword = async (plainPass, hashword) => {
  return await bcrypt.compare(plainPass, hashword);
};

module.exports.generateSessionID = () => {
  return crypto.randomBytes(16).toString("base64");
};
