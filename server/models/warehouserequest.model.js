const mongoose = require("mongoose");


const warehouseRequestSehema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Phone: {
        type: String,
        required: true
    },
    WarehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    Status: {
        type: Number,
        required: true,
        default: 0
    },
    Subject: {
        type: String,
        required: true
    },
    Message: {
        type: String,
        required: true
    },
    Type: {
        type: String,
        required: true
    },
    SpaceRequired: {
        type: String,
        required: false
    },
    FromDate: {
        type: Date,
        required: false
    },
    ToDate: {
        type: Date,
        required: false
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

const warehouseRequestModel = mongoose.model("WarehouseRequest", warehouseRequestSehema);
module.exports = warehouseRequestModel;
