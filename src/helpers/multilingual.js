const i18n_module = require("i18n-nodejs");

const translate = (lang) => {
  const config = {
    lang: lang ? lang : "en",
    langFile: "../../src/helpers/locale.json",
  };

  return new i18n_module(config.lang, config.langFile);
};

module.exports = {
  translate,
};
