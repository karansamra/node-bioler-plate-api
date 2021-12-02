const Sequelize = require("sequelize");
const model = require("../models/index");
const statusModel = model.status;
const Op = Sequelize.Op;
const moment = require("moment");
const createSortBy = (sortValues) => {
  const sortBy = [];
  let srtArr = [];
  sortValues.forEach((d) => {
    d = JSON.parse(d);
    if (d.desc === true) {
      srtArr = [d.id, "DESC"];
    } else {
      srtArr = [d.id, "ASC"];
    }
    if (d.model) {
      srtArr.unshift(d.model);
    }
    if (d.superModel) {
      srtArr.unshift(d.superModel);
    }
  });
  return [...sortBy, ...srtArr];
};

const addFiltersToWhereClause = (filters) => {
  const searchClause = {
    [Op.or]:
      filters.filterString &&
      filters?.searchByColumns.map((name) => ({
        [`$${name}$`]: { [Op.like]: "%" + filters.filterString + "%" },
      })),
  };

  let filterDateClause = {};
  if ((filters.fromDate || filters.toDate) && filters.dateFilterColumn) {
    filterDateClause = addDateFiltersToWhereClause(
      filters.dateFilterColumn,
      filters.fromDate,
      filters.toDate
    );
  }

  let statusClause = {};
  if (filters.statusId) {
    statusClause = { statusId: parseInt(filters.statusId) };
  }

  return {
    [Op.and]: [searchClause, statusClause, filterDateClause],
  };
};

const addDateFiltersToWhereClause = (columns, startDate, endDate) => {
  let filterClause = {};
  if (!startDate) {
    filterClause[columns] = { [Op.lte]: moment(endDate) };
  } else if (!endDate) {
    filterClause[columns] = { [Op.gte]: moment(startDate) };
  } else {
    filterClause[columns] = {
      [Op.and]: [
        { [Op.gte]: moment(startDate) },
        { [Op.lte]: moment(endDate) },
      ],
    };
  }
  return filterClause;
};

const getActiveStatuses = async () => {
  const statuses = await statusModel.findAll({
    attributes: ["id", "name"],
  });
  return statuses?.map((s) => s.dataValues);
};

const statuses = {
  active: "active",
  inActive: "inActive",
};

module.exports = {
  createSortBy,
  addFiltersToWhereClause,
  getActiveStatuses,
  statuses,
};
