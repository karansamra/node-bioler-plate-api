module.exports = (sequelize, type) => {
  const Status = sequelize.define(
    "status",
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
        defaultValue: sequelize.NOW,
      },
      createdBy: {
        type: type.INTEGER,
        allowNull: true,
      },
      updatedAt: {
        type: type.DATE,
        allowNull: true,
        defaultValue: sequelize.NOW,
      },
      updatedBy: {
        type: type.INTEGER,
        allowNull: true,
      },
    },
    {
      table: "statuses",
    }
  );

  return Status;
};
