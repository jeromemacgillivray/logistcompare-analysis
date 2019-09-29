const fs = require("fs");
const path = require("path");
const Repository = require("./repository.js")("warehouserequest.model");
class WarehouseRequestRepository {
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
    static allRequest(queryString, callback) {
        const skip =
            queryString.pageno == NaN || queryString.pageno == ""
                ? 0
                : parseInt(parseInt(queryString.pageno - 1) * 10);
        const query = [];
        if (queryString.text != NaN && queryString.text != "") {
            query.push({
                $match: {
                    Name: new RegExp(queryString.text, "i")
                }
            });
        }
        query.push({ $sort: { "CreatedDate": -1 } },
            { $skip: skip },
            { $limit: 10 },
            {
                $project: {
                    _id: 1,
                    Name: 1,
                    Email: 1,
                    Phone: 1,
                    Subject: 1,
                    CreatedDate: 1
                }
            }
        );
        Repository.aggregate(query, callback);
    }
    static CountRequest(queryString, callback) {
        const query = [];
        if (queryString.text != NaN && queryString.text != "") {
            query.push({
                $match: {
                    Name: new RegExp(queryString.text, "i")
                }
            });
        }
        query.push({ $sort: { "CreateDate": 1 } },

            {
                $project: {
                    _id: 1,
                    Name: 1,
                    Email: 1,
                    Subject: 1
                }
            });
        Repository.aggregate(query, callback);
    }
}

module.exports = WarehouseRequestRepository;
