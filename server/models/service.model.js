const mongoose = require("mongoose");

const service = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const servicemodel = mongoose.model("Service", service);
module.exports = servicemodel;
