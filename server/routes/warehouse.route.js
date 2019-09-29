const express = require("express");
const router = express.Router();
const path = require("path");
const repositoryPath = path.resolve(
  __dirname,
  "../repositories/warehouse.repository.js"
);
const repository = require(repositoryPath);
const security = require(path.resolve(
  __dirname,
  "./../helper/security.helper.js"
));
const appConfig = require("../app.config.js");
const warehouseSecurity = require("../repositories/warehousesecurity.repository.js");
const warehouseService = require("../repositories/warehouseservice.repository.js");
const warehouseType = require("../repositories/warehousetype.repository.js");
const reviewRepo = require("../repositories/review.repository.js");
const notificationRepo = require("../repositories/notification.repository.js");
const UserInformationRepo = require("../repositories/user.repository.js");
const QuoteRepository = require("../repositories/quotes.repository.js");
const ReviewRepositry = require("../repositories/review.repository.js");
const UserRepository = require("../repositories/user.repository.js");
const mongoose = require("mongoose");


router.get("/getlocations", (req, res) => {
  const projection = {
    Name: 1,
    //Address: 1,
    _id: 0,
    "Location.coordinates": 1
  }
  UserRepository.allWithProjection({ Status: { $ne: 2 }, Type: "Owner" }, { _id: 1 }, (error, users) => {

    if (error) {
      repository.allwithProjections({}, projection, (error, response) => {
        if (error) {
          return res.status(500).json(error);
        }
        let data = response
        return res.json({ response });
      });
    }
    let userIds = users.map((item, index) => {
      return item._id;
    })
    repository.allwithProjections({ UserId: { $in: userIds }, Status: 0, "Location.coordinates": { $exists: true } }, projection, (error, response) => {
      if (error) {
        return res.status(500).json(error);
      }
      let data = response
      return res.json({ response });
    });
  });
})
router.use(function (req, res, next) {
  var x = req.headers.referer
  x = x.split('/')
  var data = x[x.length - 1]

  if (data != "find") {
    data = data.split('?')
    data = data[0]
  }
  if (data != "find" && data != "search") {
    security.VerifyToken(req.headers.accesstoken, (error, decoded) => {
      // console.log(error, decoded, 'error, decoded')
      if (error) {
        return res.status(401).json({
          Status: false,
          Message: "Session Expired"
        });
      }
      next();
    });
  } else
    next();
});
router.use(function (req, res, next) {
  //Security.VerifyToken(req.headers.accesstoken, (error, decoded) => {
  var x = req.headers.referer
  x = x.split('/')
  var data = x[x.length - 1]

  if (data != "find") {
    data = data.split('?')
    data = data[0]
  }
  if (data != "find" && data != "search") {
    let user = security.decodeToken(req.headers.accesstoken);
    if (user.Type == "Owner" && user.Email.toLowerCase() != appConfig.adminEmailId.toLowerCase()) {
      let subscriptionDate = new Date(user.SubscriptionEndDate);
      let currentDate = new Date();
      if (subscriptionDate < currentDate) {
        return res.status(400).json({
          Status: false,
          Message: "Subscription Expired"
        });
      }
    }
  }
  next();
});
router.post("/add", (req, res, next) => {
  const userid = security.decodeToken(req.headers.accesstoken).Id;
  const warehouse = req.body;
  warehouse.UserId = userid;
  if (warehouse.StorageType == "Bulk_Pallet") {
    if (
      warehouse["Pallet"]["AvailabilityTo"] != "" &&
      warehouse["Pallet"]["AvailabilityTo"] != null
    ) {
      warehouse["Pallet"]["AvailabilityFrom"] = new Date();
    }
    if (
      warehouse["Bulk"]["AvailabilityTo"] != "" &&
      warehouse["Bulk"]["AvailabilityTo"] != null
    ) {
      warehouse["Bulk"]["AvailabilityFrom"] = new Date();
    }
  } else {
    if (
      warehouse[warehouse.StorageType]["AvailabilityTo"] != "" &&
      warehouse[warehouse.StorageType]["AvailabilityTo"] != null
    ) {
      warehouse[warehouse.StorageType]["AvailabilityFrom"] = new Date();
    }
  }
  for (var i = 0; i < warehouse.Addresses.length; i++) {
    warehouse.Address = warehouse.Addresses[i].Address;
    warehouse.PostCode = warehouse.Addresses[i].PostCode;
    warehouse.City = warehouse.Addresses[i].City;
    warehouse.Location = warehouse.Addresses[i].Location;
    repository.save(warehouse, (error, response) => {
      if (error) {
        return res.status(500).json(error);
      }
    });
  }
  return res.json({
    status: true,
    Message: "Success"
  });
});

router.post("/update", (req, res, next) => {
  const warehouse = req.body;
  if (warehouse.StorageType == "Bulk_Pallet") {
    if (
      warehouse["Pallet"]["AvailabilityTo"] != "" &&
      warehouse["Pallet"]["AvailabilityTo"] != null
    ) {
      warehouse["Pallet"]["AvailabilityFrom"] = new Date();
    }
    if (
      warehouse["Bulk"]["AvailabilityTo"] != "" &&
      warehouse["Bulk"]["AvailabilityTo"] != null
    ) {
      warehouse["Bulk"]["AvailabilityFrom"] = new Date();
    }
  } else {
    if (
      warehouse[warehouse.StorageType]["AvailabilityTo"] != "" &&
      warehouse[warehouse.StorageType]["AvailabilityTo"] != null
    ) {
      warehouse[warehouse.StorageType]["AvailabilityFrom"] = new Date();
    }
  }
  repository.update(warehouse, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.json(response);
  });
});

router.get("/get/:id", (req, res, next) => {
  repository.get(req.params.id, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.json(response[0]);
  });
});

router.get("/delete/:id", (req, res, nest) => {
  repository.delete(req.params.id, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    res;
    return res.json(response);
  });
});

router.get("/all", (req, res, next) => {
  const query = {
    UserId: security.decodeToken(req.headers.accesstoken).Id,
    Status: 0
  };
  repository.find(query, (error, response) => {
    return res.status(200).json(response);
  });
});

router.get("/find", (req, res, next) => {
  // console.log("req find warehosyue====", req, res)
  repository.getNearByLocationCoordinates(req.query, (error, response) => {
    if (error) {
      console.log('error===================', error)
      return res.json({
        status: false,
        Message: error.Message
      });
    }
    return res.status(200).json(response);
  });
});
router.get("/search", (req, res, next) => {
  repository.search(req.query, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(response);
  });
});
router.post("/uploadimage", (req, res, next) => {
  const obj = {
    file: req.files.image,
    name: req.body.name
  };
  repository.uploadImage(obj, (err, response) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.send(response);
  });
});
//Create first warehouse
router.post("/create", (req, res, next) => {
  const user = security.decodeToken(req.headers.accesstoken);
  const userid = user.Id;
  const warehouse = req.body;
  warehouse.UserId = userid;
  repository.save(warehouse, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    UserRepository.find({ Email: user.Email }, (error, user) => {
      let token = security.GenerateToken(user[0]);
      return res.json({
        status: true,
        Message: "success",
        token: token,
        warehouseId: response.id
      });
    });
  });
});

router.get("/services", (req, res, next) => {
  warehouseService.all((err, data) => {
    if (err) return res.status(500).json(err);

    const response = data.reduce(function (map, obj) {
      map[obj.name] = false;
      return map;
    }, {});
    res.json(response);
  });
});

router.get("/security", (req, res, next) => {
  warehouseSecurity.all((err, data) => {
    if (err) return res.status(500).json(err);

    const response = data.reduce(function (map, obj) {
      map[obj.name] = false;
      return map;
    }, {});
    res.json(response);
  });
});

router.get("/types", (req, res, next) => {
  warehouseType.all((err, data) => {
    if (err) return res.status(500).json(err);

    const response = data.reduce(function (map, obj) {
      map[obj.name] = false;
      return map;
    }, {});
    res.json(response);
  });
});
router.post("/review/save", (req, res, next) => {
  const wid = req.body.Id;
  const user = security.decodeToken(req.headers.accesstoken);
  const review = {
    WarehouseId: wid,
    UserId: user.Id,
    Name: user.FirstName + " " + user.LastName,
    Rating: req.body.Rating,
    Email: user.Email,
    Image: user.ProfilePicture,
    Description: req.body.Description
  };
  let warehouse = {};
  repository.get(wid, (err, response) => {
    if (err) res.status(500).json(err);
    warehouse = response[0];

    reviewRepo.save(review, (error, data) => {
      if (error) {
        return res.status(500).json(error);
      } else {
        let avgrating = warehouse.AvgReviews * warehouse.Users;
        let users = warehouse.Users;
        users += 1;
        avgrating += review.Rating;
        const totalRating = avgrating / users;
        const notificationModel = {
          UserId: warehouse.UserId,
          Text: "Rating given by user",
          Type: "Rating",
          TypeId: warehouse._id,
          Sender: {
            Id: user.Id,
            Name: user.FirstName + " " + user.LastName,
            Image: user.ProfilePicture
          },
          Status: 0
        };
        notificationRepo.save(notificationModel, (er, rs) => { });
        repository.findByIdAndUpdate(
          wid,
          { AvgReviews: totalRating, Users: users },
          { new: true, upsert: true },
          (e, r) => {
            console.log(r);
            return res.status(200).json(data);
          }
        );
      }
    });
  });
});
router.get("/review/:id", (req, res, next) => {
  const query = { WarehouseId: req.params.id };
  reviewRepo.find(query, (error, response) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(response);
  });
});

router.get("/providerlist", (req, res, next) => {
  const skipCount = parseInt(req.query.pageNo);
  const text = req.query.text;
  /* users have No of warehouses ..*/
  let query = [];
  query = [
    {
      $lookup: {
        from: "warehouses",
        localField: "_id",
        foreignField: "UserId",
        as: "data"
      }
    },

    {
      $group: {
        _id: {
          Name: { $concat: ["$FirstName", " ", "$LastName"] },
          Email: "$Email",
          userId: "$_id",
          userStatus: "$Status",
          CreateDate: "$CreateDate",
          totalWareHouse: { $size: "$data" }
        }
      }
    },
    { $sort: { "_id.CreateDate": -1 } },
    { $skip: skipCount },
    { $limit: 10 },

  ];
  if (text != NaN && text != "") {
    query.splice(0, 0, {
      $match: {
        $and: [
          { Type: "Owner" },
          {
            $or: [
              { FirstName: new RegExp(text, "i") },
              { LastName: new RegExp(text, "i") },
              { Email: new RegExp(text, "i") }
            ]
          }
        ]
      }
    });
  } else {
    query.splice(0, 0, {
      $match: { Type: "Owner" }
    });
  }
  UserInformationRepo.aggregate(query, function (err, response) {
    if (err) return res.status(500).json(err);
    return res.status(200).json(response);
  });
});

router.get("/providercount", (req, res) => {
  /* users have No of warehouses ..*/
  const text = req.query.text;
  let query = [
    {
      $lookup: {
        from: "warehouses",
        localField: "_id",
        foreignField: "UserId",
        as: "data"
      }
    },

    {
      $group: {
        _id: {
          Name: { $concat: ["$FirstName", " ", "$LastName"] },
          Email: "$Email",
          userId: "$_id",
          userStatus: "$Status",
          totalWareHouse: { $size: "$data" }
        }
      }
    }
  ];
  if (text != NaN && text != "") {
    query.splice(0, 0, {
      $match: {
        $and: [
          { Type: "Owner" },
          {
            $or: [
              { FirstName: new RegExp(text, "i") },
              { LastName: new RegExp(text, "i") }
            ]
          }
        ]
      }
    });
  }
  UserInformationRepo.aggregate(query, function (err, response) {
    if (err) return res.status(500).json(err);
    return res.status(200).json(response);
  });
});

router.get("/userWareList", (req, res) => {
  const skipCount = parseInt(req.query.pageno);
  /* users have No of warehouses ..*/
  const userid = mongoose.Types.ObjectId(req.query.userid);
  QuoteRepository.aggregate(
    [
      { $match: { UserId: userid } },
      {
        $lookup: {
          from: "warehouses",
          localField: "WarehouseId",
          foreignField: "_id",
          as: "data"
        }
      },
      { $unwind: { path: "$data", preserveNullAndEmptyArrays: true } },
      { $skip: skipCount },
      { $limit: 10 },
      {
        $project: {
          "data.Name": 1,
          "data._id": 1,
          Status: 1,
          "TotalCostBreakDown.FinalCost": 1,
          "Pallets.FromDate": 1,
          "Pallets.ToDate": 1
        }
      }
    ],
    function (err, response) {
      return res.json(response);
    }
  );
});
router.get("/AlluserWareCount/:userid", (req, res) => {
  const userid = mongoose.Types.ObjectId(req.params.userid);
  QuoteRepository.aggregate(
    [
      { $match: { UserId: userid } },
      {
        $lookup: {
          from: "warehouses",
          localField: "WarehouseId",
          foreignField: "_id",
          as: "data"
        }
      },
      { $unwind: { path: "$data", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          "data.Name": 1,
          "data._id": 1,
          Status: 1,
          "TotalCostBreakDown.FinalCost": 1,
          "Pallets.FromDate": 1,
          "Pallets.ToDate": 1
        }
      }
    ],
    function (err, response) {
      return res.json(response);
    }
  );
});
router.get("/GetwareDetailList", (req, res) => {
  const skipCount = parseInt(req.query.pageNo);
  const wareId = mongoose.Types.ObjectId(req.query.warehouseId);

  QuoteRepository.aggregate(
    [
      { $match: { WarehouseId: wareId } },

      {
        $lookup: {
          from: "userinformations",
          localField: "UserId",
          foreignField: "_id",
          as: "userData"
        }
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },

      { $skip: skipCount },
      { $limit: 10 },

      {
        $project: {
          name: { $concat: ["$userData.FirstName", " ", "$userData.LastName"] },
          email: "$userData.Email",
          StorageType: 1,
          cost: "$TotalCostBreakDown.FinalCost",
          "Pallets.FromDate": 1,
          "Pallets.TotalSpace": 1,
          "Pallets.ToDate": 1,
          "Bulks.FromDate": 1,
          "Bulks.ToDate": 1,
          "Bulks.TotalSpace": 1
        }
      }
    ],
    function (err, response) {
      return res.json(response);
    }
  );
});
router.get("/wareDetailById/:id", (req, res) => {
  const wareId = mongoose.Types.ObjectId(req.params.id);
  repository.find({ _id: wareId }, function (err, response) {
    return res.json(response);
  });
});
router.get("/allWareDetailList/:wareId", (req, res) => {
  const wareId = mongoose.Types.ObjectId(req.params.wareId);
  QuoteRepository.aggregate(
    [
      { $match: { WarehouseId: wareId } },

      {
        $lookup: {
          from: "userinformations",
          localField: "UserId",
          foreignField: "_id",
          as: "userData"
        }
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          name: { $concat: ["$userData.FirstName", " ", "$userData.LastName"] },
          email: "$userData.Email",
          StorageType: 1,
          cost: "$TotalCostBreakDown.FinalCost",
          "Pallets.FromDate": 1,
          "Pallets.TotalSpace": 1,
          "Pallets.ToDate": 1
        }
      }
    ],
    function (err, response) {
      return res.json(response);
    }
  );
});

router.get("/getproviderList", (req, res) => {
  const skipCount = parseInt(req.query.pageno);
  const userId = mongoose.Types.ObjectId(req.query.userid);
  UserInformationRepo.aggregate(
    [
      { $match: { _id: userId } },
      {
        $lookup: {
          from: "warehouses",
          localField: "_id",
          foreignField: "UserId",
          as: "data"
        }
      },
      { $unwind: "$data" },

      {
        $lookup: {
          from: "quotes",
          localField: "data._id",
          foreignField: "WarehouseId",
          as: "quotes"
        }
      },
      { $skip: skipCount },
      { $limit: 10 },
      {
        $group: {
          _id: {
            Name: "$data.Name",
            Id: "$data._id",
            revenue: { $sum: "$quotes.TotalCostBreakDown.FinalCost" },
            totalBooked: {
              $size: {
                $filter: {
                  input: "$quotes",
                  as: "quo",
                  cond: { $eq: ["$$quo.Status", 3] }
                }
              }
            }
          }
        }
      }
    ],
    function (err, response) {
      return res.json(response);
    }
  );
});

router.get("/allproviderlist/:userid", (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.userid);
  UserInformationRepo.aggregate(
    [
      { $match: { _id: userId } },
      {
        $lookup: {
          from: "warehouses",
          localField: "_id",
          foreignField: "UserId",
          as: "data"
        }
      },
      { $unwind: "$data" },

      {
        $lookup: {
          from: "quotes",
          localField: "data._id",
          foreignField: "WarehouseId",
          as: "quotes"
        }
      },

      {
        $group: {
          _id: {
            Name: "$data.Name",
            Id: "$data._id",
            revenue: { $sum: "$quotes.TotalCostBreakDown.FinalCost" },
            totalBooked: {
              $size: {
                $filter: {
                  input: "$quotes",
                  as: "quo",
                  cond: { $eq: ["$$quo.Status", 3] }
                }
              }
            }
          }
        }
      }
    ],
    function (err, response) {
      return res.json(response);
    }
  );
});

router.get("/getWarehouseReview", (req, res) => {
  const skipNo = parseInt(req.query.pageNo);
  const wareId = mongoose.Types.ObjectId(req.query.wareId);
  ReviewRepositry.aggregate(
    [{ $match: { WarehouseId: wareId } }, { $skip: skipNo }, { $limit: 10 }],
    function (err, response) {
      return res.json(response);
    }
  );
});

router.get("/deleteReviewById/:Id", (req, res) => {
  const reviewId = mongoose.Types.ObjectId(req.params.Id);
  ReviewRepositry.delete(reviewId, function (err, response) {
    if (err) return res.json("error");
    else return res.json("success");
  });
});
router.get("/allReviewList/:Id", (req, res) => {
  const reviewId = mongoose.Types.ObjectId(req.params.Id);
  ReviewRepositry.find({ WarehouseId: reviewId }, function (err, response) {
    return res.json(response);
    4;
  });
});
router.post("/spaceavailability", (req, res) => {
  const paymentDetail = req.body;
  let wid = mongoose.Types.ObjectId(paymentDetail.WarehouseId);
  repository.get(wid, (error, warehouse) => {
    if (error) {
      return res.json({
        Status: false,
        Message: "Server Error,Please try again"
      });
    }
    if (paymentDetail.IsBulk) {
      if (warehouse[0].Bulk.TotalSpace < paymentDetail.CapacityRequested) {
        return res.json({
          Status: false,
          Message: "Space is no longer available,Please try again"
        });
      }
    } else {
      if (
        parseInt(warehouse[0].Pallet.Total) <
        parseInt(paymentDetail.TotalPalletRequested)
      ) {
        return res.json({
          Status: false,
          Message: "Only " + warehouse[0].Pallet.Total + " are available"
        });
      }
    }
    return res.json({
      Status: true,
      Message: "Space Available"
    });
  });
});

module.exports = router;
