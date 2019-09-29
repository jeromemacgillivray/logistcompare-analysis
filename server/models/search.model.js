const mongoose = require("mongoose");
const searchSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  WarehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  CreatedDate: {
    type: Date,
    default: Date.now()
  }
});
const searchModel = mongoose.model("Search", searchSchema);
module.exports = searchModel;
