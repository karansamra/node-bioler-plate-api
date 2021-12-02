module.exports = (sequelize, type) => {
  const RolePermissionsModel = sequelize.define(
    "role_permission",
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roleId: {
        type: type.INTEGER,
        allowNull: false,
      },
      permissionId: {
        type: type.INTEGER,
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
      isActive: {
        type: type.INTEGER(4),
        allowNull: false,
      },
      lastupdatedAt: {
        type: type.DATE,
      },
      lastupdatedBy: {
        type: type.STRING(50),
      },
      statusId: {
        type: type.INTEGER,
        allowNull: false,
      },
    },
    {
      table: "role_permissions",
    }
  );

  return RolePermissionsModel;
};
