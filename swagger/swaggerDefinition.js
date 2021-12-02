const users = require("./docs/users/index");
const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "APIs",
    description: "This includes APIs.",
    contact: {
      name: "Jaskaran Singh",
      linkedIn: "https://www.linkedin.com/in/er-jaskaran-singh/"
    },
    version: "1.0.0",
  },
  paths: { ...users },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

module.exports = swaggerDefinition;
