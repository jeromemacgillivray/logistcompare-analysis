const express = require("express");
const router = express.Router();
const path = require("path");
const request = require("request");
const fs = require("fs");
const cheerio = require("cheerio");
const UserRepository = require("../repositories/user.repository.js");
const Security = require(path.resolve(
  __dirname,
  "./../helper/security.helper.js"
));
const pathFile = path.resolve(__dirname, "../views");
const publicPath = path.resolve(__dirname, "../../public/BackgroundImages/");

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
router.get("/getcontent", (req, res) => {
  let htmlData = "";
  let fileName = "";
  switch (req.query.page) {
    case "Solution":
      fileName = "solutions.html";
      break;
    case "Why Us":
      fileName = "whyus.html";
      break;
    case "About Us":
      fileName = "aboutus.html";
      break;
    case "Privacy Policy":
      fileName = "privacypolicy.html";
      break;
    case "Terms and Conditions":
      fileName = "termsandconsitions.html";
      break;
  }
  fs.readFile(pathFile + "/" + fileName, "utf8", function(err, data) {
    if (err) throw err;
    const $ = cheerio.load(data);
    htmlData = $(".aboutus_wrapper").html();
    return res.json({
      Status: true,
      Content: htmlData
    });
  });
});

router.post("/updatecontent", (req, res) => {
  try {
    const htmlData = req.body;
    let fileName = "";
    switch (req.query.page) {
      case "Solution":
        fileName = "solutions.html";
        break;
      case "Why Us":
        fileName = "whyus.html";
        break;
      case "About Us":
        fileName = "aboutus.html";
        break;
      case "Privacy Policy":
        fileName = "privacypolicy.html";
        break;
      case "Terms and Conditions":
        fileName = "termsandconsitions.html";
        break;
    }
    fs.readFile(pathFile + "/" + fileName, "utf8", function(err, data) {
      if (err) throw err;
      const $ = cheerio.load(data);
      $(".aboutus_wrapper").html(htmlData.Content);
      $("#MainWarpper").css(
        "background",
        "url(../BackgroundImages/" +
          htmlData.Image +
          ") no-repeat center center fixed;"
      );
      var newContent = $("#MainWarpper").parent().html();
      newContent = newContent
        .replace(
          "&lt;% extend &apos;layout&apos; %&gt;",
          "<% extend 'layout' %>"
        )
        .replace("&lt;% end %&gt;", "<% end %>");
      fs.writeFile(pathFile + "/" + fileName, newContent, "utf8", function(
        err
      ) {
        if (err) throw err;
        return res.json({
          Status: true,
          Content: htmlData
        });
      });
    });
  } catch (err) {
    throw err;
  }
});

//upload background image
router.post("/uploadbackgroundimage", (req, res) => {
  const obj = {
    file: req.files.image
  };
  UserRepository.uploadBackGroundImage(obj, (err, response) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.send(response);
  });
});
router.post("/removeimage", (req, res) => {
  const fileName = req.body;
  fs.unlink(publicPath + fileName, err => {
    if (err) throw err;
    return res.json({
      Status: true,
      BackgroundImage: "banner_logist.jpg"
    });
  });
});

module.exports = router;
