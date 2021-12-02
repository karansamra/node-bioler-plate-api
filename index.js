const express = require("express");
const app = express();
require("dotenv-flow").config();
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDefinition = require("./swagger/swaggerDefinition");
// For uploading multimedia files
const fileUpload = require("express-fileupload");

// Import Own Defined Modules
const routesV1 = require("./src/routesV1");

// App Configuration
app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Extended: https://swagger.io/specification/#infoObject
let swaggerOptions = {
  swaggerDefinition,
  apis: ["routesV1.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/api", routesV1); // Assigning Defined Routes
app.use(express.static(path.join(__dirname, "public")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(
    ` API services application listening at http://localhost:${port}`
  );
});
