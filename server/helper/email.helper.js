const sendGridHelper = require("sendgrid").mail;
const path = require("path");
const ECT = require("ect");

const ectRenderer = ECT({
  watch: true,
  root: path.resolve(__dirname, "../views/emailtemplates"),
  ext: ".html"
});
const Security = require("./security.helper.js");
const appConfig = require("../app.config.js");
const SendGrid = require("sendgrid")(appConfig.SendGrid_Key);

class EmailHelper {
  static SendMail(toEmail, subject, message) {
    try {
      var fromEmail = new sendGridHelper.Email(
        "noreply@logistcompare.com",
        "LogistCompare"
      );
      var toEmail = new sendGridHelper.Email(toEmail); //toEmail
      var subject = subject;
      var content = new sendGridHelper.Content("text/html", message);
      var mail = new sendGridHelper.Mail(fromEmail, subject, toEmail, content);
      var request = SendGrid.emptyRequest({
        method: "POST",
        path: "/v3/mail/send",
        body: mail.toJSON()
      });
      SendGrid.API(request, function (error, response) {
        if (error) {
        }

      });
    } catch (error) {
      throw error;
    }
  }
  static SendConfirmationMail(firstName, userEmail, type) {
    const encMail = Security.Encrypt(userEmail);
    var data = {
      link: appConfig.Web_URL + "activateprofile?id=" + encMail,
      username: firstName,
      typecolor: type == "Owner" ? "#39b449;" : "#0170bb;",
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("verification.html", data);
    this.SendMail(userEmail, "Verification", html);
  }
  static SendEnquiryMail(firstName, lastName, userEmail, type) {
    var data = {
      username: firstName,
      lastName: lastName,
      link: appConfig.Web_URL + "user/message/" + 1,
      typecolor: type == "Owner" ? "#0170bb;" : "#39b449;",
      type: type == "Owner" ? "warehouse provider" : "customer",
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("enquiry.html", data);
    this.SendMail(userEmail, "Enquiry", html);
  }

  static GetQuoteMail(username, userEmail, quoteId) {
    var data = {
      username: username,
      link: appConfig.Web_URL + "warehouse/quotes/" + quoteId,
      typecolor: "#39b449;",
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("getQuote.html", data);
    this.SendMail(userEmail, "Enquiry", html);
  }
  static GetQuoteMailToAdmin(data) {
    var mailData = {
      senderName: data.senderName,
      recieverName: data.receiverName,
      senderEmail: data.senderEmail,
      receiverEmail: data.receiverEmail,
      warehouseName: data.warehouseName,
      city : data.city,
      typecolor: "#0170bb;",
      type: "Buyer",
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("getQuoteAdmin.html", mailData);
    this.SendMail(appConfig.adminEmailId.toLowerCase(), "Quote", html);
  }

  static SendQuoteMail(username, userEmail, quoteId) {
    var data = {
      username: username,
      link: appConfig.Web_URL + "user/quotepayment/" + quoteId,
      typecolor: "#0170bb;",
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("sentQuote.html", data);
    this.SendMail(userEmail, "Quote", html);
  }

  static SendQuoteMailToAdmin(data) {
    var mailData = {
      senderName: data.senderName,
      recieverName: data.receiverName,
      senderEmail: data.senderEmail,
      receiverEmail: data.receiverEmail,
      typecolor: "#39b449;",
      type: "Owner",
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("sendQuoteAdmin.html", mailData);
    this.SendMail(appConfig.adminEmailId.toLowerCase(), "Quote", html);
  }
  static SendPaymentMail(username, userEmail) {
    var data = {
      username: username,
      link: appConfig.Web_URL + "warehouse/payments",
      typecolor: "#0170bb;",
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("payment.html", data);
    this.SendMail(userEmail, "Payment", html);
  }
  static SendPaymentMailToAdmin(mailData) {
    var data = {
      senderName: mailData.senderName,
      senderEmail: mailData.senderEmail,
      receiverName: mailData.receiverName,
      receiverEmail: mailData.receiverEmail,
      amount: mailData.amount,
      typecolor: "#0170bb;",
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("paymentAdmin.html", data);
    this.SendMail(appConfig.adminEmailId.toLowerCase(), "Payment", html);
  }
  static SendCountactUsMail(username, type) {
    var data = {
      username: username,
      link: appConfig.Web_URL + "admin/inbox",
      typecolor: type == "Owner" ? "#39b449;" : "#0170bb;",
      type: type == "Owner" ? "warehouse provider" : "customer".anchor,
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("contactUs.html", data);
    this.SendMail(appConfig.adminEmailId.toLowerCase(), "Enquiry", html);
  }
  static SendEnquiryMailToAdmin(mailData) {
    const data = {
      senderName: mailData.senderName,
      senderEmail: mailData.senderEmail,
      recieverName: mailData.receiverName,
      receiverEmail: mailData.receiverEmail,
      message: mailData.messageText,
      typecolor: mailData.type == "Owner" ? "#39b449;" : "#0170bb;",
      type: mailData.type,
      WebUrl: appConfig.Web_URL
    }
    const html = ectRenderer.render("enquiry_admin.html", data);
    this.SendMail(appConfig.adminEmailId.toLowerCase(), "Enquiry", html);
  }
  static SendSubscriptionMail(username) {
    var data = {
      username: username,
      link: appConfig.Web_URL + "warehouse/login",
      typecolor: "#39b449;",
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("subscription.html", data);
    this.SendMail(appConfig.adminEmailId.toLowerCase(), "Subscription", html);
    //appConfig.adminEmailId.toLowerCase()
  }

  static SendForgotPasswordEmail(firstName, userEmail, type) {
    const encMail = Security.Encrypt(userEmail);
    var data = {
      link: appConfig.Web_URL + "resetpassword/" + encMail,
      username: firstName,
      typecolor: type == "Owner" ? "#39b449;" : "#0170bb;",
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("forgotpassword.html", data);
    this.SendMail(userEmail, "Reset Password", html);
  }

  static SendConfirmationMailtoManagedAccount(firstName, userEmail, type) {
    const encMail = Security.Encrypt(userEmail);
    var data = {
      link: appConfig.Web_URL + "resetpassword/" + encMail,
      username: firstName,
      typecolor: type == "Owner" ? "#39b449;" : "#0170bb;",
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("verification.html", data);
    this.SendMail(userEmail, "Verification", html);
  }
  static SendAdminPassword(userEmail, password) {
    var data = {
      username: "Admin",
      password: password
    };
    const html = ectRenderer.render("adminforgotpassword.html", data);
    this.SendMail(userEmail, "Forgot Password", html);
  }
  static SendSubscriptionRequestMail(model) {
    var data = {
      username: model.username,
      link: appConfig.Web_URL + "admin/login",
      typecolor: "#39b449;",
      WebUrl: appConfig.Web_URL,
      ReferenceNumber: model.ReferenceNumber,
      Amount: model.Amount,
      PaymentMethod: model.PaymentMethod,
      PaymentDate: new Date().toISOString().
        replace(/T/, ' ').      // replace T with a space
        replace(/\..+/, '')
    };
    const html = ectRenderer.render("subscriptionrequest.html", data);
    this.SendMail(appConfig.adminEmailId.toLowerCase(), "Subscription", html);//appConfig.adminEmailId.toLowerCase()
  }
  static SendSubscriptionApprovalMail(user) {
    var data = {
      username: user.Name,
      link: appConfig.Web_URL + "admin/login",
      typecolor: "#39b449;",
      WebUrl: appConfig.Web_URL
    };
    const html = ectRenderer.render("subscriptionapproval.html", data);
    this.SendMail(user.Email, "Subscription", html);
  }

  static SendSubscriptionRejectionMail(user, reason) {
    var data = {
      username: user.Name,
      link: appConfig.Web_URL + "admin/login",
      typecolor: "#39b449;",
      WebUrl: appConfig.Web_URL,
      Reason: reason
    };
    const html = ectRenderer.render("subscriptionrejection.html", data);
    this.SendMail(user.Email, "Subscription", html);
  }
  static SendWarehouseRequestMail(message) {
    var data = {
      UserName: message.UserName,
      Email: message.Email,
      Phone: message.Phone,
      Type: message.Type,
      Warehouse: message.Warehouse,
      Address: message.Address,
      Subject: message.Subject,
      Message: message.Message,
      link: appConfig.Web_URL + "admin/requests",
      typecolor: "#0170bb;",
      type: "customer".anchor,
      WebUrl: appConfig.Web_URL,
      FormType: message.FormType,
      FromDate: message.FromDate,
      ToDate: message.ToDate,
      Space: message.Space
    };
    const html = message.FormType == "Enquire" ? ectRenderer.render("warehouse_request_enquire.html", data) : ectRenderer.render("warehouse_request.html", data);
    this.SendMail(appConfig.adminEmailId.toLowerCase(), "Enquiry", html);
  }
}
module.exports = EmailHelper;
