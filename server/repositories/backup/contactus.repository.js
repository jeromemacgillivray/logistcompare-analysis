const path = require("path");
const Repository = require("./repository.js")("contactus.model");

class ContactUsRepository {
  static all(skipCount, callback) {
    Repository.find({}, callback)
      .skip(skipCount)
      .limit(10)
      .sort({ CreatedDate: -1 });
  }
  static find(query, callback) {
    Repository.find(query, callback);
  }
  static count(query, callback) {
    Repository.count(query, callback);
  }
  static save(message, callback) {
    new Repository(message).save(callback);
  }
  static updateSelected(query, data, callback) {
    Repository.findOneAndUpdate(query, data, callback);
  }
  static update({}, callback) {
    Repository.update({}, callback);
  }

  static delete(id, callback) {
    Repository.findByIdAndRemove(id, callback);
  }
}
module.exports = ContactUsRepository;
