const mongoose = require("mongoose");

const model = new mongoose.Schema({
  Title: {
    type: String,
    required: true
  },
  Description: {
    type: String,
    required: true
  },
  Ispublish: {
    type: Boolean,
    required: true,
    default: true
  },
  CreateDate: {
    type: Date,
    default: Date.now
  },
  ModifiedDate: {
    type: Date,
    default: Date.now
  }
});
const faqModel = mongoose.model("FAQ", model);
module.exports = faqModel;
