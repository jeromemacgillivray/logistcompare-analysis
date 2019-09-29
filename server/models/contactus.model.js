const mongoose = require("mongoose");

const contactus = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Email:{
        type:String,
        required:true
    },
    Subject:{
        type:String,
        required:true
    },
    Message:{
        type:String,
        required:true
    },
    CreatedDate:{
        type:Date,
        default:Date.now
    },
    ModifiedDate: {
        type: Date,
        default: Date.now
    }

})

const contactUsModel = mongoose.model("ContactUs", contactus);
module.exports = contactUsModel;