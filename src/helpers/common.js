const fs = require("fs");
const response = {
  statuses: {
    success: "success",
    error: "error",
  },
  create(res, status, data, message = "", code = 200, technicalDetails = {}) {
    return res.status(code).json({ status, data, message, technicalDetails });
  },
};

const randomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getUniqueNameForFile = (fileName) => {
  try {
    const milliseconds = new Date().getTime();
    const splittedName = fileName.split(".");
    const makeRandomString = randomString(10);
    return (
      splittedName[0] +
      "_" +
      milliseconds.toString() +
      makeRandomString +
      "." +
      splittedName[splittedName.length - 1]
    );
  } catch (error) {
    console.error(error);
    return null;
  }
};

function moveFile(from, to) {
  const source = fs.createReadStream(from);
  const dest = fs.createWriteStream(to);

  return new Promise((resolve, reject) => {
    source.on("end", resolve);
    source.on("error", reject);
    source.pipe(dest);
  });
}

const arrayToChunks = (a, n) =>
  [...Array(Math.ceil(a.length / n))].map((_, i) => a.slice(n * i, n + n * i));

const lPad = (string, padString, length) => {
  while (string.length < length) {
    string = padString + string;
  }
  return string;
};

const generateRandomPassword = (len) => {
  const length = len ? len : 10;
  const string = "abcdefghijklmnopqrstuvwxyz"; //to upper
  const numeric = "0123456789";
  const punctuation = "!@#$%&*_";
  let password = "";
  let character = "";
  while (password.length < length) {
    let entity1 = Math.ceil(string.length * Math.random() * Math.random());
    let entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
    let entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
    let hold = string.charAt(entity1);
    hold = password.length % 2 == 0 ? hold.toUpperCase() : hold;
    character += hold;
    character += numeric.charAt(entity2);
    character += punctuation.charAt(entity3);
    password = character;
  }
  password = password
    .split("")
    .sort(function () {
      return 0.5 - Math.random();
    })
    .join("");
  return password.substr(0, len);
};

module.exports = {
  response,
  getUniqueNameForFile,
  moveFile,
  arrayToChunks,
  lPad,
  generateRandomPassword,
};
