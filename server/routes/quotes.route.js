const express = require("express");
const router = express.Router();
const QuoteRepository = require("../repositories/quotes.repository.js");
const UserRepository = require("../repositories/user.repository.js");
const WarehouseRepository = require("../repositories/warehouse.repository.js");
const notificationRepo = require("../repositories/notification.repository.js");
const path = require("path");

const Security = require(path.resolve(
  __dirname,
  "./../helper/security.helper.js"
));
const EmailHelper = require(path.resolve(
  __dirname,
  "./../helper/email.helper.js"
));
const mongoose = require("mongoose");
//Authrize Request
router.use(function (req, res, next) {
  Security.VerifyToken(req.headers.accesstoken, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        Status: false,
        Message: "Session Expired"
      });
    }
    next();
  });
});

router.post("/addquote", (req, res, next) => {
  let quote = req.body;
  if (!quote.IsBulk) {
    quote.StorageType = "Pallet";
    // quote.Pallets.push(quote.Pallet);
  } else {
    quote.StorageType = "Bulk";
    // quote.Bulks.push(quote.Bulk);
  }
  QuoteRepository.save(quote, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.json({
      status: true,
      Message: "Success",
      Id: response._id
    });
  });
});

router.get("/getitems", (req, res, next) => {
  let quoteId = req.query.id;
  let CardStatus = false;
  const userId = Security.decodeToken(req.headers.accesstoken).Id;
  UserRepository.find(
    { _id: userId, CardId: { $exists: true } },
    (err, user) => {
      if (err) {
      }
      if (user.length > 0) {
        CardStatus = true;
      }
      QuoteRepository.get({ _id: quoteId }, (error, response) => {
        if (error) {
        }
        return res.json({
          status: true,
          quote: response[0],
          CardStatus: CardStatus
        });
      });
    }
  );
});
router.post("/updatequote", (req, res, next) => {
  let quote = req.body;
  // if (!quote.IsBulk) {
  //   quote.Pallets.push(quote.Pallet);
  // } else quote.Bulks.push(quote.Bulk);
  QuoteRepository.get(quote.QuoteId, (error, response) => {
    if (error) {
    }
    quote._id = response[0]._id;
    QuoteRepository.update(quote, (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.json({
        status: true,
        Message: "Updated",
        pallets: data.Pallets,
        bulks: data.Bulks
      });
    });
  });
});

router.post("/removecategory", (req, res, next) => {
  let quote = req.body;
  QuoteRepository.get(quote.QuoteId, (error, response) => {
    if (error) {
      return res.json({
        status: false,
        Message: "Server Error,Please try again"
      });
    }
    quote._id = response[0]._id;
    QuoteRepository.update(quote, (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.json({
        status: true,
        Message: "success",
        pallets: data.Pallets,
        bulks: data.Bulks
      });
    });
  });
});
router.post("/updatecategory", (req, res, next) => {
  let quote = req.body;
  QuoteRepository.get(quote.QuoteId, (error, response) => {
    if (error) {
      return res.json({
        status: false,
        Message: "Server Error,Please try again"
      });
    }
    quote._id = response[0]._id;
    QuoteRepository.update(quote, (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.json({
        status: true,
        Message: "success",
        pallets: data.Pallets,
        bulks: data.Bulks
      });
    });
  });
});
router.post("/getquotes", (req, res, next) => {
  let quote = req.body;
  const userDetail = Security.decodeToken(req.headers.accesstoken);
  try {
    QuoteRepository.get(quote.QuoteId, (error, response) => {
      if (error) {
        return res.json({
          status: false,
          Message: "Server Error,Please try again"
        });
      }
      // Quote = response[0];
      // Quote.BookedOn = Date.now();
      // Quote.TotalCapacity = quote.TotalCapacity;
      // Quote.Status = quote.Status;
      quote._id = response[0]._id;
      quote.ExtraServices=response[0].ExtraServices;
      quote.ExtraSecurity=response[0].ExtraSecurity;
      quote.ExtraWarehouseType=response[0].ExtraWarehouseType;
      quote.Otherserviceone=response[0].Otherserviceone;
      quote.Otherservicetwo=response[0].Otherservicetwo;
      quote.BookedOn = Date.now();
      QuoteRepository.update(quote, (err, data) => {
        if (err) {
          return res.json({
            status: false,
            Message: "Server Error,Please try again"
          });
        }
        const notificationModel = {
          UserId: mongoose.Types.ObjectId(quote.WarehouseDetail.UserId),
          Text: quote.Status == 1 ? "Quotes Request" : "Quotes Request Again",
          Type: "Quotes",
          TypeId: quote._id,
          Sender: {
            Id: userDetail.Id,
            Name: userDetail.FirstName + " " + userDetail.LastName,
            Image: userDetail.ProfilePicture
          },
          Status: 0
        };
        UserRepository.findOne(
          { _id: mongoose.Types.ObjectId(quote.WarehouseDetail.UserId) },
          (error, response) => {
            if (!error) {
              EmailHelper.GetQuoteMail(
                userDetail.FirstName + " " + userDetail.LastName,
                response.Email,
                quote._id
              );
              var mailData = {
                senderName: userDetail.FirstName + " " + userDetail.LastName,
                receiverName: response.FirstName + " " + response.LastName,
                senderEmail: userDetail.Email,
                receiverEmail: response.Email,
                warehouseName: quote.WarehouseDetail.Name,
                city : quote.WarehouseDetail.City
              }
              EmailHelper.GetQuoteMailToAdmin(mailData);
            }
          }
        );
        notificationRepo.save(notificationModel, (er, rs) => { });
        return res.json({
          status: true,
          Message:
            "Booking form has been sent for quotation to provider"
        });
      });
    });
  } catch (ex) {
    return res.status(500).json(err);
  }
});

router.get("/all", (req, res, next) => {
  const userid = mongoose.Types.ObjectId(
    Security.decodeToken(req.headers.accesstoken).Id
  );
  QuoteRepository.aggregate(
    [
      {
        $match: {
          $and: [{ UserId: userid }],
          $or: [{ Status: 1 }, { Status: 2 }, { Status: 5 }]
        }
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "WarehouseId",
          foreignField: "_id",
          as: "warehouse_detail"
        }
      },
      {
        $sort: { BookedOn: -1 }
      },
      { $unwind: "$warehouse_detail" }
    ],
    function (err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});
router.get("/search", (req, res, next) => {
  const userid = mongoose.Types.ObjectId(
    Security.decodeToken(req.headers.accesstoken).Id
  );
  let query = {};
  if (req.query.fd && req.query.td) {
    query = {
      ModifiedDate: { $gte: new Date(req.query.fd) },
      ModifiedDate: { $lte: new Date(req.query.td) }
    };
  }

  QuoteRepository.aggregate(
    [
      {
        $match: {
          $and: [
            { UserId: userid },
            { Status: { $gt: 0 } },
            { Status: { $lt: 3 } },
            query
          ]
        }
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "WarehouseId",
          foreignField: "_id",
          as: "warehouse_detail"
        }
      },
      { $unwind: "$warehouse_detail" },
      {
        $match: {
          "warehouse_detail.Name": { $regex: req.query.name, $options: "i" }
        }
      }
    ],
    function (err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});
router.get("/getrequestedusers", (req, res, next) => {
  const userid = mongoose.Types.ObjectId(
    Security.decodeToken(req.headers.accesstoken).Id
  );
  WarehouseRepository.aggregate(
    [
      { $match: { UserId: userid } },
      {
        $lookup: {
          from: "quotes",
          localField: "_id",
          foreignField: "WarehouseId",
          as: "QuotesRequested"
        }
      },
      {
        $match: { QuotesRequested: { $ne: [] } }
      },
      {
        $unwind: {
          path: "$QuotesRequested",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { "QuotesRequested.BookedOn": -1 }
      },
      {
        $lookup: {
          from: "userinformations",
          localField: "QuotesRequested.UserId",
          foreignField: "_id",
          as: "Userinfo"
        }
      },
      {
        $unwind: {
          path: "$Userinfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          Name: 1,
          QuotesRequested: 1,
          "QuoteRequested.BookedOn": 1,
          "QuoteRequested.Status": 1,
          "Userinfo.FirstName": 1,
          "Userinfo.LastName": 1,
          "Userinfo._id": 1,
          "Userinfo.ProfilePicture": 1
        }
      }
    ],
    function (err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

router.post("/sendcategoryprice", (req, res, next) => {
  let quote = req.body;

  QuoteRepository.get(quote.QuoteId, (error, response) => {
    if (error) {
      return res.json({
        status: false,
        Message: "Server Error,Please try again"
      });
    }
    quote._id = response[0]._id;
    QuoteRepository.update(quote, (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }

      return res.json({
        status: true,
        Message: "success",
        pallets: data.Pallets,
        bulks: data.Bulks
      });
    });
  });
});

router.get("/getbooking/:status", (req, res) => {
  const status = parseInt(req.params.status);
  const userid = mongoose.Types.ObjectId(
    Security.decodeToken(req.headers.accesstoken).Id
  );
  //const userid = Security.decodeToken(req.headers.accesstoken).Id;
  WarehouseRepository.aggregate(
    [
      { $match: { UserId: userid } },

      {
        $lookup: {
          from: "quotes",
          localField: "_id",
          foreignField: "WarehouseId",
          as: "QuotesRequested"
        }
      },
      {
        $unwind: {
          path: "$QuotesRequested",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $match: {
          "QuotesRequested.Status": status
        }
      },
      {
        $sort: { "QuotesRequested.BookedOn": -1 }
      },
      {
        $lookup: {
          from: "userinformations",
          localField: "QuotesRequested.UserId",
          foreignField: "_id",
          as: "Userinfo"
        }
      },

      {
        $unwind: {
          path: "$Userinfo",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $project: {
          _id: 1,
          Name: 1,
          AvgReviews: 1,
          QuotesRequested: 1,
          "QuoteRequested.BookedOn": 1,
          "QuoteRequested.Status": 1,
          "Userinfo.FirstName": 1,
          "Userinfo.LastName": 1,
          "Userinfo._id": 1,
          "Userinfo.ProfilePicture": 1
        }
      }
    ],
    function (err, result) {
      if (err) {
        next(err);
      } else {
        return res.json(result);
      }
    }
  );
});

router.post("/sendquotes", (req, res, next) => {
  let quote = req.body;
  const oldStatus = req.body.Status;
  quote.Status = 2;
  const userDetail = Security.decodeToken(req.headers.accesstoken);
  try {
    QuoteRepository.get(quote.QuoteId, (error, response) => {
      if (error) {
        return res.json({
          status: false,
          Message: "Server Error,Please try again"
        });
      }
      quote._id = response[0]._id;
      quote.BookedOn = Date.now();
      // var currentDate = new Date();
      // quote.QuoteValidTill = currentDate.setDate(
      //   currentDate.getDate() + parseInt(quote.QuoteValidDays)
      // );
      QuoteRepository.update(quote, (err, data) => {
        if (err) {
          return res.json({
            status: false,
            Message: "Server Error,Please try again"
          });
        }

        const notificationModel = {
          UserId: quote.UserId,
          Text:
            oldStatus == 1
              ? "Quotes Sent by provider"
              : "Quotes Re-Send by provider",
          Type: "Quotes",
          TypeId: quote._id,
          Sender: {
            Id: userDetail.Id,
            Name: userDetail.FirstName + " " + userDetail.LastName,
            Image: userDetail.ProfilePicture
          },
          Status: 0
        };
        UserRepository.findOne(
          { _id: mongoose.Types.ObjectId(quote.UserId) },
          (error, response) => {
            if (!error) {
              EmailHelper.SendQuoteMail(
                userDetail.FirstName + " " + userDetail.LastName,
                response.Email,
                quote._id
              );
              var mailData = {
                senderName: userDetail.FirstName + " " + userDetail.LastName,
                receiverName: response.FirstName + " " + response.LastName,
                senderEmail: userDetail.Email,
                receiverEmail: response.Email
              }
              EmailHelper.SendQuoteMailToAdmin(mailData);
            }
          }
        );
        notificationRepo.save(notificationModel, (er, rs) => { });
        return res.json({
          status: true,
          Message: "Quotes send to customer successfully"
        });
      });
    });
  } catch (ex) {
    return res.status(500).json(err);
  }
});

router.get("/completepayment", (req, res, next) => {
  let quoteId = req.query.id;
  const userDetail = Security.decodeToken(req.headers.accesstoken);
  QuoteRepository.get({ _id: quoteId }, (error, response) => {
    if (error) {
    }
    if (response.length > 0) {
      let Quote = response[0];
      Quote.Status = 3;
      Quote.ModifiedDate = Date.now();
      QuoteRepository.update(Quote, (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        WarehouseRepository.get(Quote.WarehouseId, (err, warehouse) => {
          if (err) res.status(500).json(err);

          const notificationModel = {
            UserId: warehouse[0].UserId,
            Text: "Quotes Payment Completed",
            Type: "Payment",
            TypeId: Quote._id,
            Sender: {
              Id: userDetail.Id,
              Name: userDetail.FirstName + " " + userDetail.LastName,
              Image: userDetail.ProfilePicture
            },
            Status: 0
          };
          notificationRepo.save(notificationModel, (er, rs) => { });
        });
        return res.json("Payment Completed Successfully");
        // return res.json({
        //   status: true,
        //   Message: "Payment Completed Successfully"
        // });
      });
    } else {
      return res.json({
        status: false,
        Message: "Server Error,Please try again"
      });
    }
  });
});

router.get("/getuserbookings", (req, res, next) => {
  const status = parseInt(req.params.status);
  const userid = mongoose.Types.ObjectId(
    Security.decodeToken(req.headers.accesstoken).Id
  );

  let query = {};
  if (req.query.fd && req.query.td) {
    query = {
      $and: [
        { BookedOn: { $gte: new Date(req.query.fd) } },
        { BookedOn: { $lte: new Date(req.query.td) } }
      ]
    };
  }

  let querylist = [
    { $match: { $and: [{ UserId: userid }, { Status: { $eq: 3 } }, query] } },

    {
      $lookup: {
        from: "warehouses",
        localField: "WarehouseId",
        foreignField: "_id",
        as: "WarehouseDetail"
      }
    },
    {
      $unwind: {
        path: "$WarehouseDetail",
        preserveNullAndEmptyArrays: true
      }
    }
  ];

  if (req.query.name) {
    querylist.push({
      $match: {
        "WarehouseDetail.Name": { $regex: req.query.name, $options: "i" }
      }
    });
  }
  QuoteRepository.aggregate(querylist, function (err, result) {
    if (err) {
      next(err);
    } else {
      return res.json(result);
    }
  });
});

router.get("/bookspace", (req, res, next) => {
  let quoteID = mongoose.Types.ObjectId(req.query.id);
  const userDetail = Security.decodeToken(req.headers.accesstoken);
  try {
    QuoteRepository.get(quoteID, (error, response) => {
      if (error) {
        return res.json({
          status: false,
          Message: "Server Error,Please try again"
        });
      }
      let quote = response[0];
      WarehouseRepository.get(quote.WarehouseId, (error, warehouse) => {
        if (error) {
        }
        if (warehouse.length > 0) {
          let warehouseDetail = warehouse[0];
          if (quote.IsBulk) {
            if (warehouseDetail.CapacityType == "Feet") {
              warehouseDetail.AvailableSpace = parseFloat(
                parseFloat(
                  parseFloat(warehouseDetail.AvailableSpace) * 10.7639
                ).toFixed(2) - parseFloat(quote.TotalCapacity)
              ).toFixed(2);
              warehouseDetail.AvailableSpace = parseFloat(
                parseFloat(warehouseDetail.AvailableSpace) / 10.7639
              ).toFixed(2);
              warehouseDetail.Bulk.TotalSpace = parseFloat(
                parseFloat(
                  parseFloat(warehouseDetail.Bulk.TotalSpace) * 10.7639
                ).toFixed(2) - parseFloat(quote.TotalCapacity)
              ).toFixed(2);
            } else {
              warehouseDetail.AvailableSpace = parseFloat(
                parseFloat(warehouseDetail.AvailableSpace) -
                parseFloat(quote.TotalCapacity)
              ).toFixed(2);
              warehouseDetail.Bulk.TotalSpace = parseFloat(
                parseFloat(warehouseDetail.Bulk.TotalSpace) -
                parseFloat(quote.TotalCapacity)
              ).toFixed(2);
            }
          } else {
            let totalPalletsRequested = 0;
            quote.Pallets.map((x, i) => {
              totalPalletsRequested += parseInt(x.TotalPallets);
            });
            if (warehouseDetail.CapacityType == "Feet") {
              let availableSpace =
                parseFloat(warehouseDetail.AvailableSpace) * 10.7639;
              warehouseDetail.AvailableSpace = parseFloat(
                availableSpace - parseFloat(quote.TotalCapacity)
              ).toFixed(2);
              warehouseDetail.AvailableSpace = parseFloat(
                parseFloat(warehouseDetail.AvailableSpace) / 10.7639
              ).toFixed(2);
            } else {
              let availableSpace = parseFloat(warehouseDetail.AvailableSpace);
              warehouseDetail.AvailableSpace = parseFloat(
                availableSpace - parseFloat(quote.TotalCapacity)
              ).toFixed(2);
            }
            warehouseDetail.Pallet.Total =
              parseFloat(warehouseDetail.Pallet.Total) - totalPalletsRequested;
          }
          UserRepository.findOne(
            { _id: mongoose.Types.ObjectId(warehouse[0].UserId) },
            (error, response) => {
              if (!error) {
                EmailHelper.SendPaymentMail(
                  userDetail.FirstName + " " + userDetail.LastName,
                  response.Email
                );
                var mailData = {
                  senderName: userDetail.FirstName + " " + userDetail.LastName,
                  senderEmail: userDetail.Email,
                  receiverName: response.FirstName + " " + response.LastName,
                  receiverEmail: response.Email,
                  amount: quote.TotalCostBreakDown.FinalCost
                }
                EmailHelper.SendPaymentMailToAdmin(mailData);
              }
            }
          );
          WarehouseRepository.update(warehouseDetail, (error, response) => {
            if (error) {
              return res.status(500).json(error);
            }
          });
        }
      });
    });
  } catch (ex) {
    return res.status(500).json(ex);
  }
});
module.exports = router;
