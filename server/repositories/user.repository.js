const fs = require("fs");
const path = require("path");
const Repository = require("./repository.js")("user.model");
const publicPath = path.resolve(__dirname, "../../public/profileimages/");
const backgroundPath = path.resolve(
  __dirname,
  "../../public/BackgroundImages/"
);

class UserRepository {
  static all(callback) {
    Repository.find({}, callback);
  }
  static find(query, callback) {
    Repository.find(query, callback);
  }
  static findOne(query, callback) {
    Repository.findOne(query, callback);
  }

  static save(user, callback) {
    new Repository(user).save(callback);
  }
  static updateSelected(query, data, callback) {
    Repository.findOneAndUpdate(query, data, callback);
  }
  static findByIdAndUpdate(query, data, updatetrue, callback) {
    Repository.findByIdAndUpdate(query, data, updatetrue, callback);
  }
  static updates(query, data, multitrue, callback) {
    Repository.update(query, data, multitrue, callback);
  }
  static update(query, data, callback) {
    Repository.update(query, data, callback);
  }

  static delete(id, callback) {
    Repository.findByIdAndRemove(id, callback);
  }
  static count(query, callback) {
    Repository.count(query, callback);
  }
  static aggregate(query, callback) {
    Repository.aggregate(query, callback);
  }

  static uploadImage(data, callback) {
    let fileName = this.guid() + ".jpg";
    let newpath = publicPath + "/" + fileName;
    let filePath = "/profileimages/" + fileName;
    data.file.mv(newpath, function (err) {
      if (err) return callback(err, null);

      return callback(null, filePath);
    });
  }
  static uploadBlogImage(data, callback) {
    let fileName = this.guid() + ".jpg";
    let newpath = publicPath + "/" + fileName;
    let filePath = "/profileimages/" + fileName;
    data.file.mv(newpath, function (err) {
      if (err) return callback(err, null);

      return callback(null, filePath);
    });
  }

  static uploadBackGroundImage(data, callback) {
    let fileName = this.guid() + ".jpg";
    let newpath = backgroundPath + "/" + fileName;
    let filePath = "/BackgroundImages/" + fileName;
    data.file.mv(newpath, function (err) {
      if (err) return callback(err, null);

      return callback(null, fileName);
    });
  }
  static guid() {
    return (
      this.s4() +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      this.s4() +
      this.s4()
    );
  }

  static s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  static getAllCustomers(queryString, callback) {
    const skip =
      queryString.pageno == NaN || queryString.pageno == ""
        ? 0
        : parseInt(parseInt(queryString.pageno - 1) * 10);
    const query = [
      {
        $lookup: {
          from: "quotes",
          localField: "_id",
          foreignField: "UserId",
          as: "data"
        }
      },

      {
        $group: {
          _id: {
            Name: { $concat: ["$FirstName", " ", "$LastName"] },
            Email: "$Email",
            userId: "$_id",
            date: "$CreateDate",
            Status: "$Status",
            totalWareHouse: {
              $size: {
                $filter: {
                  input: "$data",
                  as: "da",
                  cond: { $eq: ["$$da.Status", 3] }
                }
              }
            }
          }
        }
      },
      { $sort: { "_id.date": -1 } },
      { $skip: skip },
      { $limit: 10 }
    ];
    if (queryString.text != NaN && queryString.text != "") {
      query.splice(0, 0, {
        $match: {
          $and: [
            { Type: "Buyer" },
            {
              $or: [
                { FirstName: new RegExp(queryString.text, "i") },
                { LastName: new RegExp(queryString.text, "i") },
                { Email: new RegExp(queryString.text, "i") }
              ]
            }
          ]
        }
      });
    } else {
      query.splice(0, 0, {
        $match: { Type: "Buyer" }
      });
    }
    Repository.aggregate(query, callback);
  }
  static getAllCustomersCount(queryString, callback) {
    let query = {};
    if (queryString.text != NaN && queryString.text != "") {
      query = {
        Type: "Buyer",
        FirstName: new RegExp(queryString.text, "i"),
        LastName: new RegExp(queryString.text, "i")
      };
    }
    Repository.count(query, callback);
  }
  static adminUsersReport(queryString, callback) {
    let startdate = new Date();
    let userType = "Owner";
    if (queryString.type == "buyer") userType = "Buyer";
    let group = {
      day: { $dayOfMonth: "$CreateDate" },
      month: { $month: "$CreateDate" },
      year: { $year: "$CreateDate" }
    };
    let match = {
      $and: [{ CreateDate: { $gte: startdate } }, { Type: userType }]
    };
    let sort = {
      "_id.CreateDate.month": 1,
      "_id.CreateDate.day": 1
    };

    if (queryString.duration == "year") {
      group = {
        month: { $month: "$CreateDate" },
        year: { $year: "$CreateDate" }
      };

      sort = {
        "_id.CreateDate.month": 1
      };
      match = {
        $and: [{ Type: userType }]
      };
    } else if (queryString.duration == "month") {
      startdate.setHours(0, 0, 0, 0);
      startdate.setDate(startdate.getDate() - 30);
    } else if (queryString.duration == "week") {
      startdate.setHours(0, 0, 0, 0);
      startdate.setDate(startdate.getDate() - 7);
    }
    const query = [
      { $match: Object.assign(match) },
      {
        $group: {
          _id: {
            CreateDate: Object.assign(group)
          },
          Count: { $sum: 1 }
        }
      },
      { $sort: Object.assign(sort) }
    ];
    Repository.aggregate(query, callback);
  }
  static allWithProjection(query, projection, callback) {
    Repository.find(query, projection, callback)
  }
}
module.exports = UserRepository;
