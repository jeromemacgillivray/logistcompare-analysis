const path = require("path");
const Repository = require("./repository.js")("mangotransaction.model");

class MangoTransactionRepository {
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
  static save(transactionData, callback) {
    new Repository(transactionData).save(callback);
  }
  static update(query, data, multiTrue, callback) {
    Repository.update(query, data, multiTrue, callback);
  }
}
module.exports = MangoTransactionRepository;
