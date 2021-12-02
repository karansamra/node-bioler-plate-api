module.exports = (sequelize, type) => {
  const Permissions = sequelize.define(
    "permission",
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: type.STRING(200),
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
      statusId: {
        type: type.INTEGER,
        allowNull: false,
      },
    },
    {
      table: "permissions",
    }
  );

  return Permissions;
};
