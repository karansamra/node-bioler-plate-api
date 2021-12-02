module.exports = (sequelize, type) => {
  const RefreshTokenModel = sequelize.define(
    "refresh_token",
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: type.INTEGER,
        allowNull: false,
      },
      token: {
        type: type.STRING,
      },
      deviceId: {
        type: type.STRING,
        allowNull: true,
      },
    },
    {
      table: "refresh_tokens",
    }
  );

  return RefreshTokenModel;
};
