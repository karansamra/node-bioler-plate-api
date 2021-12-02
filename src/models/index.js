const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const moment = require("moment");
const db = {};
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: console.log,
    // logging: (...msg) => console.log(msg),
    dialectOptions: {
      //useUTC: true,
      timezone: moment().format("Z"),
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
    pool: { maxConnections: 5, maxIdleTime: 30 },
    autoreconnect: true,
    timezone: moment().format("Z"),
  }
);

fs.readdirSync(__dirname)
  .filter((file) => file.indexOf(".") !== 0 && file !== "index.js")
  .forEach((file) => {
    // const model = sequelize.import(path.join(__dirname, file));
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;
