const model = require("../../models/index");
const Sequelize = require("sequelize");
const { createAccessToken, createRefreshToken } = require("../../middleware");
const userModel = model.user;
const refreshTokenModel = model.refresh_token;
const otpModel = model.otp;
const loginAccountTypesModel = model.login_account_type;
const userLoginAccountsModel = model.user_login_account;
const moment = require("moment");
const Op = Sequelize.Op;
const { v4: uuidv4 } = require("uuid");
const { translate } = require("../../helpers/multilingual");
const { handleError } = require("../../helpers/errorHandling");
const {
  response: {
    statuses: { success: successStatus, error: errorStatus },
    create: createResponse,
  },
  generateRandomPassword,
  otpEmailTemplate,
} = require("../../helpers/common");
const { validate } = require("../../helpers/validator");
const { comparePassword, cryptPassword } = require("../../helpers/hashing");
const jwt = require("jsonwebtoken");
const { generate } = require("../../helpers/otp");
const nodeMailer = require("../../helpers/nodeMailer");
const { dateFormatStandard, dateFormat2 } = require("../../helpers/dates");
const { getActiveStatuses, statuses } = require("../../helpers/sequelize");
const { addOnboardingData, logins, userType } = require("../../helpers/users");

loginAccountTypesModel.hasOne(userLoginAccountsModel);
userLoginAccountsModel.belongsTo(loginAccountTypesModel);

const socialLogin = async (req, res) => {
  try {
    const {
      body: { name, email, gender, uniqueId, deviceId, type },
    } = req;

    const validations = {
      deviceId: "required",
      uniqueId: "required",
    };
    const reqValues = {
      uniqueId,
      deviceId,
    };
    const translateObj = translate(req.headers.lang);
    const { data: validationData, status: validationStatus } = await validate(
      reqValues,
      validations
    );
    if (!validationStatus) {
      throw new handleError(
        translateObj.__("INVALID_CREDENTIALS"),
        401,
        validationData
      );
    }
    const activeStatuses = await getActiveStatuses();
    const activeStatus = activeStatuses?.find(
      (rec) => rec.name === statuses.active
    ).id;
    // Verify User
    const userToVerify = await userLoginAccountsModel.findOne({
      where: {
        loginId: uniqueId,
      },
    });
    let userData;
    if (email) {
      userData = await userModel.findOne({
        where: {
          email: email.toLowerCase(),
        },
      });
    }
    let tokenData;
    /**If new user is registering */
    if (!userToVerify && !userData) {
      const validations = {
        uniqueId: "required",
        type: "required",
      };
      const reqValues = {
        type,
        uniqueId,
      };
      const { data: validationData, status: validationStatus } = await validate(
        reqValues,
        validations
      );
      if (!validationStatus) {
        throw new handleError(
          translateObj.__("INVALID_CREDENTIALS"),
          401,
          validationData
        );
      }
      const password = generateRandomPassword(12);
      const hashedPassword = await cryptPassword(password.trim());

      const socialUserTrx = await model.sequelize
        .transaction()
        .then(async (t) => {
          try {
            userData = await userModel.create(
              {
                uuid: uuidv4(),
                userTypeId: userType.user,
                firstName: name,
                email: email.toLowerCase(),
                password: hashedPassword,
                registrationDate: moment().utc().format(dateFormat2),
                statusId: activeStatus, //Using id 1 for enabled status
                gender: gender,
              },
              { transaction: t }
            );

            tokenData = {
              id: userData.id,
              uuid: userData.uuid,
              email: userData.email,
            };
            t.commit();
            return true;
          } catch (e) {
            console.log(e);
            t.rollback();
            return false;
          }
        });
      if (!socialUserTrx) {
        throw new handleError(translateObj.__("UNKNOWN_ERROR"), 500);
      }
    } else {
      if (userToVerify && userToVerify.statusId !== activeStatus) {
        throw new handleError(translateObj.__("ACCOUNT_DISABLED"), 401);
      }
      if (userToVerify) {
        userData = await userModel.findOne({
          where: {
            id: userToVerify.userId,
          },
        });
      }
      const { id, uuid, email } = userData;
      tokenData = { id, uuid, email };
      await refreshTokenModel.destroy({
        where: { userId: id, deviceId: deviceId },
      });
    }
    const accessToken = await createAccessToken(tokenData);
    const refreshToken = await createRefreshToken(tokenData);
    await refreshTokenModel.create({
      userId: tokenData.id,
      token: refreshToken,
      deviceId: deviceId,
    });
    const {
      dataValues: {
        id: identity,
        firstName,
        lastName,
        email: emailId,
        username,
        uuid: userUuid,
        imageLocation,
      },
    } = userData;
    const response = {
      id: identity,
      uuid: userUuid,
      firstName,
      lastName,
      email: emailId,
      imageLocation,
      username,
      accessToken,
      refreshToken,
    };

    return createResponse(
      res,
      successStatus,
      response,
      translateObj.__("LOGGED_IN"),
      200
    );
  } catch (e) {
    console.error(e);
    return createResponse(res, errorStatus, {}, e.message, e.code, e.errorData);
  }
};

const checkOtp = async (req, res, deleteOtp = true) => {
  try {
    const validations = {
      otp: "required|minLength:4|maxLength:6",
      email: "required|email",
    };
    const translateObj = translate(req.headers.lang);
    const { data: validationData, status: validationStatus } = await validate(
      req.body,
      validations
    );
    if (!validationStatus) {
      throw new handleError(
        translateObj.__("VALIDATION_ERROR"),
        400,
        validationData
      );
    }

    const {
      body: { otp, email },
    } = req;
    const otpData = await otpModel.findOne({
      where: {
        [Op.and]: [{ otpPassword: otp.toString() }, { email }],
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpData) throw new handleError(translateObj.__("INVALID_OTP"), 400);

    const otpExpiry = moment(otpData.otpSentAt)
      .add(process.env.OTP_EXPIRES_IN, process.env.OTP_EXPIRES_IN_TIME_UNIT)
      .format("X");

    const currentTime = moment().format("X");

    if (currentTime > otpExpiry)
      throw new handleError(translateObj.__("OTP_EXPIRED"), 401);

    //delete OTP from table if matched
    if (deleteOtp) await otpModel.destroy({ where: { otpPassword: otp } });
  } catch (e) {
    console.error(e);
    return createResponse(res, errorStatus, {}, e.message, e.code, e.errorData);
  }
};

module.exports = {
  login: async function (req, res) {
    try {
      const {
        body: { password, email, deviceId, type },
      } = req;
      if (
        type === logins.facebook ||
        type === logins.google ||
        type === logins.apple
      ) {
        return socialLogin(req, res);
      }
      const validations = {
        email: "required|email",
        password: "required",
        deviceId: "required",
      };

      const translateObj = translate(req.headers.lang);
      const { data: validationData, status: validationStatus } = await validate(
        req.body,
        validations
      );
      if (!validationStatus) {
        throw new handleError(
          translateObj.__("INVALID_CREDENTIALS"),
          401,
          validationData
        );
      }

      // Verify User
      const userToVerify = await userModel.findOne({
        where: {
          email: email.toLowerCase(),
        },
      });

      if (userToVerify) {
        if (parseInt(userToVerify.dataValues.status) == "enabled") {
          throw new handleError(translateObj.__("ACCOUNT_DISABLED"), 401);
        }

        let passwordComparisonResult = await comparePassword(
          password,
          userToVerify.dataValues.password
        );

        if (passwordComparisonResult) {
          // Create JWT Token
          const {
            dataValues: { id, uuid, email },
          } = userToVerify;
          const tokenData = { id, uuid, email };
          const accessToken = await createAccessToken(tokenData);
          const refreshToken = await createRefreshToken(tokenData);
          await refreshTokenModel.destroy({
            where: { userId: id, deviceId: deviceId },
          });
          await refreshTokenModel.create({
            userId: id,
            token: refreshToken,
            deviceId: deviceId,
          });
          const {
            dataValues: {
              id: identity,
              firstName,
              lastName,
              email: emailId,
              username,
              uuid: userUuid,
              imageLocation,
            },
          } = userToVerify;
          const response = {
            id: identity,
            uuid: userUuid,
            firstName,
            lastName,
            email: emailId,
            imageLocation,
            username,
            accessToken,
            refreshToken,
          };

          return createResponse(
            res,
            successStatus,
            response,
            translateObj.__("LOGGED_IN"),
            200
          );
        } else {
          throw new handleError(translateObj.__("INVALID_PASSWORD"), 401);
        }
      } else {
        throw new handleError(translateObj.__("INVALID_EMAIL_PASSWORD"), 401);
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
  getToken: async (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    let refreshTokenInDB = await refreshTokenModel.findOne({
      where: {
        token: req.body.token,
      },
    });
    if (!refreshTokenInDB) return res.sendStatus(403);
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      async (err, user) => {
        if (err) return res.sendStatus(403);
        const { id, email, uuid } = user;
        const accessToken = await createAccessToken({ id, email, uuid });
        res.json({ accessToken: accessToken });
      }
    );
  },
  changePassword: async (req, res) => {
    try {
      const translateObj = translate(req.headers.lang);
      const userUuid = req.params.uuid;
      const body = req.body;

      let validationObj = {
        newPassword: "required|minLength:8|maxLength:45",
        confirmPassword: "required|minLength:8|maxLength:45",
      };

      //if user using forgot password functionality we'll get an OTP else Old password
      if (body.otp) {
        const validations = {
          ...validationObj,
          otp: "required|minLength:4|maxLength:6",
        };

        const { data: validationData, status: validationStatus } =
          await validate(req.body, validations);
        if (!validationStatus) {
          throw new handleError(
            translateObj.__("VALIDATION_ERROR"),
            400,
            validationData
          );
        }

        //Verifying OTP
        const otpData = await otpModel.findOne({
          where: {
            otpPassword: body.otp.toString(),
          },
        });

        if (!otpData)
          throw new handleError(translateObj.__("INVALID_OTP"), 400);

        const otpExpiry = moment(otpData.otpSentAt)
          .add(process.env.OTP_EXPIRES_IN, process.env.OTP_EXPIRES_IN_TIME_UNIT)
          .format(dateFormatStandard);
        const currentTime = moment().format(dateFormatStandard);

        if (!moment(otpExpiry).isAfter(currentTime, "time"))
          throw new handleError(translateObj.__("OTP_EXPIRED"), 401);

        //delete OTP from table if matched
        await otpModel.destroy({ where: { otpPassword: body.otp } });
      } else {
        const validations = {
          ...validationObj,
          oldPassword: "required|minLength:8|maxLength:45",
        };

        const { data: validationData, status: validationStatus } =
          await validate(req.body, validations);
        if (!validationStatus) {
          throw new handleError(
            translateObj.__("VALIDATION_ERROR"),
            400,
            validationData
          );
        }

        //find user by uuid to match saved password with old password
        const userData = await userModel.findOne({
          where: { uuid: userUuid },
        });

        const passwordComparisonResult = await comparePassword(
          body.oldPassword,
          userData.dataValues.password
        );

        if (!passwordComparisonResult) {
          throw new handleError(translateObj.__("INVALID_OLD_PASSWORD"), 400);
        }
      }

      if (body.newPassword != body.confirmPassword) {
        throw new handleError(translateObj.__("PASSWORD_NOT_MATCHED"), 400);
      }

      const hashedPassword = await cryptPassword(body.newPassword.trim());

      //update user password if everything is validated
      const updatedUser = await userModel.update(
        { password: hashedPassword },
        { where: { uuid: userUuid } }
      );

      if (updatedUser) {
        return createResponse(
          res,
          successStatus,
          {},
          translateObj.__("PASSWORD_CHANGED"),
          200
        );
      } else {
        return createResponse(
          res,
          successStatus,
          {},
          translateObj.__("PASSWORD_CHANGE_ERROR"),
          404
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
  getOtp: async (req, res) => {
    try {
      const { email } = req.params;
      const validations = {
        email: "required|email",
      };
      const translateObj = translate(req.headers.lang);
      const matched = await validate(req.params, validations);
      if (!matched.status) {
        throw new handleError(translateObj.__("INVALID_CREDENTIALS"), 401);
      }
      const userData = await userModel.findOne({
        where: {
          email: {
            [Op.eq]: email.toLowerCase(),
          },
        },
      });
      if (!userData)
        throw new handleError(translateObj.__("USER_NOT_AVAILABLE"), 404);

      const otp = generate();
      await otpModel.destroy({ where: { email: email.toLowerCase() } });
      const otpData = await otpModel.create({
        email: email.toLowerCase(),
        otpPassword: otp,
        otpSentAt: moment().format(dateFormatStandard),
      });
      if (!otpData)
        throw new handleError(translateObj.__("UNKNOWN_ERROR"), 500);
      const emailContent = otpEmailTemplate.replace("@otp@", otp);
      nodeMailer.send(email, "OTP", emailContent);

      return createResponse(
        res,
        successStatus,
        { uuid: userData.dataValues.uuid },
        translateObj.__("OTP_SENT"),
        201
      );
    } catch (e) {
      console.error(e);
      return createResponse(res, errorStatus, {}, e.message, e.code);
    }
  },
  signup: async (req, res) => {
    try {
      const validations = {
        name: "required|maxLength:100",
        email: "required|email|maxLength:255",
        password: "required|minLength:8|maxLength:45",
        measurementSystem: "required",
        height: "required",
        weight: "required",
        trainingGoal: "required",
        workoutFrequency: "required",
        workoutDuration: "required",
        gender: "required",
        workoutFrequencyType: "required",
      };

      const translateObj = translate(req.headers.lang);
      const { data: validationData, status: validationStatus } = await validate(
        req.body,
        validations
      );
      if (!validationStatus) {
        throw new handleError(
          translateObj.__("VALIDATION_ERROR"),
          400,
          validationData
        );
      }

      const {
        body: { name, email, password, gender },
      } = req;
      /** Checking if user has entered valid measurement unit */

      //  Check that if user already exists.
      const userFound = await userModel.findOne({
        where: {
          [Op.or]: [
            {
              email: {
                [Op.eq]: email.toLowerCase(),
              },
            },
          ],
        },
      });
      if (userFound) {
        throw new handleError(translateObj.__("USER_EXISTS"), 403);
      }
      const activeStatuses = await getActiveStatuses();
      const activeStatus = activeStatuses?.find(
        (rec) => rec.name === statuses.active
      ).id;

      const hashedPassword = await cryptPassword(password.trim());
      const userData = await userModel.create({
        uuid: uuidv4(),
        userTypeId: userType.user,
        firstName: name,
        email: email.toLowerCase(),
        password: hashedPassword,
        registrationDate: moment().utc().format(dateFormat2),
        statusId: activeStatus,
        gender: gender,
      });
      const signupTranx = await addOnboardingData(req.body, userData);
      if (signupTranx) {
        return createResponse(
          res,
          successStatus,
          signupTranx,
          translateObj.__("USER_ADDED"),
          201
        );
      } else {
        await userModel.destroy({ where: { id: userData.id } });
        throw new handleError(translateObj.__("UNKNOWN_ERROR"), 500);
      }
    } catch (e) {
      console.error(e);
      console.log(e.message);
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
  verifyOtp: async (req, res) => {
    try {
      await checkOtp(req, res);
      const translateObj = translate(req.headers.lang);

      return createResponse(
        res,
        successStatus,
        {},
        translateObj.__("OTP_VERIFIED"),
        200
      );
    } catch (e) {
      console.error(e);
      return createResponse(res, errorStatus, {}, e.message, e.code);
    }
  },
  logout: async (req, res) => {
    try {
      const { deviceId } = req.body;
      const validations = {
        deviceId: "required",
      };
      const translateObj = translate(req.headers.lang);
      const matched = await validate(req.body, validations);
      if (!matched.status) {
        throw new handleError(translateObj.__("INVALID_CREDENTIALS"), 401);
      }
      const removeToken = await refreshTokenModel.destroy({
        where: { deviceId: deviceId, userId: req.decoded.id },
      });
      if (!removeToken)
        throw new handleError(translateObj.__("UNKNOWN_ERROR"), 500);
      return createResponse(
        res,
        successStatus,
        {},
        translateObj.__("LOGOUT_SUCCESS"),
        200
      );
    } catch (e) {
      console.error(e);
      return createResponse(res, errorStatus, {}, e.message, e.code);
    }
  },
  adminLogout: async (req, res) => {
    try {
      const translateObj = translate(req.headers.lang);
      const removeToken = await refreshTokenModel.destroy({
        where: { userId: req.decoded.id },
      });
      if (!removeToken)
        //
        throw new handleError(translateObj.__("UNKNOWN_ERROR"), 500);
      return createResponse(
        res,
        successStatus,
        {},
        translateObj.__("LOGOUT_SUCCESS"),
        200
      );
    } catch (e) {
      console.error(e);
      return createResponse(res, errorStatus, {}, e.message, e.code);
    }
  },
  checkOtp,
};
