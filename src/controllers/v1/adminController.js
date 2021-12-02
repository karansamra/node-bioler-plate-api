const model = require("../../models/index");
const userModel = model.user;
const statusModel = model.status;
const { translate } = require("../../helpers/multilingual");
const { handleError } = require("../../helpers/errorHandling");
const {
  response: {
    statuses: { success: successStatus, error: errorStatus },
    create: createResponse,
  },
} = require("../../helpers/common");
const { validate } = require("../../helpers/validator");
const {
  createSortBy,
  addFiltersToWhereClause,
  statuses,
} = require("../../helpers/sequelize");
const { uploadFilesToS3 } = require("../../helpers/aws");

module.exports = {
  getUsers: async (req, res) => {
    try {
      const validations = {
        page: "required",
        pageSize: "required",
      };

      // Call Translate
      const translateObj = translate(req.headers.lang);
      const { data: validationData, status: validationStatus } = await validate(
        req.query,
        validations
      );
      if (!validationStatus) {
        throw new handleError(
          translateObj.__("required_inputs"),
          400,
          validationData
        );
      }

      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pageSize);

      const sortByDefault = ["createdAt", "DESC"];

      const {
        sortBy: sortByParams,
        search: filterString,
        status: filterStatus,
        fromDate,
        toDate,
      } = req.query;
      let whereClause = {};

      let statusData;
      if (filterStatus) {
        statusData = await statusModel.findOne({
          where: { name: filterStatus },
        });
      }

      const sortBy = sortByParams?.length
        ? createSortBy(sortByParams)
        : sortByDefault;

      const searchByColumns = ["firstName", "email"];
      const dateFilterColumn = "registrationDate";
      if (filterString || statusData || fromDate || toDate) {
        const filters = {
          searchByColumns,
          filterString,
          whereClause,
          statusId: statusData?.dataValues.id || "",
          fromDate,
          toDate,
          dateFilterColumn,
        };
        whereClause = addFiltersToWhereClause(filters);
      }

      const users = await userModel.findAll({
        where: whereClause,
        order: [sortBy],
        offset: (page - 1) * pageSize,
        limit: pageSize,
      });

      const totalUsers = await userModel.count({
        where: whereClause,
      });

      if (users) {
        return createResponse(
          res,
          true,
          { records: users, totalCount: totalUsers, page, pageSize },
          translateObj.__("USERS_FETCHED"),
          200
        );
      } else {
        return createResponse(
          res,
          true,
          {},
          translateObj.__("USERS_NOT_AVAILABLE"),
          400
        );
      }
    } catch (e) {
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
  update: async (req, res) => {
    try {
      const validations = {
        firstName: "required|maxLength:255",
      };

      const translateObj = translate(req.headers.lang);
      const { data: validationData, status: validationStatus } = await validate(
        req.body,
        validations
      );
      if (!validationStatus) {
        throw new handleError(
          translateObj.__("VALIDATION_ERROR"),
          403,
          validationData
        );
      }

      if (!req.files)
        return createResponse(
          res,
          errorStatus,
          {},
          translateObj.__("PROFILE_IMAGE_REQUIRED"),
          422
        );
      const imageObj = await uploadFilesToS3(
        [req.files.imageLocation],
        process.env.AWS_S3_PROFILE_PHOTOS_FOLDER_NAME
      );
      if (!imageObj) {
        throw new handleError(translateObj.__("UNKNOWN_ERROR"), 500);
      }

      const updatedData = await userModel.update(
        { firstName: req.body.firstName, imageLocation: imageObj[0].Location },
        {
          where: {
            uuid: req.params.uuid,
          },
        }
      );

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
          errorStatus,
          {},
          translateObj.__("PROFILE_UPDATE_ERROR"),
          500
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
  updateStatus: async (req, res) => {
    try {
      const translateObj = translate(req.headers.lang);
      const {
        params: { status, uuid },
      } = req;
      //return if send an invalid status
      if (!Object.values(statuses).includes(status))
        throw new handleError(translateObj.__("INVALID_STATUS"), 422);

      const statusData = await statusModel.findOne({
        where: {
          name: status.trim(),
        },
      });

      //update statusId in users after taking statusId from status table
      const updatedUser = await userModel.update(
        { statusId: statusData.dataValues.id },
        { where: { uuid: uuid } }
      );

      if (updatedUser[0]) {
        return createResponse(
          res,
          successStatus,
          {},
          translateObj.__("STATUS_UPDATED"),
          200
        );
      } else {
        return createResponse(
          res,
          successStatus,
          {},
          translateObj.__("STATUS_UPDATE_ERROR"),
          204
        );
      }
    } catch (e) {
      console.error(e);
      return createResponse(res, errorStatus, {}, e.message, e.code);
    }
  },
  getAdmin: async (req, res) => {
    try {
      const translateObj = translate(req.headers.lang);
      const adminData = await userModel.findOne({
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
        ],
      });

      if (adminData) {
        return createResponse(
          res,
          successStatus,
          adminData,
          translateObj.__("USER_FETCHED"),
          201
        );
      } else {
        return createResponse(
          res,
          successStatus,
          adminData,
          translateObj.__("USER_NOT_AVAILABLE"),
          404
        );
      }
    } catch (e) {
      console.error(e);
      return createResponse(res, errorStatus, {}, e.message, e.code);
    }
  },
};
