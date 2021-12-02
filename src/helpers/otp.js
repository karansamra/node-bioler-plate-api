const generate = function () {
  try {
    let text = "";
    const possible = "0123456789";
    for (let i = 0; i < 4; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  } catch (err) {
    return err;
  }
};

module.exports = { generate };
