const { Validator } = require("node-input-validator");

module.exports.validate = async (data, fieldsToCheck) => {
  const v = new Validator(data, fieldsToCheck);

  const matched = await v.check();
  if (!matched) {
    return { status: false, data: v.errors };
  } else {
    return { status: true, data: {} };
  }
};
