module.exports = (sequelize, type) => {
  const UserRoles = sequelize.define(
    "user_role",
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
      roleId: {
        type: type.INTEGER,
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
      isActive: {
        type: type.INTEGER(4),
        allowNull: false,
      },
      statusId: {
        type: type.INTEGER,
        allowNull: false,
      },
    },
    {
      table: "user_roles",
    }
  );

  return UserRoles;
};
