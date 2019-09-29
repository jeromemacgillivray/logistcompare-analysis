const path = require("path");
const Repository = require("./repository.js")("faq.model");

class FaqRepository {
  static all(callback) {
    Repository.find({}, callback);
  }

  static aggregate(query, callback) {
    Repository.aggregate(query, callback);
  }
  static find(query, callback) {
    Repository.find(query, callback);
  }
  static removeCollection(query, callback) {
    Repository.remove(query, callback);
  }
  static save(message, callback) {
    new Repository(message).save(callback);
  }
  static update(query, data, callback) {
    Repository.update(query, data, callback);
  }
}
module.exports = FaqRepository;
