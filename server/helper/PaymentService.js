const express = require("express");
var mangopay = require("mangopay2-nodejs-sdk");
const router = express.Router();
const MangoTransaction = require("../repositories/mangotransaction.repository.js");
const TransactionRepository = require("../repositories/transaction.repository.js");
const path = require("path");
const Security = require("./security.helper.js");
const UserRepository = require("../repositories/user.repository.js");
const appConfig = require("../app.config.js");
var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
var mangoService = new mangopay({
  clientId: appConfig.mangoPay_ClientId,
  clientPassword: appConfig.mangoPay_Passphrase,
  // Set the right production API url. If testing, omit the property since it defaults to sandbox URL
  baseUrl: appConfig.mangoPay_liveUrl
});
class PaymentService {
  static CreatePayments() {
    MangoTransaction.find({ Status: 0 }, (err, transactions) => {
      if (err) {
        console.log("Find transactions " + err.Message);
      }
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      if (transactions.length > 0) {
        transactions.forEach(function (transaction) {
          let paymentDate = new Date(transaction.CreateDate);
          paymentDate.setHours(0, 0, 0, 0);
          paymentDate.setDate(paymentDate.getDate() + 30);
          if (paymentDate <= currentDate) {
            PaymentService.GetPayer(transaction).then(res => {
              if (res.length > 0) {
                let transactionObj = {
                  transaction: transaction,
                  Payer: res[0]
                };
                PaymentService.GetPayee(transactionObj).then(resp => {
                  if (resp.length > 0) {
                    let payIn = new mangoService.models.PayInPaymentDetailsCardDirect(
                      {
                        Tag: "Payment for Quote",
                        AuthorId: transactionObj.Payer.MangoUserId,
                        CreditedUserId: resp[0].MangoUserId,
                        CreditedWalletId: resp[0].WalletId,
                        DebitedFunds: {
                          Currency: "GBP",
                          Amount:
                            parseFloat(transactionObj.transaction.Price) * 100
                        },
                        Fees: {
                          Currency: "GBP",
                          Amount:
                            parseFloat(transactionObj.transaction.Price) * 2.5
                        },
                        SecureModeReturnURL: "http://www.logistcompare.com",
                        CardId: transactionObj.Payer.CardId,
                        PaymentType: "CARD",
                        ExecutionType: "DIRECT"
                      }
                    );
                    let payInObject = {
                      transaction: transactionObj.transaction,
                      Payer: transactionObj.Payer,
                      Payee: resp[0],
                      payIn: payIn
                    };

                    PaymentService.GetPayIn(payInObject)
                      .then(response => {
                        if (response.Status == "SUCCEEDED") {
                          console.log(
                            response.CardId +
                            " " +
                            response.CreditedUserId +
                            " " +
                            response.AuthorId
                          );
                          let trsnsactionDetail = {
                            UserId: payInObject.Payer.id,
                            MangoTransactionId: payInObject.transaction.id,
                            Price: payInObject.transaction.Price,
                            Type: payInObject.transaction.Type,
                            PaymentId: response.Id
                          };
                          PaymentService.SaveTransaction(trsnsactionDetail)
                            .then(res => {
                              console.log(" Payment Completed");
                              PaymentService.UpdateMangoTransaction(transaction)
                                .then(response => {
                                  console.log(
                                    transaction.id + " record updated"
                                  );
                                })
                                .catch(error => {
                                  console.log(
                                    transaction.id +
                                    " error at update in mangoTransaction"
                                  );
                                });
                            })
                            .catch(err => {
                              console.log(" error at update in transaction");
                            });
                        } else {
                          console.log(
                            "Payment Failed for transactionId=" + transaction.id
                          );
                        }
                      })
                      .catch(error => {
                        console.log(error);
                      });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
  static GetPayer(transaction) {
    return new Promise((resolve, reject) => {
      UserRepository.find({ _id: transaction.PayerId }, (err, payer) => {
        if (err) {
          reject(err);
        } else {
          resolve(payer);
        }
      });
    });
  }
  static GetPayee(transactionObj) {
    return new Promise((resolve, reject) => {
      UserRepository.find(
        { _id: transactionObj.transaction.PayeeId },
        (error, payee) => {
          if (error) {
            reject(error);
          } else {
            resolve(payee);
          }
        }
      );
    });
  }
  static GetPayIn(payInObject) {
    console.log(
      payInObject.transaction._id +
      " " +
      payInObject.Payee.MangoUserId +
      " " +
      payInObject.Payer.MangoUserId
    );
    return mangoService.PayIns.create(payInObject.payIn);
  }
  static SaveTransaction(trsnsactionDetail) {
    return new Promise((resolve, reject) => {
      TransactionRepository.save(trsnsactionDetail, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
  static UpdateMangoTransaction(transaction) {
    return new Promise((resolve, reject) => {
      transaction.Status = 1;
      MangoTransaction.save(
        transaction,
        //  { transaction },
        // { multi: true },
        (error, result) => {
          if (error) {
            reject(error);
            console.log(error);
          } else {
            resolve(result);
            console.log(result);
          }
        }
      );
    });
  }
  static RegisterNaturalUser(userDetail) {
    UserRepository.find(
      { Email: userDetail.Email, MangoUserId: { $exists: true } },
      (error, user) => {
        if (error) {
        }
        if (user.length == 0) {
          mangoService.Users.create({
            PersonType: "NATURAL",
            Email: userDetail.Email,
            KYCLevel: "REGULAR",
            FirstName: userDetail.FirstName,
            LastName: userDetail.LastName,
            Birthday: Helper.GetTimeStamp(paymentDetail.BirthDate),
            Nationality: "GB",
            CountryOfResidence: "GB"
          }).then(function (userData) {
            UserRepository.updateSelected(
              { Email: userDetail.Email },
              {
                MangoUserId: userData.Id,
                CardId: data.CardId
              },
              (error, user) => {
                if (error) {
                }
              }
            );
          });
        }
      }
    );
  }

  static CreatePrePayments(transactionData) {
    return new Promise(function (resolve, reject) {
      PaymentService.GetPayer(transactionData).then(res => {
        if (res.length > 0) {
          let transactionObj = {
            transaction: transactionData,
            Payer: res[0]
          };
          PaymentService.GetPayee(transactionObj).then(resp => {
            if (resp.length > 0) {
              let payIn = new mangoService.models.PayInPaymentDetailsCardDirect(
                {
                  Tag: "Payment for Quote",
                  AuthorId: transactionObj.Payer.MangoUserId,
                  CreditedUserId: resp[0].MangoUserId,
                  CreditedWalletId: resp[0].WalletId,
                  DebitedFunds: {
                    Currency: "GBP",
                    Amount: 10
                  },
                  Fees: {
                    Currency: "GBP",
                    Amount: 0
                  },
                  SecureModeReturnURL: "http://www.logistcompare.com",
                  CardId: transactionData.CardId,
                  PaymentType: "CARD",
                  ExecutionType: "DIRECT"
                }
              );
              let payInObject = {
                transaction: transactionObj.transaction,
                Payer: transactionObj.Payer,
                Payee: resp[0],
                payIn: payIn
              };

              mangoService.PayIns.create(payIn).then(response => {
                resolve(response);
              });
            }
          });
        }
      });
    });
  }
}

module.exports = PaymentService;
