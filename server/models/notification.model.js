const mongoose = require("mongoose");
const user = new mongoose.Schema({
  Id: String,
  Name: String,
  Image: String
});
const notificationSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  Sender: {
    type: user,
    default: user
  },
  Type: {
    type: String,
    required: true
  },
  TypeId: {
    type: String,
    required: true
  },
  Text: {
    type: String,
    required: false
  },
  Url: {
    type: String,
    required: false
  },
  Status: {
    type: Number
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

notificationModel = mongoose.model("Notification", notificationSchema);
module.exports = notificationModel;
