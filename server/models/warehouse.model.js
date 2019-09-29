const mongoose = require("mongoose");
const bulk = new mongoose.Schema({
  MaxLength: Number,
  MaxLengthType: String,
  MaxWidth: Number,
  MaxWidthType: String,
  MaxWeight: Number,
  MaxWeightType: String,
  MaxHeight: Number,
  MaxHeightType: String,
  AvailabilityFrom: Date,
  AvailabilityTo: Date,
  ApxPrice: Number,
  ApxPriceType: String,
  TotalSpace: Number,
  Description: String
});
const pallet = new mongoose.Schema({
  Type: { Name: String, Value: Number },
  Total: Number,
  MaxHeight: Number,
  MaxHeightType: String,
  MaxWeight: Number,
  MaxWeightType: String,
  ApxPrice: Number,
  AvailabilityTo: Date,
  AvailabilityFrom: Date,
  Images: String
});

const location = new mongoose.Schema({
  type: String,
  coordinates: Array
});
const warehouseSehema = new mongoose.Schema({
  Name: {
    type: String
  },
  Capacity: {
    type: Number
  },
  CapacityType: {
    type: String
  },
  Address: {
    type: String
  },
  City: {
    type: String
  },
  PostCode: {
    type: String
  },
  Website: {
    type: String
  },
  Starthrs: {
    type: String
  },
  Endhrs: {
    type: String
  },
  About: {
    type: String
  },
  StorageType: {
    type: String
  },
  Services: {
    type: Object
  },
  WarehouseType: {
    type: Object
  },
  Security: { type: Object },
  Images: {
    type: Array
  },
  PendingSpace: { type: Number },
  AvailableSpace: { type: Number },
  Bulk: { type: bulk, default: bulk },
  Pallet: { type: pallet, default: pallet },
  UserId: {
    type: mongoose.Schema.Types.ObjectId
  },
  OtherSpecify: {
    type: String
  },
  OtherService: {
    type: String
  },
  Location: {
    type: location,
    default: location
  },
  AvgReviews: {
    type: Number,
    default: 0
  },
  Users: {
    type: Number,
    default: 0
  },
  Status: {//0 Active,1 InActive,2 Refrenced
    type: Number,
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

const warehouseModel = mongoose.model("WareHouse", warehouseSehema);
module.exports = warehouseModel;
