const express = require("express");
const router = express.Router();
const TransactionRepository = require("../repositories/transaction.repository.js");
const UserRepository = require("../repositories/user.repository.js");
const path = require("path");

const Security = require(path.resolve(
    __dirname,
    "./../helper/security.helper.js"
));
const EmailHelper = require(path.resolve(
    __dirname,
    "./../helper/email.helper.js"
));
const mongoose = require("mongoose");
//Authrize Request
router.use(function (req, res, next) {
    Security.VerifyToken(req.headers.accesstoken, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                Status: false,
                Message: "Session Expired"
            });
        }
        next();
    });
});

router.get("/all", (req, res, next) => {

    TransactionRepository.allRequest(req.query, (error, transactions) => {
        if (error) {
            return res.status(200).json({
                Subscriptions: []
            });
        }
        return res.status(200).json({
            Subscriptions: transactions
        });
    });
});

router.get("/count", (req, res, next) => {
    TransactionRepository.CountRequest(req.query, (error, transactions) => {
        if (error) {
            return res.status(200).json({
                Subscriptions: []
            });
        }
        return res.status(200).json({
            TotalRecords: transactions.length
        });
    });
});
router.get("/detail/:id", (req, res, next) => {
    try {
        let transactionId = mongoose.Types.ObjectId(req.params.id);
        TransactionRepository.aggregate([
            { $match: { _id: transactionId } },
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
            },
            {
                $project: {
                    _id: 1,
                    PaymentId: 1,
                    CreateDate: 1,
                    Price: 1,
                    Status: 1,
                    Method: 1,
                    "Subscriber.CreateDate": 1,
                    "Subscriber.FirstName": 1,
                    "Subscriber.LastName": 1,
                    "Subscriber.Email": 1
                }
            }
        ], function (err, result) {
            if (err) {
                next(err);
            } else {
                return res.json(result);
            }
        }
        );
    }
    catch (error) {
        console.log(error);
    }
});
router.post("/update", (req, res, next) => {
    const data = req.body;
    let query = {
        _id: mongoose.Types.ObjectId(data._id)
    }

    TransactionRepository.find(query, (error, response) => {
        if (error) {
            return res.json({
                status: false,
                Message: "Server Error,Please try again"
            });
        }
        let transaction = response[0];

        transaction.Status = data.Status;
        TransactionRepository.update(transaction, (err, resp) => {
            if (err) {
                return res.status(500).json(err);
            }
            if (data.Status == 2) {
                UserRepository.find({ _id: transaction.UserId }, (error, userDetail) => {
                    if (error) {
                    }
                    if (userDetail.length > 0) {
                        let date = new Date(userDetail[0].SubscriptionEndDate);
                        date.setMonth(date.getMonth() - 1);
                        UserRepository.updateSelected(
                            { _id: transaction.UserId },
                            { Status: 3, SubscriptionEndDate: date },
                            (error, user) => {
                                if (error) {
                                } else {
                                    let userInfo = {
                                        Name: user.FirstName + " " + user.LastName,
                                        Email: user.Email
                                    }
                                    //RejectionEmail
                                    EmailHelper.SendSubscriptionRejectionMail(userInfo, data.Reason);
                                    return res.json({
                                        Status: true,
                                        Message: "Request Rejected",
                                    });
                                }
                            });
                    }

                    // else {
                    //     let date = new Date();
                    //     date.setMonth(date.getMonth() + 1);
                    //     UserRepository.updateSelected(
                    //         { _id: transaction.UserId },
                    //         { Status: 3, SubscriptionEndDate: date },
                    //         (error, user) => {
                    //             if (error) {
                    //             } else {
                    //                 let userInfo = {
                    //                     Name: user.FirstName + " " + user.LastName,
                    //                     Email: user.Email
                    //                 }
                    //                 //ApprovalEmail

                    //                 EmailHelper.SendSubscriptionApprovalMail(userInfo);
                    //                 return res.json({
                    //                     Status: true,
                    //                     Message: data.Status == 1 ? "Request Approved Successfully" : "Request Rejected",
                    //                 });
                    //             }
                    //         });
                    // }
                });
            }
        });
    });
});

router.post("/create", (req, res, next) => {
    let payment = req.body;
    let userDetail = Security.decodeToken(req.headers.accesstoken);
    let transactionDetail = {
        UserId: mongoose.Types.ObjectId(userDetail.Id),
        Price: 60,
        Type: "Subscription",
        PaymentId: payment.tid,
        Status: 0,//Pending for admin Approval
        Method: payment.Method
    };
    let date = new Date();
    date.setMonth(date.getMonth() + 1);
    UserRepository.updateSelected(
        { _id: transactionDetail.UserId },
        { Status: 3, SubscriptionEndDate: date },
        (error, user) => {
            if (error) {
            } else {
                user.SubscriptionEndDate = date;
                let token = Security.GenerateToken(user);
                TransactionRepository.save(transactionDetail, (err, result) => {
                    if (err) {
                    }
                    const data = {
                        username: userDetail.FirstName + " " + userDetail.LastName,
                        ReferenceNumber: payment.tid,
                        Amount: transactionDetail.Price,
                        PaymentMethod: payment.Method
                    };
                    EmailHelper.SendSubscriptionRequestMail(data);
                    return res.json({
                        Status: true,
                        Message: "Your request has been submitted successfully",
                        accesstoken: token
                    });
                });
            }
        });

});
module.exports = router;
