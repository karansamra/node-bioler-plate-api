const jwt_decode = require("jwt-decode");
const model = require("../../models/index");
const Sequelize = require("sequelize");
const userModel = model.user;
const Op = Sequelize.Op;

const { v4: uuidv4 } = require("uuid");
const { translate } = require("../../helpers/multilingual");
const { handleError } = require("../../helpers/errorHandling");
const {
  response: {
    statuses: { success: successStatus, error: errorStatus },
    create: createResponse,
  },
} = require("../../helpers/common");
const { validate } = require("../../helpers/validator");
const { cryptPassword } = require("../../helpers/hashing");
const { uploadFilesToS3 } = require("../../helpers/aws");

module.exports = {
  addUser: async (req, res) => {
    try {
      const validations = {
        firstName: "required|maxLength:255",
        lastName: "required|maxLength:255",
        username: "required|maxLength:100",
        email: "required|email|maxLength:255",
        password: "required|minLength:8|maxLength:45",
      };

      const translateObj = translate(req.headers.lang);

      const matched = await validate(req.body, validations);
      if (matched.status === false) {
        console.error(matched.data);
        throw new handleError(translateObj.__("VALIDATION_ERROR"), 400);
      }

      // Check that if user already exists.
      const userData = await userModel.findOne({
        where: {
          [Op.or]: [
            {
              username: {
                [Op.eq]: req.body.username.toLowerCase(),
              },
            },
            {
              email: {
                [Op.eq]: req.body.email.toLowerCase(),
              },
            },
          ],
        },
      });
      if (userData) {
        throw new handleError(translateObj.__("USER_EXISTS"), 403);
      }

      const hashedPassword = await cryptPassword(req.body.password.trim());
      const jwtDecoded = jwt_decode(req.headers["authorization"]);
      const loggedInUserId = jwtDecoded?.id;
      const addUserTranx = await model.sequelize.transaction().then((t) => {
        return userModel
          .create(
            {
              uuid: uuidv4(),
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              updatedBy: loggedInUserId,
              email: req.body.email.toLowerCase(),
              username: req.body.username.toLowerCase(),
              password: hashedPassword,
            },
            { transaction: t }
          )
          .then(async (userAdded) => {
            t.commit();
            return userAdded;
          })
          .catch((err) => {
            t.rollback();
            throw new handleError(err, 422);
          });
      });
      if (addUserTranx) {
        return createResponse(
          res,
          successStatus,
          addUserTranx,
          translateObj.__("USER_ADDED"),
          201
        );
      } else {
        throw new handleError(translate.__("UNKNOWN_ERROR"), 422);
      }
    } catch (e) {
      console.error(e);
      return createResponse(res, errorStatus, {}, e.message, e.code);
    }
  },
  getUser: async (req, res) => {
    try {
      const translateObj = translate(req.headers.lang);
      const userData = await userModel.findOne({
        where: {
          uuid: req.params.uuid,
        },
        attributes: [
          "firstName",
          "lastName",
          "uuid",
          "email",
          "imageLocation",
          "gender",
          "registrationDate",
          "statusId",
        ],
      });

      if (userData) {
        return createResponse(
          res,
          successStatus,
          userData,
          translateObj.__("USER_FETCHED"),
          200
        );
      } else {
        return createResponse(
          res,
          successStatus,
          userData,
          translateObj.__("USER_NOT_AVAILABLE"),
          404
        );
      }
    } catch (e) {
      console.error(e);
      return createResponse(res, errorStatus, {}, e.message, e.code);
    }
  },
  update: async (req, res) => {
    try {
      const {
        body: { name, gender },
      } = req;
      const translateObj = translate(req.headers.lang);
      if (req.decoded.uuid !== req.params.uuid) {
        throw new handleError(translateObj.__("UNKNOWN_ERROR"), 400);
      }
      let updateObj = {
        firstName: name ? name : undefined,
        updatedBy: req.decoded.id,
        gender: gender ? gender : undefined,
      };
      if (req.files && req.files.image) {
        const [imageData] = await uploadFilesToS3(
          [req.files.image],
          process.env.AWS_S3_PROFILE_PHOTOS_FOLDER_NAME
        );
        updateObj.imageLocation = imageData.Location;
      }
      const updatedData = await model.sequelize
        .transaction()
        .then(async (t) => {
          try {
            await userModel.update(updateObj, {
              where: {
                id: {
                  [Op.eq]: req.decoded.id,
                },
              },
              transaction: t,
            });
            t.commit();
            return true;
          } catch (e) {
            console.log(e);
            t.rollback();
            return false;
          }
        });

      if (updatedData) {
        return createResponse(
          res,
          successStatus,
          {},
          translateObj.__("PROFILE_UPDATED"),
          200
        );
      } else {
        return createResponse(
          res,
          successStatus,
          {},
          translateObj.__("PROFILE_UPDATE_ERROR"),
          402
        );
      }
    } catch (e) {
      console.error(e);
      return createResponse(
        res,
        errorStatus,
        {},
        e.message,
        e.code,
        e.errorData
      );
    }
  },
};
