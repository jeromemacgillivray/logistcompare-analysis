const fs = require("fs");
const path = require("path");
const Repository = require("./repository.js")("notification.model");
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

  static getCount(userId, callback) {
    Repository.count({ UserId: userId, Status: 0 }, callback);
  }

  static UpdateStatus(userId, callback) {
    Repository.update(
      { UserId: userId },
      { $set: { Status: 1 } },
      { multi: true },
      callback
    );
  }
  static findAll(query, callback) {
    const data = {
      UserId: query.UserId
    };

    Repository.find(data, callback)
      .skip(query.skip)
      .limit(10)
      .sort({ _id: -1 });
  }
  static find(query, callback) {
    Repository.find(query, callback).sort({ _id: -1 });
  }
  static aggregate(query, callback) {
    Repository.aggregate(query, callback);
  }
}

module.exports = ReviewRepository;
