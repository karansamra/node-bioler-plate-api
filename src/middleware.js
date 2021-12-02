let jwt = require("jsonwebtoken");
const {
  response: {
    statuses: { error },
    create,
  },
} = require("./helpers/common");
const { translate } = require("./helpers/multilingual");

const checkToken = async (req, res, next) => {
  let token = req.headers["authorization"]; // Express headers are auto converted to lowercase
  const translateObj = translate(req.headers.lang);
  if (token) {
    if (token.startsWith("Bearer ")) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }

    jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return create(res, error, {}, translateObj.__("INVALID_TOKEN"), 401);
        } else {
          req.decoded = decoded;
          next();
        }
      }
    );
  } else {
    return create(res, error, {}, translateObj.__("NO_TOKEN_SUPPLIED"), 401);
  }
};

const createAccessToken = (data) => {
  return jwt.sign(
    {
      id: data.id,
      uuid: data.uuid,
      email: data.email,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const createRefreshToken = (data) => {
  return jwt.sign(
    {
      id: data.id,
      uuid: data.uuid,
      email: data.email,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET
  );
};

module.exports = {
  checkToken,
  createAccessToken,
  createRefreshToken,
};
