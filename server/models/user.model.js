const mongoose = require("mongoose");

//user schema

const bankDetailSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: false
  },
  Beneficiary: {
    type: String,
    required: false
  },
  SWIFTBIC: {
    type: String,
    required: false
  },
  IBAN: {
    type: String,
    required: false
  },
  BusinessName: {
    type: String,
    required: false
  },
  SortCode: {
    type: String,
    required: false
  },
  AccountNumber: {
    type: String,
    required: false
  },
  Address: {
    type: String,
    required: false
  },
  PaymentType: {
    type: String,
    required: false
  },
  MongoBankId: {
    type: String,
    required: false
  }
});

const userSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    required: true
  },
  LastName: {
    type: String,
    required: true
  },
  Email: {
    type: String,
    required: true,
    unique: true
  },
  Password: {
    type: String,
    required: true
  },
  ProfilePicture: {
    type: String,
    required: false,
    default: "/Content/images/default-user.jpg"
  },
  BlockedList: {
    type: Array,
    default: "",
    required: false
  },
  BankDetail: {
    type: bankDetailSchema,
    default: bankDetailSchema
  },
  Status: {
    type: Number,
    required: true,
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

  IsDeleted: {
    type: Boolean,
    default: false
  },
  SubscriptionEndDate: {
    type: Date,
    required: false
  },
  CreateDate: {
    type: Date,
    default: Date.now
  },
  ModifiedDate: {
    type: Date,
    default: Date.now
  },
  ParentId: {
    type: String,
    required: false
  },
  Type: {
    type: String,
    required: false
  },
  Role: {
    type: String,
    required: false
  },
  MangoUserId: {
    type: String,
    required: false
  },
  CardId: {
    type: String,
    required: false
  },
  WalletId: {
    type: String,
    required: false
  }
});

//create model
const userModel = mongoose.model("UserInformation", userSchema);
module.exports = userModel;
