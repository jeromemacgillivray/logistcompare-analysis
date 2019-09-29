const fs = require("fs");
const path = require("path");
const Repository = require("./repository.js")("search.model");
class SearchRepository {
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
}

module.exports = SearchRepository;
