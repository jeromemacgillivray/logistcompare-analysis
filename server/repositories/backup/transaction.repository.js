const path = require("path");
const Repository = require("./repository.js")("transaction.model");


class TransactionRepositry {
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
    static save(data, callback) {
        new Repository(data).save(callback);
    }
    static allRequest(queryString, callback) {
        const skip =
            queryString.pageno == NaN || queryString.pageno == ""
                ? 0
                : parseInt(parseInt(queryString.pageno - 1) * 10);
        const query = [
            { $match: { Type: "Subscription" } },
            {
                $lookup: {
                    from: "userinformations",
                    localField: "UserId",
                    foreignField: "_id",
                    as: "Subscriber"
                }
            },
            {
                $match: { Subscriber: { $ne: [] } }
            },
            {
                $unwind: {
                    path: "$Subscriber",
                    preserveNullAndEmptyArrays: true
                }
            }];
        if (queryString.text != NaN && queryString.text != "") {
            query.push({
                $match: {

                    $or: [
                        { "Subscriber.FirstName": new RegExp(queryString.text, "i") },
                        { "Subscriber.LastName": new RegExp(queryString.text, "i") }
                    ]
                }
            });
        }
        query.push({ $sort: { "CreateDate": -1 } },
            { $skip: skip },
            { $limit: 10 },
            {
                $project: {
                    _id: 1,
                    PaymentId: 1,
                    CreateDate: 1,
                    Status: 1,
                    Method: 1,
                    "Subscriber.CreateDate": 1,
                    "Subscriber.FirstName": 1,
                    "Subscriber.LastName": 1,
                    "Subscriber.Email": 1
                }
            }
        );
        Repository.aggregate(query, callback);
    }
    static update(data, callback) {
        Repository.findOneAndUpdate(
            { _id: data._id },
            data,
            { new: true },
            callback
        );
    }
    static CountRequest(queryString, callback) {
        const query = [
            { $match: { Type: "Subscription" } },
            {
                $lookup: {
                    from: "userinformations",
                    localField: "UserId",
                    foreignField: "_id",
                    as: "Subscriber"
                }
            },
            {
                $match: { Subscriber: { $ne: [] } }
            },
            {
                $unwind: {
                    path: "$Subscriber",
                    preserveNullAndEmptyArrays: true
                }
            }];
        if (queryString.text != NaN && queryString.text != "") {
            query.push({
                $match: {

                    $or: [
                        { "Subscriber.FirstName": new RegExp(queryString.text, "i") },
                        { "Subscriber.LastName": new RegExp(queryString.text, "i") }
                    ]
                }
            });
        }
        query.push({ $sort: { "CreateDate": -1 } },

            {
                $project: {
                    _id: 1,
                    PaymentId: 1,
                    CreateDate: 1,
                    Status: 1,
                    "Subscriber.CreateDate": 1,
                    "Subscriber.FirstName": 1,
                    "Subscriber.LastName": 1,
                    "Subscriber.Email": 1
                }
            });
        Repository.aggregate(query, callback);
    }
}

module.exports = TransactionRepositry;