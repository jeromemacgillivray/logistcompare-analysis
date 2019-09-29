const Repository = require("./repository.js")("quote.model");

class QuotesRepository {
  static all(callback) {
    Repository.find({}, callback);
  }
  static get(id, callback) {
    const query = { _id: id };
    Repository.find(query, callback);
  }

  static save(quote, callback) {
    new Repository(quote).save(callback);
  }

  static delete(id, callback) {
    Repository.findByIdAndRemove(id, callback);
  }
  static aggregate(query, callback) {
    Repository.aggregate(query, callback);
  }

  static adminRevenueReport(queryString, callback) {
    let startdate = new Date();
    let group = {
      day: { $dayOfMonth: "$BookedOn" },
      month: { $month: "$BookedOn" },
      year: { $year: "$BookedOn" }
    };
    let sort = {
      "_id.CreatedDate.month": 1,
      "_id.CreatedDate.day": 1
    };
    let match = {
      $and: [{ BookedOn: { $gte: startdate } }, { Status: 3 }]
    };
    if (queryString.duration == "year") {
      match = {
        $and: [{ Status: 3 }, { BookedOn: { $exists: true } }]
      };
      group = {
        month: { $month: "$BookedOn" },
        year: { $year: "$BookedOn" }
      };
      sort = {
        "_id.CreatedDate.month": 1
      };
    } else if (queryString.duration == "month") {
      startdate.setHours(0, 0, 0, 0);
      startdate.setDate(startdate.getDate() - 30);
    } else if (queryString.duration == "week") {
      startdate.setHours(0, 0, 0, 0);
      startdate.setDate(startdate.getDate() - 7);
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
          Count: { $sum: "$TotalCostBreakDown.FinalCost" }
        }
      },
      { $sort: Object.assign(sort) }
    ];

    Repository.aggregate(query, callback);
  }

  static update(quote, callback) {
    Repository.findOneAndUpdate(
      { _id: quote._id },
      quote,
      { new: true },
      callback
    );
  }
}
module.exports = QuotesRepository;
