const crypto = require("crypto");
const appConfig = require("../app.config.js");
const JWT = require("jsonwebtoken");
class SecurityHelper {
  static Encrypt(text) {
    const cipher = crypto.createCipher(
      appConfig.Crypto_Algorithm,
      appConfig.Crypto_Key
    );
    let encText = cipher.update(text, "utf8", "hex");
    encText += cipher.final("hex");
    return encText;
  }
  static Decrypt(encryptText) {
    const decipher = crypto.createDecipher(
      appConfig.Crypto_Algorithm,
      appConfig.Crypto_Key
    );
    let decText = decipher.update(encryptText, "hex", "utf8");
    decText += decipher.final("utf8");
    return decText;
  }
  //Generate JWT Token
  static GenerateToken(user) {
    var payload = {
      Email: user.Email,
      FirstName: user.FirstName,
      LastName: user.LastName,
      Status: user.Status,
      Id: user._id,
      ProfilePicture: user.ProfilePicture,
      SubscriptionEndDate: user.SubscriptionEndDate,
      Type: user.Type
    };
    const token = JWT.sign(payload, appConfig.JWT_KEY, { expiresIn: "1h" });
    return token;
  }
  //Verify JWT Token
  static VerifyToken(token, callback) {
    try {
      return JWT.verify(token, appConfig.JWT_KEY, callback);
    } catch (err) {
      console.log(err);
    }
  }
  // Decode JWT Token
  static decodeToken(token) {
    return JWT.decode(token);
  }
  //Generate Random Password
  static generatePassword() {
    var length = 10,
      charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    return retVal;
  }
  static GetTimeStamp(date) {
    return Math.round(new Date(date).getTime() / 1000);
  }
}
module.exports = SecurityHelper;
