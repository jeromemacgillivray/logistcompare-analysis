const mongoose = require("mongoose");
//Cost BreakDown Schema
const costbreakDownSchema = new mongoose.Schema({
  HandlingIn: {
    type: String,
    required: false
  },
  HandlingOut: {
    type: String,
    required: false
  },
  Storage: {
    type: String,
    required: false
  },
  FinalCost: {
    type: Number,
    required: false
  },
  CreatedOn: {
    type: Date,
    required: false
  }
});
//Bulk Quote schema
const bulkDetailSchema = new mongoose.Schema({
  TotalItem: {
    type: Number,
    required: false
  },
  Length: {
    type: Number,
    required: false
  },
  LengthType: {
    type: String,
    default: "meter"
  },
  Width: {
    type: Number,
    required: false
  },
  WidthType: {
    type: String,
    default: "meter"
  },
  Height: {
    type: Number,
    required: false
  },
  HeightType: {
    type: String,
    default: "meter"
  },
  WeightPerItem: {
    type: Number,
    required: false
  },
  WeightType: {
    type: String,
    default: "Kgs"
  },
  Category: {
    type: String,
    required: false
  },
  TotalWeight: {
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
  TotalSpace: {
    type: String,
    required: false
  },
  TotalSpaceType: {
    type: String,
    required: false
  },
  Description: {
    type: String,
    required: false
  },
  CreatedDate: {
    type: Date,
    default: Date.now()
  },
  ModifiedDate: {
    type: Date,
    default: Date.now()
  },
  CostBreakDown: {
    type: costbreakDownSchema,
    default: {}
  }
});
//Quote Pallets schema
const palletDetailSchema = new mongoose.Schema({
  TotalPallets: {
    type: Number,
    required: false
  },
  TotalWeight: {
    type: String,
    required: false
  },
  WeightPerPellet: {
    type: Number,
    required: false
  },
  WeightType: {
    type: String,
    required: false,
    default: "Kgs"
  },
  HeigthPerPellet: {
    type: Number,
    required: false
  },
  HeightType: {
    type: String,
    required: false,
    default: "meter"
  },
  Category: {
    type: String,
    required: false
  },
  Description: {
    type: String,
    required: false
  },
  FromDate: {
    type: String,
    required: false
  },
  ToDate: {
    type: String,
    required: false
  },
  TotalSpace: {
    type: String,
    required: false
  },
  TotalSpaceType: {
    type: String,
    required: false
  },
  CreatedDate: {
    type: Date,
    default: Date.now()
  },
  ModifiedDate: {
    type: Date,
    default: Date.now()
  },
  CostBreakDown: {
    type: costbreakDownSchema,
    default: {}
  }
});

//quote schema
const quoteSchema = new mongoose.Schema({
  WarehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  Bulks: [bulkDetailSchema],
  Pallets: [palletDetailSchema],
  BookedOn: {
    type: Date
  },
  TotalCapacity: {
    type: Number,
    default: 0
  },
  TotalCostBreakDown: {
    type: costbreakDownSchema,
    default: costbreakDownSchema
  },

  ServicesCost:{
    type:Object,
    default:""
  },
  TotalServicesCost:{

    type:Number,
    default :0
  },
      FinalTotalCost:{
        type:Number,
        default: 0
   },

   ExtraServices: {
     type: Object,
     default:""
   },
   ExtraWarehouseType: {
     type: Object,
     default:""
   },
   ExtraSecurity: { 
     type: Object,
       default:""
    },
    Otherserviceone:{
     type:String,
     default:""
    },
    Otherservicetwo:{
     type:String,
     default:""
    },
  QuoteValidTill: {
    type: Date,
    required: false
  },
  CreatedDate: {
    type: Date,
    default: Date.now()
  },
  ModifiedDate: {
    type: Date,
    default: Date.now()
  },
  StorageType: {
    type: String,
    required: false
  },
  Status: {
    type: Number,
    default: 0
  }
});
const quoteModel = mongoose.model("Quote", quoteSchema);
module.exports = quoteModel;
