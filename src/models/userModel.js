module.exports = (sequelize, type) => {
  const UserModel = sequelize.define(
    "user",
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
      firstName: {
        type: type.STRING(100),
      },
      middleName: {
        type: type.STRING(100),
      },
      lastName: {
        type: type.STRING(100),
      },
      email: {
        type: type.STRING(200),
      },
      password: {
        type: type.STRING(100),
        allowNull: false,
      },
      updatedBy: {
        type: type.INTEGER,
      },
      createdBy: {
        type: type.STRING(100),
      },
      address: {
        type: type.STRING(255),
      },
      age: {
        type: type.INTEGER,
      },
      cityId: {
        type: type.INTEGER,
      },
      countryId: {
        type: type.INTEGER,
      },
      gender: {
        type: type.STRING(20),
      },
      mobile: {
        type: type.STRING,
      },
      registrationDate: {
        type: type.DATE,
        allowNull: false,
      },
      imageLocation: {
        type: type.STRING(300),
      },
      statusId: {
        type: type.INTEGER,
        allowNull: false,
      },
      userTypeId: {
        type: type.INTEGER,
        allowNull: false,
      },
    },
    {
      table: "users",
    }
  );

  return UserModel;
};
