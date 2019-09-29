const express = require("express");
const router = express.Router();
const request = require("request");

router.get("/all", (req, res) => {
  const pageNo = parseInt(req.query.pageno);
  const offset = (pageNo - 1) * 10;
  const count = 10;
  const options = {
    url:
      "https://us16.api.mailchimp.com/3.0/lists/7cc56503a2/members?offset=" +
      offset +
      "&count=" +
      count,
    method: "GET",
    headers: {
      Authorization:
        "Basic YW55OjRlYTJlMzhmOTc5MmM2N2Q4MjZlOGI0ZWFmZTI5NzU0LXVzMTY="
    }
  };

  request.get(options, (err, r) => {
    if (err) return res.status(400).json(err);
    else return res.status(200).json(r);
  });
});
router.post("/subscribe", (req, res) => {
  const subscribeData = JSON.stringify(req.body);

  const options = {
    url: "https://us16.api.mailchimp.com/3.0/lists/7cc56503a2/members",
    method: "POST",
    headers: {
      Authorization:
        "Basic YW55OjRlYTJlMzhmOTc5MmM2N2Q4MjZlOGI0ZWFmZTI5NzU0LXVzMTY="
    },
    form: subscribeData
  };

  request.post(options, (err, r, body) => {
    if (err) return res.status(400).json("Subscription failed");
    const _body = JSON.parse(body);
    if (_body.id) return res.status(200).json("Subscription success");
    else return res.status(400).json(_body.detail);
  });
});

module.exports = router;
