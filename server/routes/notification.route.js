const express = require("express");
const router = express.Router();
const Repository = require("../repositories/notification.repository.js");
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

router.post("/save", (req, res, next) => {
  const Sender = Security.decodeToken(req.headers.accesstoken);

  const data = {
    // ...req.body,
    Sender: {
      Id: Sender.Id,
      Name: Sender.FirstName + " " + Sender.LastName,
      Image: Sender.ProfilePicture
    }
  };

  Repository.save(data, (err, response) => {
    if (err) next(err);

    return res.status(200).json(response);
  });
});

router.get("/get", (req, res, next) => {
  const query = {
    UserId: mongoose.Types.ObjectId(
      Security.decodeToken(req.headers.accesstoken).Id
    ),
    skip: parseInt(req.query.skip)
  };

  Repository.findAll(query, (err, response) => {
    if (err) next(err);
    else {
      Repository.UpdateStatus(query.UserId, (err, data) => {
        console.log(err);
        console.log(data);
      });
      return res.status(200).json(response);
    }
  });
});

router.get("/count", (req, res, next) => {
  const query = {
    UserId: mongoose.Types.ObjectId(
      Security.decodeToken(req.headers.accesstoken).Id
    )
  };

  Repository.getCount(query.UserId, (err, response) => {
    if (err) next(err);
    return res.status(200).json(response);
  });
});
module.exports = router;
