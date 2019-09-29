//Dependecies
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const ECT = require("ect");
const fileUpload = require("express-fileupload");
const appConfig = require("./app.config");
//Server Routes
const warehouseRouter = require("./routes/warehouse.route.js");
const staticRoutes = require("./routes/staticpages.route.js");
const UserRouter = require("./routes/user.route.js");
const ContactRouter = require("./routes/contactus.route.js");
const MessageRouter = require("./routes/message.route.js");
const quoteRouter = require("./routes/quotes.route.js");
const searchRouter = require("./routes/search.route.js");
const stripeRouter = require("./routes/stripe.route.js");
const reportRouter = require("./routes/report.route.js");
const reportAdminRouter = require("./routes/adminReport.route.js");
const testimonialAdminRouter = require("./routes/testimonial.route.js");
const notificationtRouter = require("./routes/notification.route.js");
const newsLetterRouter = require("./routes/newsLetter.route.js");
const ContentManager = require("./routes/content.route.js");
const BlogsRouter = require("./routes/blog.route.js");
const MangoPayRouter = require("./routes/mangoPay.route.js");
const SubscriptionRouter = require("./routes/subscription.route.js");
const WarehouseRequestRouter = require("./routes/warehouserequest.route");
const app = express();

// paths
const publicPath = path.resolve(__dirname, "../public");
const viewsFolderPath = {
  root: path.resolve(__dirname, "./views")
};
const staticFolderPath = path.resolve(__dirname, "../bin");
//Service
const PaymentService = require("./helper/PaymentService.js");
//view engine
const ectRenderer = ECT({
  watch: true,
  root: path.resolve(__dirname, "./views"),
  ext: ".html"
});
app.set("view engine", "ect");

app.engine("html", ectRenderer.render);

app.set("views", viewsFolderPath.root);

app.use(
  bodyParser.urlencoded({
    limit: "200mb",
    extended: true
  })
);
app.use(function (req, res, next) {
  res.setHeader("Cache-Control", "no-cache");
  next();
});
app.use(bodyParser.json({ limit: "200mb" }));
app.use(fileUpload());
app.use(express.static(publicPath));
app.use(express.static(staticFolderPath));

//register routes
app.use("/", staticRoutes);
app.use("/api/warehouse", warehouseRouter);
app.use("/api/user", UserRouter);
app.use("/api/contact", ContactRouter);
app.use("/api/message/", MessageRouter);
app.use("/api/quote", quoteRouter);
app.use("/api/search", searchRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/reports", reportRouter);
app.use("/api/notification", notificationtRouter);
app.use("/api/content", ContentManager);
app.use("/api/newsletter", newsLetterRouter);
app.use("/api/admin/reports/", reportAdminRouter);
app.use("/api/admin/testimonial/", testimonialAdminRouter);
app.use("/api/blog/", BlogsRouter);
app.use("/api/mango/", MangoPayRouter);
app.use("/api/subscription/", SubscriptionRouter);
app.use("/api/warehouserequest/", WarehouseRequestRouter);
app.get("/admin/*", (req, res) => {
  res.sendFile("adminloginlayout.html", viewsFolderPath);
});
//bundle gz zip setting
app.get("*.js", function (req, res, next) {
  req.url = req.url + ".gz";
  res.set("Content-Encoding", "gzip");
  next();
});

app.get("/*", (req, res) => {
  res.sendFile("index.html", viewsFolderPath);
});

app.listen(appConfig.server, () => {
  console.log("Server Started");
});
setInterval(function () {
  //  PaymentService.CreatePayments();
}, 1000 * 60 * 1);
