const express = require("express");
const router = express.Router();
const Repository = require("../repositories/testimonial.repository.js");


router.post("/save", (req, res) => {
  const data = req.body;
  Repository.save(data, (err, response) => {
    if (err) return res.status(400).json(err);
    return res.status(200).json(response);
  });
});

router.get("/all", (req, res) => {
  const data = req.query;
  Repository.all(data, (err, response) => {
    if (err) return res.status(400).json(err);
    return res.status(200).json(response);
  });
});

router.post("/update", (req, res) => {
  const data = req.body;
  Repository.save(data, (err, response) => {
    if (err) return res.status(400).json(err);
    return res.status(200).json(response);
  });
});
router.get("/get/:id", (req, res) => {
  Repository.get(req.params.id, (err, response) => {
    if (err) return res.status(400).json(err);
    return res.status(200).json(response);
  });
});
router.get("/delete/:id", (req, res) => {
  Repository.delete(req.params.id, (err, response) => {
    if (err) return res.status(400).json(err);
    return res.status(200).json(response);
  });
});

router.post("/uploadimage", (req, res) => {
  const obj = {
    file: req.files.image,
    name: req.body.name
  };
  Repository.uploadImage(obj, (err, response) => {
    if (err) {
      console.log(err);
      return res.status(400).json(err);
    }
    res.send(response);
  });
});

module.exports = router;
