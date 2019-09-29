const express = require("express");
const http = require("https");
const router = express.Router();
const path = require("path");
const ECT = require("ect");
const cheerio = require("cheerio");
const request = require("request");
const VideoRepositry = require("../repositories/video.repository.js");
const FaqRepositry = require("../repositories/faq.repository.js");
const RepositoryPath = path.resolve(
  __dirname,
  "../repositories/user.repository.js"
);
const BlogRepositry = require("../repositories/blog.repository.js");
const TestimonialRepository = require("../repositories/testimonial.repository.js");

const ectRenderer = ECT({
  watch: true,
  root: path.resolve(__dirname, "../views"),
  ext: ".html"
});
const Repository = require(RepositoryPath);
const Security = require("../helper/security.helper.js");

router.get("/", (req, res) => {
  TestimonialRepository.find({}, function (err, response) {
    const data = response;
    const html = ectRenderer.render("home.html", {
      items: data
    });
    res.send(html);
    //   res.render("home.html");
  });
});
router.get("/login", (req, res) => {
  res.render("index.html");
});
router.get("/register", (req, res) => {
  res.render("index.html");
});

router.get("/about-us", (req, res) => {
  res.render("aboutus.html", {
    Title: "About Us | LogistCompare",
    tags: [{ Name: "description", Content: "LogistCompare helps connect organisations with warehouse providers, providing easy and simple booking solutions and seamless communication." }, { Name: "keywords", Content: "about us, compares rates, rent space, visibility, promote, warehouse providers, services, warehouse space, logistics" }]
  });
});

router.get("/solutions", (req, res) => {
  res.render("solutions.html", {
    Title: "Warehouse Marketplace Solutions | LogistCompare ",
    tags: [{ Name: "description", Content: "A one stop warehouse marketplace solution, providing warehouse providers the ability to advertise and rent out their space, and providing organisations, who are looking for space, with an easy and secure booking system." }, { Name: "keywords", Content: "solution, compares rates, quotation, seamless communication, reviews, easy booking system, secure booking system, rent space, visibility, warehouse marketplace solution" }]
  });
});
router.get("/why-us", (req, res) => {
  res.render("whyus.html", {
    Title: "Why Choose Us | LogistCompare",
    tags: [{ Name: "description", Content: "LogistCompare helps customers to find, compare and rent warehouse storage space, while providers can list their space and manage their listings online." }, { Name: "keywords", Content: "why choose us, warehouse storage, warehouse space, providers, promote, services, pallet, logistics" }]
  });
});

router.get("/termsandconditions", (req, res) => {
  res.render("termsandconsitions.html", {
    Title: "Terms and Conditions | LogistCompare",
    tags: [{ Name: "description", Content: "Please read and review our Terms and Conditions carefully, as the following will govern your use of LogistCompare" }, { Name: "keywords", Content: "terms and conditions, terms, accessing, browsing, terms of use, logistics" }]
  });
});
router.get("/policy", (req, res) => {
  res.render("privacypolicy.html", {
    Title: "Privacy Policy | LogistCompare",
    tags: [{ Name: "description", Content: "Take your time to browse our website and read our Privacy Policy where you will find lots of useful information about data use & the information we collect." }, { Name: "keywords", Content: "privacy policy, information, data use" }]
  });
});
router.get("/faq", (req, res) => {

  FaqRepositry.find({ Ispublish: true }, function (err, response) {
    const data = response;
    const html = ectRenderer.render("faq.html", {
      Title: "Frequently Asked Questions (FAQ) | LogistCompare",
      items: data,
      tags: [{ Name: "description", Content: "Frequently asked questions about the LogistCompare warehousing marketplace, services and benefits." }, { Name: "keywords", Content: "Frequently Asked Questions, FAQ, logistics" }]
    });
    res.send(html);
  });

  // var data = {
  //   name: "gourav",
  //   title: "hello",
  //   description: "hiiii how are you"
  // };
});
router.get("/subscribe/", (req, res) => {
  res.render("subscribe.html");
});
router.get("/blog", (req, res) => {
  res.render("index.html", {
    Title: "Warehouse Storage Solution Blog | LogistCompare",
    tags: [
      { Name: "description", Content: "A logistics blog providing insights and tips from top industry experts." },
      { Name: "keywords", Content: "warehouse, storage solutions, blog, logistics, industry experts" }
    ]
  });
});
router.get("/blog/:id", (req, res) => {
  BlogRepositry.find({ UrlDescription: req.params.id }, function (err, response) {
    if (err) return res.status(404).json(404);
    const $ = cheerio.load(response[0].Description.substr(0, 200));
    res.render("index.html", {
      Title: req.params.id.replace("-", " "),
      tags: [
        { Name: "description", Content: $.text() }
      ]
    });
  });

});
router.get("/user/getvideo", (req, res) => {
  VideoRepositry.all(function (err, response) {
    return res.json(response);
  });
});
router.post("/user/subscribe", (req, res) => {
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
router.get("/contact-us", (req, res) => {
  res.render("index.html", {
    Title: "Contact Us | LogistCompare",
    tags: [
      { Name: "description", Content: "If you need any help regarding warehouse space and services, send us your enquiry via a form, email or phone and we'll get back to you." },
      { Name: "keywords", Content: "contact, contact form, contact email, contact phone, warehouse space, logistics, warehouse services" }
    ]
  });
});
router.get("/warehouse/register", (req, res) => {
  res.render("index.html", {
    Title: "Register and List Warehouses | LogistCompare",
    tags: [
      { Name: "description", Content: "Register your warehouse on LogistCompare today to rent out space online and to promote your warehouse services." },
      { Name: "keywords", Content: "register warehouse, list space, warehouse listing, warehouse, warehouse services, logistics" }
    ]
  });
});
router.get("/findspace/register", (req, res) => {
  res.render("index.html", {
    Title: "Find Warehouse Storage Spaces | LogistCompare",
    tags: [
      { Name: "description", Content: "Find the required storage space, location and dates when you need it. By just entering storage specifications; get warehouses options, costs and lot more in just one click. Find your suitable warehouses spaces now!" },
      { Name: "keywords", Content: "warehouses storage spaces, storage spaces" }
    ]
  });
});
router.get("/activateprofile", (req, res) => {
  var Email = Security.Decrypt(req.query.id);
  Repository.find({ Email: Email }, (err, user) => {
    if (err) {
    }
    if (user[0].Status == 0) {
      Repository.updateSelected(
        { Email: Email },
        { Status: 3 },
        (err, user) => {
          if (err) {
            //  res.status(500).json(err)
          }
          return res.redirect("/?status=0");
        }
      );
    } else {
      return res.redirect("/?status=1");
    }
  });
});

module.exports = router;
