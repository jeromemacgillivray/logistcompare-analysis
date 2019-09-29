const mongoose = require("mongoose");

const model = new mongoose.Schema({
  Name: {
    type: String,
    required: true
  },
  Description: {
    type: String,
    required: true
  },
  Image: {
    type: String,
    required: true
  },
  Status: {
    type: Number,
    required: true,
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
const testimonialModel = mongoose.model("testimonial", model);
module.exports = testimonialModel;
