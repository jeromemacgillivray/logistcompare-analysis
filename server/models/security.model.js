const mongoose = require("mongoose");

const security = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const securitymodel = mongoose.model("Security", security);
module.exports = securitymodel;