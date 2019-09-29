const env = "P";
let envirnomentSpecificConfig = {};

const envEnum = {
  DEV: "D",
  STAGING: "S",
  PRODUCTION: "P"
};

let appConfig = {
  connectionString: "mongodb://logistcompare:logi#4324IG!@169.50.75.236:27017/logistcompare",
  // connectionString: "mongodb://logistcompare67:ikem92OklQasd@127.0.0.1:27017/logist_live",
  //"mongodb://localhost:8181/LogistCompare",
  // "mongodb://127.0.0.1:27017/logistic",
  database: "logistcompare",
  // database: "logistic",

  SendGrid_Key: "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",
  Crypto_Key: "AC12345465HJKLSSSS",
  Crypto_Algorithm: "aes-256-cbc",
  JWT_KEY: "ABCDEFG1234578621BDCFRWSWWSAS",
  JWT_ALGO: "",
  publishKey: "pk_test_oitDMx8pNX1WzkeE0L8cioUI",
  adminEmailId: "Serafina.Valente@yahoo.co.uk",
  mangoPay_ClientId: "logistcompare1",
  mangoPay_Passphrase: "Hyv2FqfjpZPRT6qsvkZBaG13SdDDExhVcB9anwjrAtSidvQN6q",
  mangoPay_liveUrl: "https://api.mangopay.com",
  ClientWalletId: "297036683", //"255809265"
  Subscription_Amount: 60
};

switch (env) {
  case envEnum.DEV:
    envirnomentSpecificConfig = {
      Web_URL: "http://localhost:8081/",
      server: {
        port: 8081,
        hostname: "localhost"
      }
    };
    break;
  case envEnum.STAGING:
    envirnomentSpecificConfig = {
      Web_URL: "http://logistcompareapp.ignivastaging.com/",
      server: {
        port: 3501,
        hostname: "logistcompareapp.ignivastaging.com"
      }
    };
    break;
  case envEnum.PRODUCTION:
    envirnomentSpecificConfig = {
      Web_URL: "http://logistcompare.com/",
      server: {
        port: 3035,
        hostname: "logistcompare.com"
      }
    };
    break;
  default:
    break;
}

appConfig = Object.assign({}, appConfig, envirnomentSpecificConfig);

module.exports = appConfig;