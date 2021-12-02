module.exports = (sequelize, type) => {
  const Regions = sequelize.define(
    "region",
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        type: type.STRING(100),
      },
      fullName: {
        type: type.STRING(100),
        allowNull: false,
      },
      shortName: {
        type: type.STRING(100),
      },
      countryId: {
        type: type.STRING(100),
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
      table: "regions",
    }
  );

  return Regions;
};
