module.exports = (sequelize, type) => {
  const LoginAccountTypes = sequelize.define(
    "login_account_type",
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: type.STRING(100),
        allowNull: false,
      },
      createdAt: {
        type: type.DATE,
        allowNull: false,
      },
      createdBy: {
        type: type.STRING(50),
        allowNull: false,
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
      table: "login_account_types",
    }
  );

  return LoginAccountTypes;
};
