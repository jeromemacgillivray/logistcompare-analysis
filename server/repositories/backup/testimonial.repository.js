const fs = require("fs");
const path = require("path");
const Repository = require("./repository.js")("testimonial.model");
const publicPath = path.resolve(__dirname, "../../public/testimonialimages/");

class TestimonialRepository {
  static all(queryString, callback) {
    Repository.find({}, callback);
  }
  static find(query, callback) {
    Repository.find(query, callback);
  }
  static get(id, callback) {
    const query = { _id: id };
    Repository.find(query, callback);
  }

  static save(data, callback) {
    new Repository(data).save(callback);
  }

  static findByIdAndUpdate(query, data, updatetrue, callback) {
    Repository.findByIdAndUpdate(query, data, updatetrue, callback);
  }

  static update(data, callback) {
    Repository.findOneAndUpdate({ _id: data._id }, data, callback);
  }

  static delete(id, callback) {
    Repository.findByIdAndRemove(id, callback);
  }
  static count(query, callback) {
    Repository.count(query, callback);
  }

  static uploadImage(data, callback) {
    let fileName = this.guid() + ".jpg";
    let newpath = publicPath + "/" + fileName;
    let filePath = "/testimonialimages/" + fileName;
    data.file.mv(newpath, function (err) {
      if (err) return callback(err, null);

      return callback(null, filePath);
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

  static getAll(queryString, callback) {
    const skip =
      queryString.pageno == NaN || queryString.pageno == ""
        ? 0
        : parseInt(parseInt(queryString.pageno - 1) * 10);

    Repository.find(
      {},
      null,
      { skip: skip, limit: 10, sort: { _id: -1 } },
      callback
    );
  }
}
module.exports = TestimonialRepository;
