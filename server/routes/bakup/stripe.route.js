const keySecret = "sk_test_6ZWl70H0AGQpeWgoPz3mKaMB";
const express = require("express");
const stripe = require("stripe")(keySecret);
const router = express.Router();
const UserRepository = require("../repositories/user.repository.js");
const TransactionRepository = require("../repositories/transaction.repository.js");

router.post("/charge", (req, res) => {
  let amount = req.body.price * 100;
  const userId = req.body.userId;

  const transObj = {
    UserId: userId,
    Price: req.body.price,
    Type: req.body.type
  };

  stripe.customers
    .create({
      email: req.body.stripeEmail,
      card: req.body.stripeToken
    })
    .then(customer =>
      stripe.charges.create(
        {
          amount,
          description: "warehouseCharges",
          currency: "usd",
          customer: customer.id
        },
        (err, charge) => {
          if (err) {
            return res.status(400).json(err);
          }

          transObj.PaymentId = charge.id;

          let date = new Date();
          date.setMonth(date.getMonth() + 3);

          UserRepository.findByIdAndUpdate(
            userId,
            { $set: { SubscriptionEndDate: date, Status: 3 } },
            { new: true },
            function(err, result) {
              if (err) {
                next(err);
              } else {
                console.log(result);
              }
            }
          );

          TransactionRepository.save(transObj, (err, result) => {
            return res.json("success");
          });
        }
      )
    );
});

module.exports = router;
