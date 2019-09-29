const express = require("express");
const router = express.Router();
const UserRepository = require("../repositories/user.repository.js");
const QuotesRepository = require("../repositories/quotes.repository.js");
const RatingRepository = require("../repositories/review.repository.js");
router.get("/users", (req, res) => {
  UserRepository.adminUsersReport(req.query, (err, response) => {
    if (err) return res.status(400).json(err);
    return res.status(200).json(response);
  });
});

router.get("/revenue", (req, res) => {
  QuotesRepository.adminRevenueReport(req.query, (err, response) => {
    if (err) return res.status(400).json(err);
    return res.status(200).json(response);
  });
});

router.get("/rating", (req, res) => {
  RatingRepository.ratingReportAdmin(req.query, (err, response) => {
    if (err) return res.status(400).json(err);
    return res.status(200).json(response);
  });
});
module.exports = router;
