const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  Type: {
    type: String,
    required: true
  },
  Description: {
    type: String,
    required: false
  },
  CreatedDate: {
    type: Date,
    default: Date.now
  },
  ModifiedDate: {
    type: Date,
    default: Date.now
  }
});

constreportModel = mongoose.model("Report", reportSchema);
module.exports = constreportModel;
