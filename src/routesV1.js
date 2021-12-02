const router = require("express").Router();
const { checkToken } = require("./middleware");
const moment = require("moment");
let usersControllerV1 = require("./controllers/v1/usersController");
let adminControllerV1 = require("./controllers/v1/adminController");
let authControllerV1 = require("./controllers/v1/authController");
/*---------------------------------------------------------------------------------
 Define All the Routes Below. The routes will follow REST API standards strictly.
 ---------------------------------------------------------------------------------*/
router.get("/", (req, res) => {
  const port = process.env.PORT || 3001;
  res.send(
    `Nordic Strong Express Application is running on this Server. Server Datetime: ${moment().format(
      "MMMM Do YYYY, h:mm:ss a z"
    )} <br><br> Swagger is running on <a href="http://localhost:${port}/api-docs">http://localhost:${port}/api-docs</a>`
  );
});

// Authentication
router.post("/v1/login", authControllerV1.login);
router.post("/v1/logout", checkToken, authControllerV1.logout);
router.post("/v1/refresh-token", authControllerV1.getToken);

// Users
router.post("/v1/users", checkToken, usersControllerV1.addUser);
router.get("/v1/users/:uuid", checkToken, usersControllerV1.getUser);
router.get("/v1/users", checkToken, adminControllerV1.getUsers);

module.exports = router;
