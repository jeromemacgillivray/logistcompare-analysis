const mongoose = require("mongoose");

const senderDetail = new mongoose.Schema({
  FirstName: String,
  LastName: String,
  ProfilePicture: String,
  Id: String
});

const ReceiverDetail = new mongoose.Schema({
  FirstName: String,
  LastName: String,
  ProfilePicture: String,
  Id: String
});

const messageSchema = new mongoose.Schema({
  SenderId: {
    type: String,
    required: true
  },

  ReceiverId: {
    type: String,
    required: true
  },
  Text: {
    type: String,
    required: false
  },
  Status: {
    type: Boolean,
    required: false
  },
  SenderInfo: { type: senderDetail, default: senderDetail },
  ReceiverInfo: { type: ReceiverDetail, default: ReceiverDetail },
  CreateDate: {
    type: Date,
    default: Date.now
  },
  ModifiedDate: {
    type: Date,
    default: Date.now
  }
});

const messageModel = mongoose.model("Message", messageSchema);
module.exports = messageModel;
