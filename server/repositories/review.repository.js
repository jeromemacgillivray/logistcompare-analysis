const fs = require("fs");
const path = require("path");
const Repository = require("./repository.js")("review.model");
class ReviewRepository {
  static all(callback) {
    Repository.find({}, callback);
  }
  static get(id, callback) {
    const query = { _id: id };
    Repository.find(query, callback);
  }

  static save(data, callback) {
    new Repository(data).save(callback);
  }

  static delete(id, callback) {
    Repository.findByIdAndRemove(id, callback);
  }

  static update(data, callback) {
    Repository.findOneAndUpdate({ _id: data._id }, data, callback);
  }

  static find(query, callback) {
    Repository.find(query, callback).sort({ _id: -1 });
  }
  static aggregate(query, callback) {
    Repository.aggregate(query, callback);
  }
  static findwithSkip(query, skip, callback) {
    Repository.find(query, skip, callback);
  }

  static ratingReportAdmin(queryString, callback) {
    let startdate = new Date();
    let match = {
      $and: [
        { CreateDate: { $gte: startdate } },
        { $or: [{ Rating: { $lte: 2 } }, { Rating: null }] }
      ]
    };
    let group = {
      day: { $dayOfMonth: "$CreateDate" },
      month: { $month: "$CreateDate" },
      year: { $year: "$CreateDate" }
    };
    let sort = {
      "_id.CreatedDate.month": 1,
      "_id.CreatedDate.day": 1
    };
    if (queryString.duration == "month") {
      startdate.setHours(0, 0, 0, 0);
      startdate.setDate(startdate.getDate() - 30);
    } else if (queryString.duration == "week") {
      startdate.setHours(0, 0, 0, 0);
      startdate.setDate(startdate.getDate() - 7);
    } else {
      match = { $and: [{ $or: [{ Rating: { $lte: 2 } }, { Rating: null }] }] };
      group = {
        month: { $month: "$CreateDate" },
        year: { $year: "$CreateDate" }
      };
      sort = {
        "_id.CreatedDate.month": 1
      };
    }

    const query = [
      {
        $match: Object.assign(match)
      },
      {
        $group: {
          _id: {
            CreatedDate: Object.assign(group)
          },
          Count: { $sum: 1 }
        }
      },
      { $sort: sort }
    ];
    Repository.aggregate(query, callback);
  }
}

module.exports = ReviewRepository;
