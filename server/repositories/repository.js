const mongoose = require("../models/db.js");
module.exports = schemaName => {
  const schema = require("../models/" + schemaName);

  return schema;
};
