module.exports = (sequelize, type) => {
  const UserLoginAccounts = sequelize.define(
    "user_login_account",
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
      loginAccountTypeId: {
        type: type.INTEGER,
        allowNull: false,
      },
      loginId: {
        type: type.STRING(200),
      },
      userName: {
        type: type.STRING(200),
        allowNull: false,
      },
      lastPassword: {
        type: type.STRING(200),
      },
      currentPassword: {
        type: type.STRING(200),
      },
      passCreatedAt: {
        type: type.DATE,
        allowNull: false,
      },
      passUpdatedAt: {
        type: type.DATE,
        allowNull: false,
      },
      createdAt: {
        type: type.DATE,
        allowNull: false,
      },
      createdBy: {
        type: type.STRING(50),
      },
      updatedAt: {
        type: type.DATE,
      },
      updatedBy: {
        type: type.STRING(50),
      },
      statusId: {
        type: type.INTEGER,
        allowNull: false,
      },
    },
    {
      table: "user_login_accounts",
    }
  );

  return UserLoginAccounts;
};
