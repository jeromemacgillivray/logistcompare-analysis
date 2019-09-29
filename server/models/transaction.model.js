const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  Price: {
    type: Number,
    required: true
  },

  Type: {
    type: String,
    required: false
  },
  PaymentId: {
    type: String,
    required: true
  },
  MangoTransactionId: {
    type: String,
    required: false
  },
  Method: {
    type: String,
    required: false
  },
  CreateDate: {
    type: Date,
    default: Date.now
  },
  ModifiedDate: {
    type: Date,
    default: Date.now
  },
  Status: {
    type: Number,
    required: false
  }
});
const transactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = transactionModel;
