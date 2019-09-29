const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  Url: {
    type: String,
    required: true
  },
  Description: {
    type: String,
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
const videoModel = mongoose.model("ManageVideos", videoSchema);
module.exports = videoModel;
