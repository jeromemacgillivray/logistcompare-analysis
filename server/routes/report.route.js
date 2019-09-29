const express = require("express");
const router = express.Router();
const QuoteRepository = require("../repositories/quotes.repository.js");
const ReportRepository = require("../repositories/report.repository.js");
const RatingRepository = require("../repositories/review.repository.js");
const WarehouseRepository = require("../repositories/warehouse.repository.js");
const path = require("path");
const Security = require(path.resolve(
  __dirname,
  "./../helper/security.helper.js"
));
const mongoose = require("mongoose");
router.use(function(req, res, next) {
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

router.get("/space", (req, res, next) => {
  const type = req.query.type;
  const userId = mongoose.Types.ObjectId(
    Security.decodeToken(req.headers.accesstoken).Id
  );
  let startdate = new Date();
  let group = {
    month: { $month: "$BookedOn" },
    day: { $dayOfMonth: "$BookedOn" },
    year: { $year: "$BookedOn" }
  };

  let sort = {
    "_id.CreatedDate.month": 1,
    "_id.CreatedDate.day": 1
  };
  if (type.toUpperCase() == "MONTH") {
    startdate.setHours(0, 0, 0, 0);
    startdate.setDate(startdate.getDate() - 30);
  } else if (type.toUpperCase() == "WEEK") {
    startdate.setHours(0, 0, 0, 0);
    startdate.setDate(startdate.getDate() - 7);
  } else if (type.toUpperCase() == "DAY") {
    startdate.setDate(startdate.getDate() - 1);
    group = {
      day: { $hour: "$BookedOn" }
    };

    sort = {
      "_id.CreatedDate.day": 1
    };
  } else if (type.toUpperCase() == "HOUR") {
    startdate.setHours(startdate.getHours() - 1);
    group = {
      day: { $minute: "$BookedOn" },
      month: { $hour: "$BookedOn" }
    };

    sort = {
      "_id.CreatedDate.month": 1,
      "_id.CreatedDate.day": 1
    };
  }

  QuoteRepository.aggregate(
    [
      {
        $match: {
          $and: [
            { CreatedDate: { $gte: startdate } },
            { UserId: userId },
            { Status: 3 }
          ]
        }
      },
      {
        $group: {
          _id: {
            CreatedDate: group
          },
          Space: { $sum: "$TotalCapacity" },
          Date: { $push: "$BookedOn" }
        }
      },
      {
        $sort: sort
      }
    ],
    function(err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

router.get("/list/space", (req, res, next) => {
  const type = req.query.type;
  const userId = mongoose.Types.ObjectId(
    Security.decodeToken(req.headers.accesstoken).Id
  );
  let startdate = new Date();
  let group = {
    month: { $month: "$quotes.CreatedDate" },
    day: { $dayOfMonth: "$quotes.CreatedDate" },
    year: { $year: "$quotes.CreatedDate" }
  };

  let sort = {
    "_id.CreatedDate.month": 1,
    "_id.CreatedDate.day": 1
  };

  if (type.toUpperCase() == "MONTH") {
    startdate.setHours(0, 0, 0, 0);
    startdate.setDate(startdate.getDate() - 30);
  } else if (type.toUpperCase() == "WEEK") {
    startdate.setHours(0, 0, 0, 0);
    startdate.setDate(startdate.getDate() - 7);
  } else if (type.toUpperCase() == "DAY") {
    startdate.setDate(startdate.getDate() - 1);
    group = {
      day: { $hour: "$quotes.CreatedDate" }
    };

    sort = {
      "_id.CreatedDate.day": 1
    };
  } else if (type.toUpperCase() == "HOUR") {
    startdate.setHours(startdate.getHours() - 1);
    group = {
      day: { $minute: "$quotes.CreatedDate" },
      month: { $hour: "$quotes.CreatedDate" }
    };

    sort = {
      "_id.CreatedDate.month": 1,
      "_id.CreatedDate.day": 1
    };
  }

  WarehouseRepository.aggregate(
    [
      {
        $match: {
          $and: [{ UserId: userId }]
        }
      },
      {
        $lookup: {
          from: "quotes",
          localField: "_id",
          foreignField: "WarehouseId",
          as: "quotes"
        }
      },
      {
        $match: { quotes: { $ne: [] } }
      },
      {
        $unwind: "$quotes"
      },
      {
        $match: {
          $and: [
            { "quotes.Status": 3 },
            { "quotes.CreatedDate": { $gte: startdate } }
          ]
        }
      },
      {
        $group: {
          _id: {
            CreatedDate: group,
            Date: "$quotes.CreatedDate"
          },

          Space: { $sum: "$quotes.TotalCapacity" },
          Date: { $push: "$quotes.BookedOn" }
        }
      },
      {
        $sort: sort
      }
    ],
    function(err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

router.get("/revenue", (req, res, next) => {
  const type = req.query.type;
  const userId = mongoose.Types.ObjectId(
    Security.decodeToken(req.headers.accesstoken).Id
  );
  let startdate = new Date();
  let group = {
    month: { $month: "$BookedOn" },
    day: { $dayOfMonth: "$BookedOn" },
    year: { $year: "$BookedOn" }
  };

  let sort = {
    "_id.CreatedDate.month": 1,
    "_id.CreatedDate.day": 1
  };
  if (type.toUpperCase() == "MONTH") {
    startdate.setHours(0, 0, 0, 0);
    startdate.setDate(startdate.getDate() - 30);
  } else if (type.toUpperCase() == "WEEK") {
    startdate.setHours(0, 0, 0, 0);
    startdate.setDate(startdate.getDate() - 7);
  } else if (type.toUpperCase() == "DAY") {
    startdate.setDate(startdate.getDate() - 1);
    group = {
      day: { $hour: "$BookedOn" }
    };

    sort = {
      "_id.CreatedDate.day": 1
    };
  } else if (type.toUpperCase() == "HOUR") {
    startdate.setHours(startdate.getHours() - 1);
    group = {
      day: { $minute: "$BookedOn" },
      month: { $hour: "$BookedOn" }
    };

    sort = {
      "_id.CreatedDate.month": 1,
      "_id.CreatedDate.day": 1
    };
  }
  QuoteRepository.aggregate(
    [
      {
        $match: {
          $and: [
            { BookedOn: { $gte: startdate } },
            { Status: 3 },
            { UserId: userId }
          ]
        }
      },
      {
        $group: {
          _id: {
            CreatedDate: group
          },
          Date: { $push: "$BookedOn" },
          Space: { $sum: "$TotalCostBreakDown.FinalCost" }
        }
      },
      {
        $sort: sort
      }
    ],
    function(err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

router.get("/list/revenue", (req, res, next) => {
  const type = req.query.type;
  const userId = mongoose.Types.ObjectId(
    Security.decodeToken(req.headers.accesstoken).Id
  );
  let startdate = new Date();
  let group = {
    month: { $month: "$quotes.BookedOn" },
    day: { $dayOfMonth: "$quotes.BookedOn" },
    year: { $year: "$quotes.BookedOn" }
  };

  let sort = {
    "_id.CreatedDate.month": 1,
    "_id.CreatedDate.day": 1
  };
  if (type.toUpperCase() == "MONTH") {
    startdate.setHours(0, 0, 0, 0);
    startdate.setDate(startdate.getDate() - 30);
  } else if (type.toUpperCase() == "WEEK") {
    startdate.setHours(0, 0, 0, 0);
    startdate.setDate(startdate.getDate() - 7);
  } else if (type.toUpperCase() == "DAY") {
    startdate.setDate(startdate.getDate() - 1);
    group = {
      day: { $hour: "$quotes.BookedOn" }
    };

    sort = {
      "_id.CreatedDate.day": 1
    };
  } else if (type.toUpperCase() == "HOUR") {
    startdate.setHours(startdate.getHours() - 1);
    group = {
      day: { $minute: "$quotes.BookedOn" },
      month: { $hour: "$quotes.BookedOn" }
    };

    sort = {
      "_id.CreatedDate.month": 1,
      "_id.CreatedDate.day": 1
    };
  }
  WarehouseRepository.aggregate(
    [
      {
        $match: {
          $and: [{ UserId: userId }]
        }
      },
      {
        $lookup: {
          from: "quotes",
          localField: "_id",
          foreignField: "WarehouseId",
          as: "quotes"
        }
      },
      {
        $match: { quotes: { $ne: [] } }
      },
      {
        $unwind: "$quotes"
      },
      {
        $match: {
          $and: [
            { "quotes.Status": 3 },
            { "quotes.CreatedDate": { $gte: startdate } }
          ]
        }
      },
      { $sort: { "quotes.BookedOn": -1 } },
      {
        $group: {
          _id: {
            CreatedDate: group
          },
          Date: { $push: "$quotes.BookedOn" },
          Space: { $sum: "$quotes.TotalCostBreakDown.FinalCost" }
        }
      },
      {
        $sort: sort
      }
    ],
    function(err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

router.get("/rating", (req, res, next) => {
  const type = req.query.type;
  const userId = mongoose.Types.ObjectId(
    Security.decodeToken(req.headers.accesstoken).Id
  );
  let startdate = new Date();
  let group = {
    month: { $month: "$CreateDate" },
    day: { $dayOfMonth: "$CreateDate" },
    year: { $year: "$CreateDate" }
  };

  let sort = {
    "_id.CreatedDate.month": 1,
    "_id.CreatedDate.day": 1
  };
  if (type.toUpperCase() == "MONTH") {
    startdate.setHours(0, 0, 0, 0);
    startdate.setDate(startdate.getDate() - 30);
  } else if (type.toUpperCase() == "WEEK") {
    startdate.setHours(0, 0, 0, 0);
    startdate.setDate(startdate.getDate() - 7);
  } else if (type.toUpperCase() == "DAY") {
    startdate.setDate(startdate.getDate() - 1);
    group = {
      day: { $hour: "$CreateDate" }
    };

    sort = {
      "_id.CreatedDate.day": 1
    };
  } else if (type.toUpperCase() == "HOUR") {
    startdate.setHours(startdate.getHours() - 1);
    group = {
      day: { $minute: "$CreateDate" },
      month: { $hour: "$CreateDate" }
    };

    sort = {
      "_id.CreatedDate.day": 1,
      "_id.CreatedDate.month": 1
    };
  }
  RatingRepository.aggregate(
    [
      {
        $match: {
          $and: [{ CreateDate: { $gte: startdate } }, { UserId: userId }]
        }
      },
      {
        $group: {
          _id: {
            CreatedDate: group
          },
          Date: { $push: "$CreateDate" },
          Space: { $sum: "$Rating" }
        }
      },
      {
        $sort: sort
      }
    ],
    function(err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

router.get("/list/rating", (req, res, next) => {
  const type = req.query.type;
  const userId = mongoose.Types.ObjectId(
    Security.decodeToken(req.headers.accesstoken).Id
  );
  let startdate = new Date();
  let group = {
    month: { $month: "$quotes.CreateDate" },
    day: { $dayOfMonth: "$quotes.CreateDate" },
    year: { $year: "$quotes.CreateDate" }
  };

  let sort = {
    "_id.CreatedDate.month": 1,
    "_id.CreatedDate.day": 1
  };
  if (type.toUpperCase() == "MONTH") {
    startdate.setHours(0, 0, 0, 0);
    startdate.setDate(startdate.getDate() - 30);
  } else if (type.toUpperCase() == "WEEK") {
    startdate.setHours(0, 0, 0, 0);
    startdate.setDate(startdate.getDate() - 7);
  } else if (type.toUpperCase() == "DAY") {
    startdate.setDate(startdate.getDate() - 1);
    group = {
      day: { $hour: "$quotes.CreateDate" }
    };

    sort = {
      "_id.CreatedDate.day": 1
    };
  } else if (type.toUpperCase() == "HOUR") {
    startdate.setHours(startdate.getHours() - 1);
    group = {
      day: { $minute: "$quotes.CreateDate" },
      month: { $hour: "$quotes.CreateDate" }
    };

    sort = {
      "_id.CreatedDate.day": 1,
      "_id.CreatedDate.month": 1
    };
  }
  WarehouseRepository.aggregate(
    [
      {
        $match: {
          $and: [{ UserId: userId }]
        }
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "WarehouseId",
          as: "quotes"
        }
      },
      {
        $match: { quotes: { $ne: [] } }
      },
      {
        $unwind: "$quotes"
      },
      {
        $match: { "quotes.CreateDate": { $gte: startdate } }
      },
      {
        $group: {
          _id: {
            CreatedDate: group
          },
          Date: { $push: "$quotes.CreateDate" },
          Space: { $sum: "$quotes.Rating" }
        }
      },
      {
        $sort: sort
      }
    ],
    function(err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

router.post("/save", (req, res, next) => {
  const userId = mongoose.Types.ObjectId(
    Security.decodeToken(req.headers.accesstoken).Id
  );
  const data = req.body;
  data.UserId = userId;
  ReportRepository.save(data, (err, response) => {
    if (err) next(err);

    return res.status(200).json(response);
  });
});

router.get("/get", (req, res, next) => {
  const query = {
    UserId: mongoose.Types.ObjectId(
      Security.decodeToken(req.headers.accesstoken).Id
    ),
    Type: req.query.type
  };

  ReportRepository.find(query, (err, response) => {
    if (err) next(err);
    return res.status(200).json(response);
  });
});
module.exports = router;
