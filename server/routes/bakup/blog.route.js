const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const BlogRepositry = require("../repositories/blog.repository.js");
const path = require("path");
const ECT = require("ect");
const ectRenderer = ECT({
  watch: true,
  root: path.resolve(__dirname, "../views"),
  ext: ".html"
});

router.get("/getBlogById/:Id", (req, res) => {
  //const Id = mongoose.Types.ObjectId(req.params.Id);
  BlogRepositry.find({ UrlDescription: req.params.Id }, function (err, response) {
    if (err) return res.json(400);
    return res.json(response);
  });
});

router.get("/getAllBlogList", (req, res) => {
  BlogRepositry.all(function (err, response) {
    return res.json(response)
  });
});

router.get("/blockLIstBypage/:skipNo", (req, res) => {
  const skipNo = parseInt(req.params.skipNo);
  BlogRepositry.aggregate(
    [{ $sort: { CreatedDate: -1 } }, { $skip: skipNo }, { $limit: 3 }],
    function (err, response) {
      if (err) return res.json(response);
      return res.json({
        blogs: response
      });
    }
  );
});
module.exports = router;
