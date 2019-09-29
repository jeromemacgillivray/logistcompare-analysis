db.transactions.aggregate([
    { $match: { "Type": "Subscription" } },
    {
        $lookup:
            {
                from: "userinformations",
                localField: "UserId",
                foreignField: "_id",
                as: "Subscriber"
            }
    },
    { $match: { "Subscriber": { $ne: [] } } },
    {
        $unwind: {
            path: "$Subscriber",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $match: {

            $or: [
                { "Subscriber.FirstName": /te/i },
                { "Subscriber.LastName": /te/i }
            ]
        }

    },
    { $sort: { "CreateDate": -1 } },
    { $skip: 0 },
    { $limit: 10 },
    {
        $project:
            {
                "_id": 1,
                "PaymentId": 1,
                "CreateDate": 1,
                "Status": 1,
                "Subscriber.CreateDate": 1,
                "Subscriber.FirstName": 1,
                "Subscriber.LastName": 1,
                "Subscriber.Email": 1
            }
    }]
)