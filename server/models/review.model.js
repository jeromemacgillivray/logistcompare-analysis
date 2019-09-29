const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  WarehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  Name: {
    type: String,
    required: false
  },
  Email: {
    type: String,
    required: false
  },

  Image: {
    type: String
  },
  Rating: {
    type: Number,
    default: 0,
    required: false
  },
  Description: {
    type: String
  },
  Status: {
    type: Number,
    default: 0
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

const messageModel = mongoose.model("Review", reviewSchema);
module.exports = messageModel;
