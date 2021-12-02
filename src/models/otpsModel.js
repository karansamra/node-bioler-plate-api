module.exports = (sequelize, type) => {
  const OtpsModel = sequelize.define(
    "otp",
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: type.STRING(255),
        allowNull: false,
      },
      otpPassword: {
        type: type.STRING(255),
        allowNull: false,
      },
      otpSentAt: {
        type: type.DATE,
        allowNull: false,
      },
      deviceTypeId: {
        type: type.INTEGER,
      },
    },
    {
      table: "otps",
    }
  );

  return OtpsModel;
};
