const express = require("express");
const router = express.Router();
const path = require("path");
const repositoryPath = path.resolve(
  __dirname,
  "../repositories/search.repository.js"
);
const repository = require(repositoryPath);
const security = require(path.resolve(
  __dirname,
  "./../helper/security.helper.js"
));
const ObjectId = require("mongoose").Types.ObjectId;
const WarehouseRepository = require("../repositories/warehouse.repository.js");
router.use(function (req, res, next) {
  security.VerifyToken(req.headers.accesstoken, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        Status: false,
        Message: "Session Expired"
      });
    }
    next();
  });
});
router.post("/save", (req, res) => {
  const userid = security.decodeToken(req.headers.accesstoken).Id;
  const search = req.body;
  search.UserId = new ObjectId(userid);
  repository.find(search, (err, data) => {
    if (err) return res.status(500).json(error);

    if (data.length < 1) {
      repository.save(search, (error, response) => {
        if (error) {
          return res.status(500).json(error);
        }
        return res.json(response);
      });
    } else {
      return res
        .status(520)
        .json({ Message: "this warehouse already exist in search" });
    }
  });
});

router.post("/update", (req, res) => {
  const search = req.body;
  repository.update(search, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.json(response);
  });
});

router.get("/get/:id", (req, res) => {
  repository.get(req.params.id, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.json(response[0]);
  });
});

router.get("/delete/:id", (req, res) => {
  repository.delete(req.params.id, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.json(response[0]);
  });
});

router.get("/all", (req, res) => {
  const userid = security.decodeToken(req.headers.accesstoken).Id;
  repository.aggregate(
    [
      { $match: { UserId: new ObjectId(userid) } },
      {
        $lookup: {
          from: "warehouses",
          localField: "WarehouseId",
          foreignField: "_id",
          as: "warehouse_detail"
        }
      },
      {
        $sort: { CreatedDate: -1 }
      }
    ],
    function (err, result) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json(result);
      }
    }
  );
});

router.get("/find", (req, res) => {
  const query = {};
  repository.find(query, (error, response) => {
    return res.status(200).json(response);
  });
});

router.get("/getactivities", (req, res) => {
  const userid = security.decodeToken(req.headers.accesstoken).Id;
  WarehouseRepository.aggregate(
    [
      { $match: { UserId: new ObjectId(userid) } },

      {
        $lookup: {
          from: "searches",
          localField: "_id",
          foreignField: "WarehouseId",
          as: "Customers"
        }
      },
      {
        $match: { Customers: { $ne: [] } }
      },
      {
        $unwind: {
          path: "$Customers",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "userinformations",
          localField: "Customers.UserId",
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
          "Customers.CreatedDate": 1,
          "Userinfo.FirstName": 1,
          "Userinfo.LastName": 1,
          "Userinfo._id": 1,
          "Userinfo.ProfilePicture": 1
        }
      },
      {
        $sort: { "Customers.CreatedDate": -1 }
      }
    ],
    function (err, result) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json(result.filter(x => x.Userinfo));
      }
    }
  );
});
module.exports = router;
