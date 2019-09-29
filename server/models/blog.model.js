const mongoose = require("mongoose");

const blog = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const blogmodel = mongoose.model("Blog", security);
module.exports = blogmodel;