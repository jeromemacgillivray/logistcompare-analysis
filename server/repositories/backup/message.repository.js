const path = require("path");
const Repository = require("./repository.js")("message.model");

class MessageRepository {
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
}
module.exports = MessageRepository;
