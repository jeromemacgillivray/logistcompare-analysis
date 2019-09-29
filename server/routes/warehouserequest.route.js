const express = require("express");
const router = express.Router();
const WarehouseRequestRepository = require("../repositories/warehouserequest.repository");
const path = require("path");
const Security = require(path.resolve(
    __dirname,
    "./../helper/security.helper.js"
));
const EmailHelper = require(path.resolve(
    __dirname,
    "./../helper/email.helper.js"
));
const WarehouseRepository = require("../repositories/warehouse.repository.js");
const mongoose = require("mongoose");
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
router.post("/save", (req, res) => {
    try {
        const userDetail = Security.decodeToken(req.headers.accesstoken);
        const message = req.body;
        message.UserId = mongoose.Types.ObjectId(userDetail.Id);
        WarehouseRequestRepository.save(message, (error, response) => {
            if (error) {
                console.log(error);
                return res.json({
                    Status: false,
                    Message: "Server Error,Please try again"
                });
            }
            WarehouseRepository.get(message.WarehouseId, (err, warehouse) => {
                if (err) {

                }

                const data = {
                    UserName: message.Name,
                    Email: message.Email,
                    Phone: message.Phone,
                    Type: "Buyer",
                    Warehouse: warehouse[0].Name,
                    Address: warehouse[0].Address,
                    Subject: message.Subject,
                    Message: message.Message,
                    FormType: message.Type,
                    FromDate: message.FromDate,
                    ToDate: message.ToDate,
                    Space: message.SpaceRequired
                };
                EmailHelper.SendWarehouseRequestMail(data);
                return res.status(200).json({
                    Status: true,
                    Message: "Message sent Successfully"
                });
            });
        });
    } catch (error) {
        return res.json({
            status: false,
            Message: "Server Error,Please try again"
        });
    }
});

router.get("/all", (req, res, next) => {

    WarehouseRequestRepository.allRequest(req.query, (error, requests) => {
        if (error) {
            return res.status(200).json({
                WarehouseRequests: []
            });
        }
        return res.status(200).json({
            WarehouseRequests: requests
        });
    });
});

router.get("/count", (req, res, next) => {
    WarehouseRequestRepository.CountRequest(req.query, (error, response) => {
        if (error) {
            return res.status(200).json({
                WarehouseRequests: []
            });
        }
        return res.status(200).json({
            TotalRecords: response.length
        });
    });
});
router.get("/detail/:id", (req, res, next) => {
    try {
        let requestId = mongoose.Types.ObjectId(req.params.id);
        WarehouseRequestRepository.aggregate([
            { $match: { _id: requestId } },
            {
                $lookup: {
                    from: "warehouses",
                    localField: "WarehouseId",
                    foreignField: "_id",
                    as: "Warehouse"
                }
            },
            {
                $match: { Warehouse: { $ne: [] } }
            },
            {
                $unwind: {
                    path: "$Warehouse",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    Name: 1,
                    CreateDate: 1,
                    Email: 1,
                    Phone: 1,
                    Status: 1,
                    Subject: 1,
                    Message: 1,
                    Type: 1,
                    FromDate: 1,
                    ToDate: 1,
                    SpaceRequired: 1,
                    "Warehouse.Name": 1,
                    "Warehouse.Address": 1,
                    "Warehouse.City": 1
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
module.exports = router;
