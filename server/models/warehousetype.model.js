const mongoose = require("mongoose");

const type = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const typemodel = mongoose.model("WarehouseType", type);
module.exports = typemodel;