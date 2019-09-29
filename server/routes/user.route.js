const express = require("express");
const router = express.Router();
const path = require("path");
const appConfig = require("../app.config.js");
const UserRepository = require("../repositories/user.repository.js");
const mongoose = require("mongoose");
const WarehouseRepository = require("../repositories/warehouse.repository.js");
const VideoRepositry = require("../repositories/video.repository.js");
const FaqRepositry = require("../repositories/faq.repository.js");
const BlogRepositry = require("../repositories/blog.repository.js");
const EmailHelper = require(path.resolve(
  __dirname,
  "./../helper/email.helper.js"
));
const Security = require(path.resolve(
  __dirname,
  "./../helper/security.helper.js"
));


router.post("/addServices", (req, res, next) => {
  try {
    
let data = req.body;

  var useremail = Security.decodeToken(req.headers.accesstoken).Email;
  UserRepository.find({ Email: useremail }, (error, user) => {
    if (error) {
    }
     
      if (user.length > 0) {
        user[0].ExtraSecurity = data.ExtraSecurity;
        user[0].ExtraWarehouseType =data.ExtraWarehouseType;
        user[0].ExtraServices = data.ExtraServices;
        user[0].Otherserviceone=data.Otherserviceone;
        user[0].Otherservicetwo=data.Otherservicetwo;
      }
      UserRepository.updateSelected(
        { Email: useremail },
          user[0],
      
        (error, user) => {
          if (error) {
            return res.json({
              Status: false,
              Message: error.message
            });
          }
          return res.json({
            Status: true,
            Message: "Success"
          });
        }
      );
    
  });

  } catch (error) {
    return res.json({
      Status: false,
      Message: "Server Error,Please try again"
    });
  }
});

router.post("/removeSevices", (req, res, next) => {
  try {
    
let data = req.body;
let one="";
let two="";
let ExtraSecurity1="";
let  ExtraWarehouseType1="";
let ExtraServices1="";
  var useremail = Security.decodeToken(req.headers.accesstoken).Email;
  UserRepository.find({ Email: useremail }, (error, user) => {
    if (error) {
    }
     
      if (user.length > 0) {
        user[0].ExtraSecurity = ExtraSecurity1;
        user[0].ExtraWarehouseType =ExtraWarehouseType1;
        user[0].ExtraServices = ExtraServices1;
        user[0].Otherservicetwo=two;
        user[0].Otherserviceone=one;
        
      }
      UserRepository.updateSelected(
        { Email: useremail },
          user[0],
      
        (error, user) => {
          if (error) {
            return res.json({
              Status: false,
              Message: error.message
            });
          }
          return res.json({
            Status: true,
            Message: "Success"
          });
        }
      );
    
  });

  } catch (error) {
    return res.json({
      Status: false,
      Message: "Server Error,Please try again"
    });
  }
});

router.get("/getUserInformation", (req, res) => {
 
  var useremail = Security.decodeToken(req.headers.accesstoken).Email;
  console.log(useremail);
  UserRepository.find({ Email: useremail }, function (err, response) {
    if(err)
    {
      console.log(err);
    }
    return res.json(response);
  });
});

router.post("/adminlogin", (req, res, next) => {
  const adminInfo = req.body;
  if (adminInfo.email.toLowerCase() == appConfig.adminEmailId.toLowerCase()) {
    UserRepository.find(
      {
        Email: { $regex: new RegExp("^" + adminInfo.email.toLowerCase(), "i") }
      }, //new RegExp(adminInfo.email.toLowerCase(), "i") },
      (error, response) => {
        if (error) {
          return res.status(500).json(error);
        }
        if (response[0].Password == adminInfo.password) {
          let token = Security.GenerateToken(response[0]);
          return res.json({
            Status: true,
            Message: "Success",
            accessToken: token
          });
        } else {
          return res.json({
            Status: false,
            Message: "Invalid Password."
          });
        }
      }
    );
  } else {
    return res.json({
      Status: false,
      Message: "please enter a valid email id"
    });
  }
});

router.get("/count", (req, res, next) => {
  let data = {};
  UserRepository.count({ Type: "Owner" }, function (err, response) {
    data.warehouseCount = response;
    UserRepository.count({ Type: "Buyer" }, function (err, resp) {
      data.customerCount = resp;
      return res.json({
        Status: true,
        Obj: data
      });
    });
  });
});
router.post("/adminforgotpassword", (req, res, next) => {
  const emailId = req.body.Forgotemail;
  if (emailId == appConfig.adminEmailId) {
    const password = Security.generatePassword();

    UserRepository.update(
      { Email: emailId },
      { $set: { Password: password } },
      function (err, response) {
        if (err) {
          return res.json({
            Status: false,
            Message: "password not updated."
          });
        } else {
          EmailHelper.SendAdminPassword(emailId, password);
          return res.json({
            Status: true,
            Message:
              "please check your mail. A password has been shared on the same email id."
          });
        }
      }
    );
  } else {
    return res.json({
      Status: false,
      Message: "please enter a valid email id"
    });
  }
});
router.post("/register", (req, res, next) => {
  const userInfo = req.body;
  var currentDate = new Date();
  let SubscriptionDate = currentDate.setMonth(currentDate.getMonth() + 2);
  userInfo.SubscriptionEndDate = SubscriptionDate;
  UserRepository.find(
    { Email: { $regex: new RegExp("^" + userInfo.Email.toLowerCase(), "i") } },
    (error, user) => {
      if (error) {
        return res.status(500).json(error);
      }
      if (user.length == 0) {
        UserRepository.save(userInfo, (error, response) => {
          if (error) {
            return res.json({
              Status: false,
              Message: "Server Error,Please try again"
            });
          }
          EmailHelper.SendConfirmationMail(
            userInfo.FirstName,
            userInfo.Email,
            userInfo.Type
          );
          // res.cookie("isRegisterClick", true);
          return res.status(200).json({
            Status: true,
            Message: "Success"
          });
        });
      } else {
        return res.json({
          Status: false,
          Message: "Email already exist"
        });
      }
    }
  );
});
//upload profile image
router.post("/uploadimage", (req, res) => {
  const obj = {
    file: req.files.image
  };
  UserRepository.uploadImage(obj, (err, response) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.send(response);
  });
});
router.post("/uploadBlogimage", (req, res) => {
  const obj = {
    file: req.files.image
  };
  UserRepository.uploadBlogImage(obj, (err, response) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.send(response);
  });
});
router.post("/resetpassword", (req, res) => {
  try {
    const { NewPassword, Id } = req.body;
    const userEmail = Security.Decrypt(Id);
    UserRepository.find({ Email: userEmail }, (error, user) => {
      if (error) {
      }

      if (user.length > 0) {
        let data = {};
        if (user[0].Status == 0) {
          data = {
            Password: NewPassword,
            Status: 1
          };
        } else {
          data = {
            Password: NewPassword
          };
        }

        const dd = "sdd";

        UserRepository.updateSelected(
          { Email: userEmail },
          data,
          (error, result) => {
            if (error) {
              return res.json({
                status: false,
                Message: error.message
              });
            }
            return res.status(200).json({
              status: true,
              Message: "Password Updated successfully"
            });
          }
        );
      }
    });
  } catch (error) {
    return res.json({
      status: false,
      Message: "Server Error,Please try again"
    });
  }
});
router.post("/login", (req, res) => {
  let { email, password, type } = req.body;
  try {
    UserRepository.find(
      { Email: { $regex: new RegExp("^" + email.toLowerCase(), "i") } }, //new RegExp(email.toLowerCase(), "i") },
      (error, user) => {
        if (error) {
          return res.status(500).json(error);
        }
        if (user.length == 0) {
          return res.json({
            Status: false,
            Message: " Email or password you entered is incorrect."
          });
        }
        if (user[0].Type != type) {
          return res.json({
            Status: false,
            Message:
              type == "Owner"
                ? "Please Login With FindSpace "
                : "Please login with Warehouse"
          });
        }
        if (user[0].Password != password) {
          return res.json({
            Status: false,
            Message: " Email or password you entered is incorrect."
          });
        } else if (user[0].Status == 0) {
          return res.json({
            Status: true,
            Message:
              "Your account is not verified. Please verify your account.",
            accessToken: ""
          });
        } else if (user[0].Status == 2) {
          return res.json({
            Status: false,
            Message:
              "Your account is deactivated. Please contact Admin at Serafina@LogistCompare.com."
          });
        } else {
          let warehouseCount = 0;
          WarehouseRepository.find(
            { UserId: user[0]._id.toString() },
            (err, warehouse) => {
              if (err) {
                warehouseCount = 0;
              }
              warehouseCount = warehouse.length;
              let token = Security.GenerateToken(user[0]);
              return res.json({
                Status: true,
                Message: "Success",
                accessToken: token,
                warehouseCount: warehouseCount
              });
            }
          );
        }
      }
    );
  } catch (error) {
    return res.json({
      Status: false,
      Message: "Server Error,Please try again"
    });
  }
});

router.get("/resendverification", (req, res) => {
  if (req.query.email != "") {
    try {
      UserRepository.find(
        {
          Email: {
            $regex: new RegExp("^" + req.query.email.toLowerCase(), "i")
          }
        } /* req.query.email }*/,
        (error, user) => {
          if (error) {
            return res.json({
              Status: false,
              Message: error.message
            });
          }
          EmailHelper.SendConfirmationMail(
            user[0].FirstName,
            user[0].Email,
            user[0].Type
          );
          return res.json({
            Status: true,
            Message: "Success"
          });
        }
      );
    } catch (error) {
      return res.json({
        Status: false,
        Message: "Server Error,Please try again"
      });
    }
  }
});

router.get("/sendforgotpassword", (req, res) => {
  try {
    UserRepository.find(
      {
        Email: {
          $regex: new RegExp("^" + req.query.email.toLowerCase(), "i")
        }
      },
      (error, user) => {
        if (error) {
          return res.json({
            Status: false,
            Message: error.message
          });
        }
        if (user.length == 0) {
          return res.json({
            Status: false,
            Message: "Please submit a registered email id."
          });
        } else {
          EmailHelper.SendForgotPasswordEmail(
            user[0].FirstName,
            user[0].Email,
            user[0].Type
          );
          return res.json({
            Status: true,
            Message:
              "Please follow the link sent to your email for new password"
          });
        }
      }
    );
  } catch (error) {
    return res.json({
      Status: false,
      Message: "Server Error,Please try again"
    });
  }
});

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

router.get("/addsubscription", (req, res, next) => {
  var useremail = Security.decodeToken(req.headers.accesstoken).Email;
  UserRepository.find({ Email: useremail }, (error, user) => {
    if (error) {
    }
    if (user.length > 0) {
      var currentDate = new Date();
      let SubscriptionDate = currentDate.setMonth(currentDate.getMonth() + 2);
      UserRepository.updateSelected(
        { Email: useremail },
        { Status: 3, SubscriptionEndDate: SubscriptionDate },
        (error, user) => {
          if (error) {
            return res.json({
              Status: false,
              Message: error.message
            });
          }
          return res.json({
            Status: true,
            Message: "Success"
          });
        }
      );
    }
  });
});

router.post("/addbankdetails", (req, res, next) => {
  let data = req.body;
  var useremail = Security.decodeToken(req.headers.accesstoken).Email;
  UserRepository.find({ Email: useremail }, (error, user) => {
    if (error) {
    }
    if (user.length > 0) {
      let bankDetail = {
        Name: data.Name,
        Beneficiary: data.BeneficiaryName,
        BusinessName: data.BusinessName,
        SortCode: data.SortCode,
        AccountNumber: data.AccountNumber,
        Address: data.Address,
        PaymentType: data.PaymentType
      };
      UserRepository.updateSelected(
        { Email: useremail },
        { BankDetail: bankDetail },
        (error, user) => {
          if (error) {
            return res.json({
              Status: false,
              Message: error.message
            });
          }
          return res.json({
            Status: true,
            Message: "Success"
          });
        }
      );
    }
  });
});
router.post("/update", (req, res, next) => {
  try {
    let UserDetail = req.body;
    let useremail = Security.decodeToken(req.headers.accesstoken).Email;
    UserRepository.find({ Email: useremail }, (error, user) => {
      if (error) {
      }
      if (user.length > 0) {
        user[0].FirstName = UserDetail.FirstName;
        user[0].LastName = UserDetail.LastName;
        user[0].ProfilePicture = UserDetail.ProfilePicture;
      }
      UserRepository.updateSelected(
        { Email: useremail },
        user[0],
        (error, result) => {
          if (error) {
            return res.json({
              Status: false,
              Message: error.message
            });
          }
          let token = Security.GenerateToken(user[0]);
          return res.status(200).json({
            Status: true,
            Message: "Success",
            accesstoken: token
          });
        }
      );
    });
  } catch (error) {
    return res.json({
      Status: false,
      Message: "Server Error,Please try again"
    });
  }
});

router.post("/updatepassword", (req, res, next) => {
  try {
    let UserDetail = req.body;
    let useremail = Security.decodeToken(req.headers.accesstoken).Email;
    UserRepository.find({ Email: useremail }, (error, user) => {
      if (error) {
      }
      if (user.length > 0) {
        if (user[0].Password != UserDetail.OldPassword) {
          return res.json({
            status: false,
            Message: "Old Password is invalid."
          });
        }

        UserRepository.updateSelected(
          { Email: useremail },
          { Password: UserDetail.NewPassword },
          (error, result) => {
            if (error) {
              return res.json({
                status: false,
                Message: error.message
              });
            }
            return res.status(200).json({
              status: true,
              Message: "Password changed successfully"
            });
          }
        );
      }
    });
  } catch (error) {
    return res.json({
      status: false,
      Message: "Server Error,Please try again"
    });
  }
});

router.get("/getsubscription", (req, res, next) => {
  return res.status(200).json(true);
});

router.post("/adduser", (req, res, next) => {
  const userInfo = req.body;
  const pUser = Security.decodeToken(req.headers.accesstoken);
  userInfo.ParentId = pUser.Id;
  userInfo.Type = pUser.Type;
  UserRepository.find({ Email: userInfo.Email }, (error, user) => {
    if (error) {
      return res.status(500).json(error);
    }
    if (user.length == 0) {
      UserRepository.save(userInfo, (error, response) => {
        if (error) {
          return res.status(500).json(error);
        }
        EmailHelper.SendConfirmationMailtoManagedAccount(
          userInfo.FirstName,
          userInfo.Email,
          userInfo.Type
        );
        return res.json(response);
      });
    } else {
      return res.status(400).json("Email already exist");
    }
  });
});

router.post("/updateuser", (req, res, next) => {
  const userInfo = req.body;
  try {
    UserRepository.find({ Email: userInfo.Email }, (error, user) => {
      if (error) {
      }
      if (user.length > 0) {
        user[0].FirstName = userInfo.FirstName;
        user[0].LastName = userInfo.LastName;
        user[0].Role = userInfo.Role;
      }
      UserRepository.updateSelected(
        { Email: userInfo.Email },
        user[0],
        (error, result) => {
          if (error) {
            return res.json({
              Status: false,
              Message: error.message
            });
          }
          return res.status(200).json({
            Status: true,
            Message: "Success"
          });
        }
      );
    });
  } catch (error) {
    return res.json({
      Status: false,
      Message: "Server Error,Please try again"
    });
  }
});

router.get("/getall", (req, res, next) => {
  const query = { ParentId: "" };
  query.ParentId = Security.decodeToken(req.headers.accesstoken).Id;
  UserRepository.find(query, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.json(response);
  });
});

router.get("/delete/:id", (req, res, next) => {
  const Id = mongoose.Types.ObjectId(req.params.id);
  UserRepository.delete({ _id: Id }, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.json(response[0]);
  });
});

router.get("/customers", (req, res, next) => {
  UserRepository.getAllCustomers(req.query, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(response);
  });
});

router.get("/getUserInformationById/:userid", (req, res) => {
  const userid = mongoose.Types.ObjectId(req.params.userid);
  UserRepository.find({ _id: userid }, function (err, response) {
    return res.json(response);
  });
});

router.get("/customers/count", (req, res, next) => {
  UserRepository.getAllCustomersCount(req.query, (error, response) => {
    if (error) {
      return res.status(500).json(error);
    }
    return res.status(200).json(response);
  });
});

router.get("/status", (req, res, next) => {
  UserRepository.update(
    { _id: req.query.id },
    { $set: { Status: req.query.status } },
    function (err, response) {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json(response);
    }
  );
});

router.post("/adminChangePassword", (req, res) => {
  const passObj = req.body;
  const emailId = appConfig.adminEmailId;
  UserRepository.find({ Email: emailId }, function (err, response) {
    if (response[0].Password == passObj.Password) {
      UserRepository.update(
        { _id: response[0]._id },
        { $set: { Password: passObj.NewPassword } },
        function (err, result) {
          if (err) return res.status(500).json(err);
          return res.json({
            Status: true,
            Message: "your password has been changed successfully."
          });
        }
      );
    } else {
      return res.json({
        Status: false,
        Message: "please enter a valid old password."
      });
    }
  });
});
router.post("/saveVideo", (req, res, next) => {
  const videoObj = {
    _id: req.body._id,
    Url: req.body.Url,
    Description: req.body.Description
  };
  if (!videoObj._id) {
    VideoRepositry.save(videoObj, function (err, response) {
      if (err) return res.status(500).json(err);
      return res.json({
        Status: true,
        Message: "video has been saved successfully"
      });
    });
  } else {
    const videoId = mongoose.Types.ObjectId(req.body._id);
    VideoRepositry.update({ _id: videoId }, { $set: videoObj }, function (
      err,
      response
    ) {
      if (err) return res.json(500);
      return res.json({
        Status: true,
        Message: "video has been updated successfully"
      });
    });
  }
});
router.get("/getManageVideo", (req, res) => {
  VideoRepositry.all(function (err, response) {
    return res.json(response);
  });
});

router.get("/editVideo/:id", (req, res) => {
  const Id = mongoose.Types.ObjectId(req.params.id);
  VideoRepositry.find({ _id: Id }, function (err, response) {
    return res.json(response);
  });
});
router.get("/deleteVideo/:id", (req, res) => {
  const Id = mongoose.Types.ObjectId(req.params.id);
  VideoRepositry.removeCollection({ _id: Id }, function (err, response) {
    if (err) return res.json(500);
    return res.json({
      Status: true,
      Message: "video has been deleted successfully"
    });
  });
});
router.post("/addFaq", (req, res) => {
  const dataObj = {
    Title: req.body.Title,
    Description: req.body.Description
  };
  if (req.body.faqId == "") {
    FaqRepositry.save(req.body, function (err, response) {
      if (err) return res.json(500);
      return res.json({
        Status: true,
        Message: "successfully added"
      });
    });
  } else {
    const Id = mongoose.Types.ObjectId(req.body.faqId);
    FaqRepositry.update({ _id: Id }, { $set: dataObj }, function (
      err,
      response
    ) {
      if (err) return res.json(500);
      return res.json({
        Status: true,
        Message: "faq has been updated successfully"
      });
    });
  }
});
router.get("/getFaqList/:pageNo", (req, res) => {
  const skipNp = req.params.pageNo;
  FaqRepositry.all(function (err, response) {
    return res.json(response);
  });
});
router.get("/editFaq/:id", (req, res) => {
  const Id = mongoose.Types.ObjectId(req.params.id);
  FaqRepositry.find({ _id: Id }, function (err, response) {
    if (err) return res.json(500);
    return res.json(response);
  });
});
router.get("/deletefaqById/:Id", (req, res) => {
  const Id = mongoose.Types.ObjectId(req.params.Id);
  FaqRepositry.removeCollection({ _id: Id }, function (err, response) {
    if (err) return res.json(500);
    return res.json({
      Status: true,
      Message: "faq has been deleted successfully"
    });
  });
});
router.get("/faqpublish", (req, res) => {
  const Id = mongoose.Types.ObjectId(req.query.Id);
  FaqRepositry.update(
    { _id: Id },
    { $set: { Ispublish: req.query.ispublish } },
    function (err, response) {
      if (err) return res.json(500);
      let message =
        req.query.ispublish == "true"
          ? "FAQ has been published successfully"
          : "FAQ has been unpublished successfully";
      return res.json({
        Status: true,
        Message: message
      });
    }
  );
});
router.post("/addAdminBlog", (req, res) => {
  const obj = req.body;

  BlogRepositry.save(obj, function (err, response) {
    if (err) return res.json(response);
    return res.json(response);
  });
});

router.get("/getAllBlogList", (req, res) => {
  BlogRepositry.all(function (err, response) {
    return res.json(response);
  });
});
router.get("/blockLIstBypage/:skipNo", (req, res) => {
  const skipNo = parseInt(req.params.skipNo);
  BlogRepositry.aggregate(
    [{ $sort: { CreatedDate: -1 } }, { $skip: skipNo }, { $limit: 10 }],
    function (err, response) {
      if (err) return res.json(response);
      return res.json(response);
    }
  );
});

router.get("/deleteBlogById/:Id", (req, res) => {
  const Id = mongoose.Types.ObjectId(req.params.Id);
  BlogRepositry.removeCollection({ _id: Id }, function (err, response) {
    if (err) return res.json(500);
    return res.json({
      Status: true,
      Message: "successfully deleted"
    });
  });
});
router.get("/getBlogById/:Id", (req, res) => {
  const Id = mongoose.Types.ObjectId(req.params.Id);
  BlogRepositry.find({ _id: Id }, function (err, response) {
    if (err) return res.json(500);
    return res.json(response);
  });
});
router.post("/updateBlog", (req, res) => {
  //const Id = mongoose.Types.ObjectId(req.body.Id);
  let blogObj = {
    Name: req.body.Name,
    By: req.body.By,
    Description: req.body.Description,
    UrlDescription: req.body.UrlDescription,
    BlogImage: req.body.BlogImage
  };

  BlogRepositry.update({ _id: req.body.blogId }, { $set: blogObj }, function (
    err,
    response
  ) {
    if (err) return res.json(500);
    return res.json("success");
  });
});
router.get("/userRoleList/:userId", (req, res) => {
  let userId = req.params.userId;

  UserRepository.find({ ParentId: userId }, function (err, response) {
    return res.json(response);
  });
});
router.get("/getuserdetail/:userId", (req, res) => {
  let userId = mongoose.Types.ObjectId(req.params.userId);
  UserRepository.find(
    {
      _id: userId,
      MangoUserId: { $exists: true }
    },
    (error, user) => {
      if (error) {
        console.log(error);
        res.json({
          status: false,
          Message: error
        });
      }
      if (user.length > 0) {
        return res.json({
          status: true,
          Message: "success",
          MangoDetail: {
            MangoUserId: user[0].MangoUserId,
            CardId: user[0].CardId
          }
        });
      }
      return res.json({
        status: false,
        Message: "Not Found"
      });
    }
  );
});
router.post("/updatemangodetail", (req, res) => {
  let userData = req.body;
  UserRepository.updateSelected(
    { Email: userData.Email },
    {
      MangoUserId: userData.MangoUserId,
      CardId: userData.CardId
    },
    (error, user) => {
      if (error) {
        return res.json({
          Status: false,
          Message: error
        });
      }
      return res.json({
        Status: true,
        Message: "Success"
      });
    }
  );
});
router.get("/bankdetail", (req, res) => {

  UserRepository.find(
    {
      Email: appConfig.adminEmailId
    },
    (error, user) => {
      if (error) {
        res.json({
          status: false,
          Message: error
        });
      }
      if (user.length > 0) {
        return res.json({
          status: true,
          Message: "success",
          BankDetail: {
            AccountNumber: user[0].BankDetail.AccountNumber,
            IBAN: user[0].BankDetail.IBAN,
            SWIFTBIC: user[0].BankDetail.SWIFTBIC,
            SortCode: user[0].BankDetail.SortCode
          }
        });
      }
      return res.json({
        status: false,
        Message: "Not Found"
      });
    }
  );
});
module.exports = router;
