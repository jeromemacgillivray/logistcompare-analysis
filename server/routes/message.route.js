const express = require("express");
const router = express.Router();
const path = require("path");
const RepositoryPath = path.resolve(
  __dirname,
  "../repositories/message.repository.js"
);
const MessageRepository = require(RepositoryPath);
const UserRepository = require("../repositories/user.repository.js");
const Security = require("../helper/security.helper.js");
const EmailHelper = require(path.resolve(
  __dirname,
  "./../helper/email.helper.js"
));
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
router.post("/send", (req, res, next) => {
  const message = req.body;
  const receiverId = req.body.ReceiverId;
  const senderObj = Security.decodeToken(req.headers.accesstoken);

  message.SenderId = senderObj.Id;

  message.SenderInfo = {
    FirstName: senderObj.FirstName,
    LastName: senderObj.LastName,
    ProfilePicture: senderObj.ProfilePicture,
    Id: message.SenderId
  };
  UserRepository.findOne({ _id: receiverId }, (error, response) => {
    if (!error) {
      message.ReceiverInfo = {
        FirstName: response.FirstName,
        LastName: response.LastName,
        ProfilePicture: response.ProfilePicture,
        Id: receiverId,
        Email: response.Email
      };
      EmailHelper.SendEnquiryMail(
        senderObj.FirstName,
        senderObj.LastName,
        response.Email,
        senderObj.Type
      );
      var mailData = {
        senderName: senderObj.FirstName + " " + senderObj.LastName,
        senderEmail: senderObj.Email,
        receiverName: response.FirstName + " " + response.LastName,
        receiverEmail: response.Email,
        messageText: message.Text,
        type: senderObj.Type
      }
      EmailHelper.SendEnquiryMailToAdmin(mailData);
      MessageRepository.save(message, (error, response) => {
        if (error) {
          return res.status(500).json(error);
        }
        return res.json(message);
      });
    }
  });
});

router.get("/remove/:id", (req, res, next) => {
  const senderId = Security.decodeToken(req.headers.accesstoken).Id;
  const receiverId = req.params.id;

  MessageRepository.removeCollection(
    {
      $and: [
        { $or: [{ SenderId: senderId }, { ReceiverId: senderId }] },
        { $or: [{ SenderId: receiverId }, { ReceiverId: receiverId }] }
      ]
    },
    function (err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

router.get("/detail/:id", (req, res, next) => {
  const receiverId = req.params.id;
  const senderId = Security.decodeToken(req.headers.accesstoken).Id;
  MessageRepository.aggregate(
    [
      {
        $match: {
          $and: [
            { $or: [{ SenderId: senderId }, { ReceiverId: senderId }] },
            { $or: [{ SenderId: receiverId }, { ReceiverId: receiverId }] }
          ]
        }
      }
    ],
    function (err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

router.get("/list", (req, res, next) => {
  const senderId = Security.decodeToken(req.headers.accesstoken).Id;
  let blocklist = [];
  UserRepository.find({ _id: senderId }, (error, response) => {
    if (response[0].BlockedList) {
      blocklist = response[0].BlockedList;
    }

    MessageRepository.aggregate(
      [
        {
          $match: {
            $and: [{ $or: [{ SenderId: senderId }, { ReceiverId: senderId }] }]
          }
        },
        {
          $group: {
            _id: {
              Name: {
                $cond: [
                  { $eq: ["$SenderId", senderId] },
                  {
                    $concat: [
                      "$ReceiverInfo.FirstName",
                      " ",
                      "$ReceiverInfo.LastName"
                    ]
                  },
                  {
                    $concat: [
                      "$SenderInfo.FirstName",
                      " ",
                      "$SenderInfo.LastName"
                    ]
                  }
                ]
              },
              ProfilePic: {
                $cond: [
                  { $eq: ["$SenderId", senderId] },
                  "$ReceiverInfo.ProfilePicture",
                  "$SenderInfo.ProfilePicture"
                ]
              },
              ReceiverId: {
                $cond: [
                  { $eq: ["$SenderId", senderId] },
                  "$ReceiverInfo.Id",
                  "$SenderInfo.Id"
                ]
              },
              Blocked: {
                $cond: [
                  { $eq: ["$SenderId", senderId] },
                  { $setIsSubset: [["$ReceiverInfo.Id"], blocklist] },
                  { $setIsSubset: [["$SenderInfo.Id"], blocklist] }
                ]
              }
            }
          }
        }
      ],
      function (err, result) {
        if (err) {
          next(err);
        } else {
          res.json(result);
        }
      }
    );

    //     }
  });
});

router.get("/blockchat/:id", (req, res, next) => {
  const blockId = req.params.id;
  const senderId = Security.decodeToken(req.headers.accesstoken).Id;

  UserRepository.findByIdAndUpdate(
    senderId,
    { $push: { BlockedList: blockId } },
    { new: false, upsert: false },
    function (err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

router.get("/unblockchat/:id", (req, res, next) => {
  const unblockId = req.params.id;
  const senderId = Security.decodeToken(req.headers.accesstoken).Id;

  UserRepository.findByIdAndUpdate(
    senderId,
    { $pull: { BlockedList: { $in: [unblockId] } } },
    { multi: true },
    function (err, result) {
      if (err) {
        next(err);
      } else {
        res.json(result);
      }
    }
  );
});

module.exports = router;
