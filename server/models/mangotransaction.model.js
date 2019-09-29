const mongoose = require("mongoose");

const mangotransactionSchema = new mongoose.Schema({
  PayerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  Price: {
    type: Number,
    required: true
  },
  PayeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  Type: {
    type: String,
    required: false
  },
  TypeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  Status: {
    type: Number,
    required: true
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
const mangotransactionModel = mongoose.model(
  "MangoTransaction",
  mangotransactionSchema
);
module.exports = mangotransactionModel;
