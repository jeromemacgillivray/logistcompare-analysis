const mongoose = require("mongoose");
const appConfig = require("../app.config.js");
mongoose.connect(appConfig.connectionString, {useMongoClient: true});

const db = mongoose.connection;
db.on("error", error => console.log(error));
db.on("open", error => console.log(error));
console.log(db);
module.exports = mongoose;
