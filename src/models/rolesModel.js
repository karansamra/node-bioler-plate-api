module.exports = (sequelize, type) => {
  const Roles = sequelize.define(
    "role",
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
        type: type.STRING(100),
      },
      updatedAt: {
        type: type.DATE,
      },
      updatedBy: {
        type: type.STRING(100),
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
      table: "roles",
    }
  );

  return Roles;
};
