module.exports = (sequelize, type) => {
  const UserProfileModel = sequelize.define(
    "user_profile",
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        type: type.STRING(100),
        unique: true,
        allowNull: false,
      },
      userId: {
        type: type.INTEGER,
        allowNull: false,
      },
      loginId: {
        type: type.STRING(200),
        allowNull: false,
      },
      password: {
        type: type.STRING(100),
        allowNull: false,
      },
      lastPassword: {
        type: type.STRING(100),
        allowNull: false,
      },
      email: {
        type: type.STRING(200),
        allowNull: false,
      },
      mobile: {
        type: type.STRING(20),
      },
      passwordDuration: {
        type: type.INTEGER,
      },
      goalId: {
        type: type.INTEGER,
        allowNull: false,
      },
      imageid: {
        type: type.INTEGER,
      },
      height: {
        type: type.FLOAT,
      },
      weight: {
        type: type.FLOAT,
      },
      measurementSystemId: {
        type: type.INTEGER,
        allowNull: false,
      },
      summary: {
        type: type.STRING(1000),
      },
      userName: {
        type: type.STRING(50),
      },
      createdBy: {
        type: type.STRING(50),
      },
      updatedBy: {
        type: type.STRING(50),
      },
      lastupdatedAt: {
        type: type.DATE,
      },
      lastupdatedBy: {
        type: type.STRING(100),
      },
      statusId: {
        type: type.INTEGER,
        allowNull: false,
      },
      deviceTypeId: {
        type: type.INTEGER,
        allowNull: false,
      },
    },
    {
      table: "user_profiles",
    }
  );

  return UserProfileModel;
};
