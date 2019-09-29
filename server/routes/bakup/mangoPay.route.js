var mangopay = require("mangopay2-nodejs-sdk");
const express = require("express");
const router = express.Router();
const appConfig = require("../app.config.js");
const UserRepository = require("../repositories/user.repository.js");
const MangoTransactionRepository = require("../repositories/mangotransaction.repository.js");
const path = require("path");
const requestService = require("request");
const TransactionRepository = require("../repositories/transaction.repository.js");
const WarehouseRepository = require("../repositories/warehouse.repository.js");
const Helper = require(path.resolve(
  __dirname,
  "./../helper/security.helper.js"
));
const mongoose = require("mongoose");
const PaymentService = require("../helper/PaymentService");
const EmailHelper = require(path.resolve(
  __dirname,
  "./../helper/email.helper.js"
));
var mangoService = new mangopay({
  clientId: appConfig.mangoPay_ClientId,
  clientPassword: appConfig.mangoPay_Passphrase,
  // Set the right production API url. If testing, omit the property since it defaults to sandbox URL
  baseUrl: appConfig.mangoPay_liveUrl
});
router.use(function (req, res, next) {
  Helper.VerifyToken(req.headers.accesstoken, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        Status: false,
        Message: "Session Expired"
      });
    }
    next();
  });
});
router.post("/createlegaluser", (req, res) => {
  const legalUserBankDetail = req.body;
  var userDetail = Helper.decodeToken(req.headers.accesstoken);
  UserRepository.find(
    { Email: userDetail.Email, MangoUserId: { $exists: true } },
    (error, user) => {
      if (error) {
      }
      if (user.length > 0) {
        let mangoUserId = user[0].MangoUserId;
        let myBankDetails = new mangoService.models.BankAccount({
          OwnerName: userDetail.FirstName + " " + userDetail.LastName,
          OwnerAddress: new mangoService.models.Address({
            AddressLine1: legalUserBankDetail.Address,
            City: legalUserBankDetail.City,
            Region: legalUserBankDetail.Region,
            PostalCode: legalUserBankDetail.PostCode,
            Country: "GB" //legalUserBankDetail.Country
          }),
          Type: "GB",
          SortCode: legalUserBankDetail.SortCode,
          AccountNumber: legalUserBankDetail.AccountNumber
        });
        mangoService.Users.createBankAccount(mangoUserId, myBankDetails)
          .then(function (response) {
            let bankDetail = {
              Name: legalUserBankDetail.Name,
              Beneficiary: legalUserBankDetail.BeneficiaryName,
              BusinessName: legalUserBankDetail.BusinessName,
              SortCode: legalUserBankDetail.SortCode,
              AccountNumber: legalUserBankDetail.AccountNumber,
              Address: legalUserBankDetail.Address,
              PaymentType: legalUserBankDetail.PaymentType,
              MangoBankId: response.Id
            };
            let wallet = new mangoService.models.Wallet({
              Owners: [mangoUserId],
              Currency: "GBP",
              Description: "My Warehouse Wallet"
            });
            mangoService.Wallets.create(wallet)
              .then(function (walletDetail) {
                UserRepository.updateSelected(
                  { Email: userDetail.Email },
                  {
                    BankDetail: bankDetail,
                    WalletId: walletDetail.Id,
                    MangoUserId: mangoUserId
                  },
                  (error, user) => {
                    if (error) {
                    }
                    return res.json({
                      Status: true,
                      Message: "Success"
                    });
                  }
                );
              })
              .catch(function (error) {
                return res.json({
                  Status: false,
                  Message: "Server Error,Please try again"
                });
              });
          })
          .catch(function (error) {
            if (error.errors["AccountNumber"]) {
              return res.json({
                Status: false,
                Message: error.errors.AccountNumber
              });
            }
            if (error.errors["SortCode"]) {
              return res.json({
                Status: false,
                Message: error.errors.SortCode
              });
            }
          });
      } else {
        var myUser = new mangoService.models.UserLegal({
          Name: userDetail.FirstName + userDetail.LastName,
          Email: userDetail.Email,
          LegalPersonType: "BUSINESS",
          LegalRepresentativeFirstName: userDetail.FirstName,
          LegalRepresentativeLastName: userDetail.LastName,
          LegalRepresentativeBirthday: Helper.GetTimeStamp(
            legalUserBankDetail.BirthDate
          ),
          LegalRepresentativeNationality: legalUserBankDetail.Nationality
            ? legalUserBankDetail.Nationality
            : "GB",
          LegalRepresentativeCountryOfResidence: legalUserBankDetail.Country
            ? legalUserBankDetail.Country
            : "GB"
        });
        mangoService.Users.create(myUser)
          .then(function (response) {
            if (response) {
              let mangoUserId = response.Id;
              UserRepository.updateSelected(
                { Email: userDetail.Email },
                {
                  MangoUserId: mangoUserId
                },
                (error, user) => {
                  if (error) {
                  }
                  let myBankDetails = new mangoService.models.BankAccount({
                    OwnerName: userDetail.FirstName + " " + userDetail.LastName,
                    OwnerAddress: new mangoService.models.Address({
                      AddressLine1: legalUserBankDetail.Address,
                      City: legalUserBankDetail.City,
                      Region: legalUserBankDetail.Region,
                      PostalCode: legalUserBankDetail.PostCode,
                      Country: "GB" //legalUserBankDetail.Country
                    }),
                    Type: "GB",
                    SortCode: legalUserBankDetail.SortCode,
                    AccountNumber: legalUserBankDetail.AccountNumber
                  });
                  mangoService.Users.createBankAccount(
                    mangoUserId,
                    myBankDetails
                  )
                    .then(function (response) {
                      let bankDetail = {
                        Name: legalUserBankDetail.Name,
                        Beneficiary: legalUserBankDetail.BeneficiaryName,
                        BusinessName: legalUserBankDetail.BusinessName,
                        SortCode: legalUserBankDetail.SortCode,
                        AccountNumber: legalUserBankDetail.AccountNumber,
                        Address: legalUserBankDetail.Address,
                        PaymentType: legalUserBankDetail.PaymentType,
                        MangoBankId: response.Id
                      };
                      let wallet = new mangoService.models.Wallet({
                        Owners: [mangoUserId],
                        Currency: "GBP",
                        Description: "My Warehouse Wallet"
                      });
                      mangoService.Wallets.create(wallet)
                        .then(function (walletDetail) {
                          UserRepository.updateSelected(
                            { Email: userDetail.Email },
                            {
                              BankDetail: bankDetail,
                              WalletId: walletDetail.Id,
                              MangoUserId: mangoUserId
                            },
                            (error, user) => {
                              if (error) {
                              }
                              return res.json({
                                Status: true,
                                Message: "Success"
                              });
                            }
                          );
                        })
                        .catch(function (error) {
                          return res.json({
                            Status: false,
                            Message: "Server Error,Please try again"
                          });
                        });
                    })
                    .catch(function (error) {
                      if (error.errors["AccountNumber"]) {
                        return res.json({
                          Status: false,
                          Message: error.errors.AccountNumber
                        });
                      }
                      if (error.errors["SortCode"]) {
                        return res.json({
                          Status: false,
                          Message: error.errors.SortCode
                        });
                      }
                    });
                }
              );
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }
  );
});
const AttachBankDetail = (mangoUserId, legalUserBankDetail, userDetail) => { };
const CreateWallet = (mangoUserId, userDetail) => { };
router.post("/savecard", (req, res) => {
  const paymentDetail = req.body;
  const cardDetail = paymentDetail.cardDetail;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  let validDate = new Date(paymentDetail.QuoteValidDate);
  validDate.setHours(0, 0, 0, 0);
  if (validDate < currentDate) {
    return res.json({
      Status: false,
      Message: "Quote validity expired"
    });
  }
  let wid = mongoose.Types.ObjectId(paymentDetail.WarehouseId);
  WarehouseRepository.get(wid, (error, warehouse) => {
    if (error) {
      return res.json({
        Status: false,
        Message: "Server Error,Please try again"
      });
    }
    if (paymentDetail.IsBulk) {
      if (warehouse[0].Bulk.TotalSpace < paymentDetail.CapacityRequested) {
        return res.json({
          Status: false,
          Message: "Space is no longer available,Please try again"
        });
      }
    }
    var userDetail = Helper.decodeToken(req.headers.accesstoken);
    UserRepository.find(
      {
        Email: userDetail.Email,
        MangoUserId: { $exists: true }
      },
      (error, user) => {
        if (error) {
        }
        if (user.length > 0) {
          if (user[0].CardId) {
            let transactionDetail = {
              PayerId: mongoose.Types.ObjectId(userDetail.Id),
              Price: parseFloat(paymentDetail.Amount),
              PayeeId: mongoose.Types.ObjectId(paymentDetail.PayeeId),
              Type: "Quote",
              Status: 0,
              TypeId: paymentDetail.QuoteId
            };
            MangoTransactionRepository.save(
              transactionDetail,
              (error, user) => {
                if (error) {
                  return error.Message;
                }

                return res.json({
                  Status: true,
                  Message: "Success"
                });
              }
            );
          } else {
            mangoService.CardRegistrations.create({
              UserId: user[0].MangoUserId,
              Currency: "GBP"
            })
              .then(function (cardRegistrationData) {
                //This data needs to be securely passed by the user
                var cardData = {
                  cardNumber: cardDetail.number,
                  cardExpirationDate:
                    cardDetail.exp_month + cardDetail.exp_year,
                  cardCvx: cardDetail.cvc
                };
                var headers = {
                  "Content-Type": "application/x-www-form-urlencoded"
                };
                // Configure the request
                var options = {
                  url: cardRegistrationData.CardRegistrationURL,
                  headers: headers,
                  form: {
                    data: cardRegistrationData.PreregistrationData,
                    accessKeyRef: cardRegistrationData.AccessKey,
                    cardNumber: cardData.cardNumber,
                    cardExpirationDate: cardData.cardExpirationDate,
                    cardCvx: cardData.cardCvx
                  }
                };
                requestService.post(options, function (err, httpResponse, body) {
                  if (err) {
                    console.log(err);
                    return;
                  }
                  cardRegistrationData.RegistrationData = body;
                  mangoService.CardRegistrations.update(
                    cardRegistrationData
                  ).then(function (data) {
                    if (data.Status == "VALIDATED") {
                      UserRepository.updateSelected(
                        { Email: userDetail.Email },
                        {
                          MangoUserId: user[0].MangoUserId,
                          CardId: data.CardId
                        },
                        (error, user) => {
                          if (error) {
                          }
                          let transactionDetail = {
                            PayerId: mongoose.Types.ObjectId(userDetail.Id),
                            Price: parseFloat(paymentDetail.Amount),
                            PayeeId: mongoose.Types.ObjectId(
                              paymentDetail.PayeeId
                            ),
                            Type: "Quote",
                            Status: 0,
                            TypeId: paymentDetail.QuoteId
                          };
                          MangoTransactionRepository.save(
                            transactionDetail,
                            (error, user) => {
                              if (error) {
                              }
                              return res.json({
                                Status: true,
                                Message:
                                  "Amount  £" +
                                  paymentDetail.Amount +
                                  " Will be Deducted automatically"
                              });
                            }
                          );
                        }
                      );
                    } else {
                      let errorMessage = "";
                      let errorCode = data.RegistrationData.replace(
                        "errorCode=",
                        ""
                      ).trim();
                      switch (errorCode) {
                        case "105202":
                        case "02625":
                          errorMessage = "Invalid card number";
                          break;
                        case "02626":
                          errorMessage = "Please enter a valid date";
                          break;
                        case "02627":
                          errorMessage = "Please enter a valid CVC number";
                          break;
                        case "02624":
                        case "02627":
                          errorMessage =
                            "Card Expired,Please try with other card";
                          break;
                        default:
                          errorMessage =
                            "Internal Server Error,Please try again";
                      }
                      return res.json({
                        Status: false,
                        Message: errorMessage
                      });
                    }
                  });
                });
              })
              .catch(function (error) {
                return "Server Error,Please try again";
              });
          }
        } else {
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
            mangoService.CardRegistrations.create({
              UserId: userData.Id,
              Currency: "GBP"
            }).then(function (cardRegistrationData) {
              //This data needs to be securely passed by the user
              var cardData = {
                cardNumber: cardDetail.number,
                cardExpirationDate: cardDetail.exp_month + cardDetail.exp_year,
                cardCvx: cardDetail.cvc
              };
              var headers = {
                "Content-Type": "application/x-www-form-urlencoded"
              };
              // Configure the request
              var options = {
                url: cardRegistrationData.CardRegistrationURL,
                headers: headers,
                form: {
                  data: cardRegistrationData.PreregistrationData,
                  accessKeyRef: cardRegistrationData.AccessKey,
                  cardNumber: cardData.cardNumber,
                  cardExpirationDate: cardData.cardExpirationDate,
                  cardCvx: cardData.cardCvx
                }
              };
              requestService.post(options, function (err, httpResponse, body) {
                cardRegistrationData.RegistrationData = body;
                mangoService.CardRegistrations.update(
                  cardRegistrationData
                ).then(function (data) {
                  if (data.Status == "VALIDATED") {
                    UserRepository.updateSelected(
                      { Email: userDetail.Email },
                      { MangoUserId: userData.Id, CardId: data.CardId },
                      (error, user) => {
                        if (error) {
                        }
                        let transactionDetail = {
                          PayerId: mongoose.Types.ObjectId(userDetail.Id),
                          Price: parseFloat(paymentDetail.Amount),
                          PayeeId: mongoose.Types.ObjectId(
                            paymentDetail.PayeeId
                          ),
                          Type: "Quote",
                          Status: 0,
                          TypeId: paymentDetail.QuoteId
                        };
                        MangoTransactionRepository.save(
                          transactionDetail,
                          (error, user) => {
                            if (error) {
                              return error.Message;
                            }

                            return res.json({
                              Status: true,
                              Message: "success"
                            });
                          }
                        );
                      }
                    );
                  } else {
                    UserRepository.updateSelected(
                      { Email: userDetail.Email },
                      { MangoUserId: userData.Id },
                      (error, user) => {
                        if (error) {
                          console.log(error);
                        }
                      }
                    );
                    let errorMessage = "";
                    let errorCode = data.RegistrationData.replace(
                      "errorCode=",
                      ""
                    ).trim();
                    switch (errorCode) {
                      case "105202":
                      case "02625":
                        errorMessage = "Invalid card number";
                        break;
                      case "02626":
                        errorMessage = "Please enter a valid date";
                        break;
                      case "02627":
                        errorMessage = "Please enter a valid CVC number";
                        break;
                      case "02624":
                      case "02627":
                        errorMessage =
                          "Card Expired,Please try with other card";
                        break;
                      default:
                        errorMessage = "Internal Server Error,Please try again";
                    }
                    return res.json({
                      Status: false,
                      Message: errorMessage
                    });
                  }
                });
              });
            });
          });
        }
      }
    );
  });
});
router.get("/buysubscription", (req, res) => {
  const userDetail = Helper.decodeToken(req.headers.accesstoken);
  UserRepository.find(
    {
      Email: userDetail.Email,
      MangoUserId: { $exists: true }
    },
    (err, user) => {
      if (err) {
        return res.status(401).json({
          Status: false,
          Message: "Session Expired"
        });
      }
      if (user.length > 0) {
        let payInObject = new mangoService.models.PayInPaymentDetailsCard({
          Tag: "Payment for subscription",
          AuthorId: user[0].MangoUserId,
          DebitedFunds: {
            Currency: "GBP",
            Amount: appConfig.Subscription_Amount * 100
          },
          Fees: {
            Currency: "GBP",
            Amount: 0
          },
          ReturnURL: appConfig.Web_URL + "subscription",
          CreditedWalletId: appConfig.ClientWalletId, //"35207483",
          CardType: "CB_VISA_MASTERCARD",
          SecureMode: "DEFAULT",
          Culture: "EN",
          TemplateURLOptions: {
            Payline: "https://www.mysite.com/template/"
          },
          PaymentType: "CARD",
          ExecutionType: "WEB"
        });
        mangoService.PayIns.create(payInObject)
          .then(response => {
            if (response.Status == "CREATED") {
              return res.json({
                Status: true,
                redirectUrl: response.RedirectURL
              });
            }
            if (response.Status.toUpperCase() == "FAILED") {
              return res.json({
                Status: false,
                Message: "Server Error,Please try again"
              });
            }
          })
          .catch(error => {
            return res.json({
              Status: false,
              Message: "Server Error,Please try again"
            });
          });
      } else {
        var myUser = new mangoService.models.UserLegal({
          Name: userDetail.FirstName + userDetail.LastName,
          Email: userDetail.Email,
          LegalPersonType: "BUSINESS",
          LegalRepresentativeFirstName: userDetail.FirstName,
          LegalRepresentativeLastName: userDetail.LastName,
          LegalRepresentativeBirthday: 1463496101, //Helper.GetTimeStamp(
          //legalUserBankDetail.BirthDate
          //),
          LegalRepresentativeNationality: "GB",
          LegalRepresentativeCountryOfResidence: "GB"
        });
        mangoService.Users.create(myUser).then(function (response) {
          if (response) {
            let mangoUserId = response.Id;
            UserRepository.updateSelected(
              { Email: userDetail.Email },
              {
                MangoUserId: mangoUserId
              },
              (error, user) => {
                if (error) {
                }
                let payInObject = new mangoService.models.PayInPaymentDetailsCard(
                  {
                    Tag: "Payment for subscription",
                    AuthorId: mangoUserId,
                    DebitedFunds: {
                      Currency: "GBP",
                      Amount: appConfig.Subscription_Amount * 100
                    },
                    Fees: {
                      Currency: "GBP",
                      Amount: 0
                    },
                    ReturnURL: appConfig.Web_URL + "subscription",
                    CreditedWalletId: appConfig.ClientWalletId, //"35207483",
                    CardType: "CB_VISA_MASTERCARD",
                    SecureMode: "DEFAULT",
                    Culture: "EN",
                    TemplateURLOptions: {
                      Payline: "https://www.mysite.com/template/"
                    },
                    PaymentType: "CARD",
                    ExecutionType: "WEB"
                  }
                );
                mangoService.PayIns.create(payInObject)
                  .then(response => {
                    if (response.Status == "CREATED") {
                      return res.json({
                        Status: true,
                        redirectUrl: response.RedirectURL
                      });
                    }
                    if (response.Status.toUpperCase() == "FAILED") {
                      return res.json({
                        Status: false,
                        Message: "Server Error,Please try again"
                      });
                    }
                  })
                  .catch(error => {
                    return res.json({
                      Status: false,
                      Message: "Server Error,Please try again"
                    });
                  });
              }
            );
          }
        });
      }
    }
  );
});
router.post("/updatesubscription", (req, res) => {
  let transactionId = req.body.tid;
  let userDetail = Helper.decodeToken(req.headers.accesstoken);
  TransactionRepository.find({ PaymentId: transactionId }, (err, resp) => {
    if (err) {
    }
    if (resp.length > 0) {
      res.json({
        Status: false,
        Message: "Transaction Expired"
      });
    } else {
      mangoService.PayIns.get(transactionId).then(response => {
        if (response.Status == "SUCCEEDED") {
          let trsnsactionDetail = {
            UserId: mongoose.Types.ObjectId(userDetail.Id),
            Price: appConfig.Subscription_Amount,
            Type: "Subscription",
            PaymentId: response.Id,
            Status: 1,//Approved
            Method: ""
          };

          let date = new Date();
          date.setMonth(date.getMonth() + 1);
          UserRepository.updateSelected(
            { Email: userDetail.Email },
            { Status: 3, SubscriptionEndDate: date },
            (error, user) => {
              if (err) {
              } else {
                user.SubscriptionEndDate = date;
                let token = Helper.GenerateToken(user);
                TransactionRepository.save(trsnsactionDetail, (err, result) => {
                  if (err) {
                  }
                  const data = {
                    UserName: userDetail.FirstName + " " + userDetail.LastName
                  };
                  EmailHelper.SendSubscriptionMail(data.UserName);
                  return res.json({
                    Status: true,
                    Message: "Success",
                    accessToken: token
                  });
                });
              }
            }
          );
        } else {
          let errorMessage = "";
          switch (response.ResultCode) {
            case "001030":
            case "001031":
            case "101002":
              errorMessage = "Payment Cancelled";
              break;
            case "001032":
            case "001033":
            case "001034":
              errorMessage = "Payment Session Expired";
              break;
            case "101001":
              errorMessage = "Payment not Completed";
              break;
            default:
              errorMessage = "Payment Failed Please try again";
              break;
          }
          return res.json({
            Status: false,
            Message: errorMessage
          });
        }
      });
    }
  });
});
router.post("/createprepayment", (req, res) => {
  let transactionDetail = req.body;
  PaymentService.CreatePrePayments(transactionDetail).then(response => {
    if (response.Status == "SUCCEEDED") {
      let transactionData = {
        UserId: transactionDetail.PayerId,
        Price: 0.1,
        Type: transactionDetail.Type,
        PaymentId: response.Id
      };
      PaymentService.SaveTransaction(transactionData).then(transaction => {
        // console.log(" Payment Completed");
        return res.json({
          Status: true,
          Message: "success"
        });
      });
    } else {
      return res.json({
        Status: false,
        Message: response.ResultMessage
      });
    }
  });
});

router.post("/savetransaction", (req, res) => {
  let transactionDetail = req.body;
  MangoTransactionRepository.save(transactionDetail, (error, transaction) => {
    if (error) {
      return res.json({
        Status: false,
        Message: error.Message
      });
    }
    return res.json({
      Status: true,
      Message: "Success"
    });
  });
});
router.post("/createnaturaluser", (req, res) => {
  var userDetail = req.body;
  mangoService.Users.create({
    PersonType: "NATURAL",
    Email: userDetail.Email,
    KYCLevel: "REGULAR",
    FirstName: userDetail.FirstName,
    LastName: userDetail.LastName,
    Birthday: Helper.GetTimeStamp(userDetail.BirthDate),
    Nationality: "GB",
    CountryOfResidence: "GB"
  }).then(function (userData) {
    UserRepository.updateSelected(
      { Email: userDetail.Email },
      { MangoUserId: userData.Id },
      (error, user) => {
        if (error) {
          console.log(error);
        }
      }
    );
    return res.json({
      status: true,
      MangoDetail: {
        MangoUserId: userData.Id
      }
    });
  });
});
router.post("/cardpreregistration", (req, res) => {
  let user = req.body;
  mangoService.CardRegistrations.create({
    UserId: user.MangoUserId,
    Currency: "GBP"
  })
    .then(function (cardRegistrationData) {
      return res.json({
        Status: true,
        Message: "success",
        registrationData: cardRegistrationData
      });
    })
    .catch(err => {
      console.log(err);
    });
});
router.post("/completecardregistration", (req, res) => {
  let data = req.body;
  let cardRegistrationData = data.cardRegistrationData;

  mangoService.CardRegistrations.update(cardRegistrationData).then(function (
    data
  ) {
    return res.json({
      Status: true,
      CardInfo: data
    });
  });
});

module.exports = router;
