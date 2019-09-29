const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  BlogImage: {
    type: String,
    required: true
  },
  Name: {
    type: String,
    required: true
  },
  By: {
    type: String,
    required: true
  },
  Description: {
    type: String,
    required: true
  },
  UrlDescription: {
    type: String,
    required: true
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

const blogModel = mongoose.model("Blog", BlogSchema);
module.exports = blogModel;
