const express = require("express");
const router = express.Router();
const ContactUsRepository = require("../repositories/contactus.repository.js");
const path = require("path");
const Security = require(path.resolve(
  __dirname,
  "./../helper/security.helper.js"
));
const EmailHelper = require(path.resolve(
  __dirname,
  "./../helper/email.helper.js"
));
router.post("/save", (req, res) => {
  try {
    const userDetail = Security.decodeToken(req.headers.accesstoken);
    const message = req.body;
    ContactUsRepository.save(message, (error, response) => {
      if (error) {
        console.log(error);
        return res.json({
          Status: false,
          Message: "Server Error,Please try again"
        });
      }
      const data = {
        UserName: message.Name,
        Type: userDetail == null ? "Buyer" : userDetail.Type ? userDetail.Type : "Buyer"
      };
      EmailHelper.SendCountactUsMail(data.UserName, data.Type);
      return res.status(200).json({
        Status: true,
        Message: "Message sent Successfully"
      });
    });
  } catch (error) {
    return res.json({
      status: false,
      Message: "Server Error,Please try again"
    });
  }
});
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
router.get("/getmessage", (req, res, next) => {
  let totalCount = 0;
  let skipcount = (parseInt(req.query.pageno) - 1) * 10;
  ContactUsRepository.count({}, (err, count) => {
    if (err) {
      totalCount = 0;
    } else {
      totalCount = count;
    }
    ContactUsRepository.all(parseInt(skipcount), (err, response) => {
      if (err) next(err);

      return res.status(200).json({
        Count: totalCount,
        messages: response
      });
    });
  });
});
router.get("/count", (req, res, next) => {
  ContactUsRepository.count((err, response) => {
    if (err) next(err);
    return res.status(200).json(response);
  });
});
router.get("/delete", (req, res, next) => {
  ContactUsRepository.delete(req.query.id, (err, response) => {
    if (err) next(err);
    return res.status(200).json({
      status: true,
      Message: "Message removed Successfully"
    });
  });
});
module.exports = router;
