module.exports = (sequelize, type) => {
  const UsersTypes = sequelize.define(
    "users_type",
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        type: type.STRING(100),
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
      table: "users_types",
    }
  );

  return UsersTypes;
};
