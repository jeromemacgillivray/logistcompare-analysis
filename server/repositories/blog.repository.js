const path = require("path");
const Repository = require("./repository.js")("adminblog.model");

class BlogRepositry {
  static all(callback) {
    Repository.find({}, callback);
  }
  static aggregate(query, callback) {
    Repository.aggregate(query, callback);
  }
  static find(query, callback) {
    Repository.find(query, callback);
  }
  static Count(query, callback) {
    Repository.count(query, callback);
  }
  static removeCollection(query, callback) {
    Repository.remove(query, callback);
  }
  static save(blogData, callback) {
    new Repository(blogData).save(callback);
  }
  static update(query, data, callback) {
    Repository.update(query, data, callback);
  }
}
module.exports = BlogRepositry;
