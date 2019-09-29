const fs = require("fs");
const path = require("path");
const Repository = require("./repository.js")("warehouse.model");
const publicPath = path.resolve(__dirname, "../../public/warehouseimages/");
const mongoose = require("mongoose");
class WarehouseRepository {
    static all(callback) {
        Repository.find({}, callback);
    }
    static get(id, callback) {
        const query = { _id: id };
        Repository.find(query, callback);
    }

    static save(warehouse, callback) {
        new Repository(warehouse).save(callback);
    }

    static delete(id, callback) {
        Repository.findOneAndUpdate({ _id: id }, { $set: { Status: 1 } }, callback);
    }

    static update(warehouse, callback) {
        Repository.findOneAndUpdate({ _id: warehouse._id }, warehouse, callback);
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
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    static uploadImage(data, callback) {
        const fileName = this.guid() + "." + data.file.mimetype.split("/")[1];
        const newpath = publicPath + "/" + fileName;
        const filePath = "/warehouseimages/" + fileName;
        data.file.mv(newpath, function (err) {
            if (err) return callback(err, null);

            return callback(null, filePath);
        });
    }
    static find(query, callback) {
        Repository.find(query, callback).sort({ _id: -1 });
    }
    static findByIdAndUpdate(query, data, updatetrue, callback) {
        Repository.findByIdAndUpdate(query, data, updatetrue, callback);
    }

    static getNearByLocationCoordinates(queryString, callback) {
        const LngLat = queryString.lnglat.split(",").map(x => parseFloat(x)), //req.query.latlng.split(",");
            distance = parseFloat(queryString.distance) / 3963.2; //req.query.distance

        const query = {
            Location: {
                $geoWithin: {
                    $centerSphere: [LngLat, distance]
                }
            },
            $or: [{ StorageType: queryString.type }, { StorageType: "Bulk_Pallet" }],
            $and: [
                { $or: [{ Status: 0 }, { Status: 2 }] },
                { $or: [{ AvailableSpace: { $gt: 0 } }, { Status: 2 }] },
                {
                    $or: [
                        {
                            [queryString.type + ".AvailabilityFrom"]: {
                                $lte: !!queryString.startdate
                                    ? new Date(queryString.startdate)
                                    : new Date()
                            }
                        },
                        {
                            [queryString.type + ".AvailabilityFrom"]: {
                                $eq: null
                            }
                        },
                        { Status: 2 }
                    ],
                    $or: [
                        {
                            [queryString.type + ".AvailabilityTo"]: {
                                $gte: !!queryString.enddate
                                    ? new Date(queryString.enddate)
                                    : new Date()
                            }
                        },
                        {
                            [queryString.type + ".AvailabilityTo"]: {
                                $eq: null
                            }
                        },
                        { Status: 2 }
                    ]
                }
            ]
        };

        Repository.aggregate(
            [
                { $match: query },
                {
                    $project: {
                        Coordinates: "$Location.coordinates",
                        warehouseId: "$_id",
                        _id: 0
                    }
                }
            ],
            callback
        );
    }
    static search(queryString, callback) {
        const warehouseIds = queryString.loc.split(",");
        const warehouseIdList = warehouseIds.filter(x => {
            return mongoose.Types.ObjectId(x);
        });
        var commonQuery = {
            $and: [
                {
                    $or: [{ StorageType: queryString.ty }, { StorageType: "Bulk_Pallet" }]
                },
                { _id: { $in: warehouseIdList } },
                { $or: [{ Status: 0 }, { Status: 2 }] },
                { $or: [{ AvailableSpace: { $gt: 0 } }, { Status: 2 }] },
                {
                    $or: [
                        {
                            [queryString.ty + ".AvailabilityFrom"]: {
                                $lte: !!queryString.sd ? new Date(queryString.sd) : new Date()
                            }
                        },
                        {
                            [queryString.ty + ".AvailabilityFrom"]: {
                                $eq: null
                            }
                        },
                        { Status: 2 }
                    ]
                },
                {
                    $or: [
                        {
                            [queryString.ty + ".AvailabilityTo"]: {
                                $gte: !!queryString.ed ? new Date(queryString.ed) : new Date()
                            }
                        },
                        {
                            [queryString.ty + ".AvailabilityTo"]: {
                                $eq: null
                            }
                        },
                        { Status: 2 }
                    ]
                }
            ]
        };
        if (queryString.h != "NaN" && queryString.h != "") {
            const ty = queryString.ty + ".MaxHeight";
            const hieghtQuery = {
                $or: [{ ty: { $gte: parseFloat(queryString.h) } }, { Status: 2 }]
            };
            commonQuery = Object.assign({}, commonQuery, hieghtQuery);
        };

        if (queryString.w != "NaN" && queryString.w != "") {
            const weightType = queryString.ty + ".MaxWeight";
            const weightQuery = {
                $or: [{ ty: { $gte: parseFloat(queryString.w) } }, { Status: 2 }]
            };
            commonQuery = Object.assign({}, commonQuery, weightQuery);
        };
        let Bulk = {};

        if (queryString.bl != "NaN" && queryString.bl != "") {
            let maxLengthQuery = {
                $or: [{ "Bulk.MaxLength": { $gte: parseFloat(queryString.bl) } }, { Status: 2 }]
            }
            //Bulk["Bulk.MaxLength"] = { $gte: parseFloat(queryString.bl) };
            Bulk = Object.assign({}, Bulk, maxLengthQuery);
        }
        if (queryString.bw != "NaN" && queryString.bw != "") {
            var maxWidthQuery = {
                $or: [{ "Bulk.MaxWidth": { $gte: parseFloat(queryString.bw) } }, { Status: 2 }]
            }
            Bulk = Object.assign({}, Bulk, maxWidthQuery);

            // Bulk["Bulk.MaxWidth"] = {
            //     $gte: parseFloat(queryString.bw)
            // };
        }
        if (queryString.tbs != "NaN" && queryString.tbs != "") {
            let totalSpaceQuery = {
                $or: [{ "Bulk.TotalSpace": { $gte: parseFloat(queryString.tbs) } }, { Status: 2 }]
            }
            Bulk = Object.assign({}, Bulk, totalSpaceQuery);


            // Bulk["Bulk.TotalSpace"] = {
            //     $gte: parseFloat(queryString.tbs)
            // };
        }

        let Pallet = {
            $or: [{
                "Pallet.Total": {
                    $gte:
                        queryString.tp == "NaN" || queryString.tp == "" ? 0 : queryString.tp
                }
            }, { Status: 2 }],
            $or: [{
                "Pallet.Type.Name": { $eq: queryString.pt }
            }, { Status: 2 }]
        };

        const query = Object.assign(
            {},
            commonQuery,
            queryString.ty == "Pallet" ? Pallet : Bulk
        );
        Repository.find(query, callback).sort({ Status: 1 });
    }
    static aggregate(query, callback) {
        Repository.aggregate(query, callback);
    }
    static allwithProjections(query, projection, callback) {
        Repository.find(query, projection, callback);
    }
}

module.exports = WarehouseRepository;