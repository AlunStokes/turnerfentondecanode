var prompt = require("prompt");
var mysql = require('mysql2');

var fs = require('fs');

prompt.start();

var configSchema = {
  properties: {
    databaseHost: {
      message: "Database host name",
      required: true
    },
    databaseUser: {
      message: "Database user name",
      required: true
    },
    databasePassword: {
      message: "Database password",
      hidden: true
    },
    sessionSecret: {
      message: "A secret string (5 random words w/ spaces between) to encrypt cookies",
      required: true
    },
    hashComplexity: {
      message: "bCrypt hash complexity (minimum of 13 is recommended)",
      required: true,
      default: 13
    },
    mailgunAPIKey: {
      message: "The APIKey for mailgun",
      required: true
    },
    mailgunDomain: {
      message: "The domain for mailkey",
      required: true
    },
    mailingName: {
      message: "The name from which email will be sent",
      required: true,
      default: "Turner Fenton DECA"
    },
    mailingNoReply: {
      message: "The address from which no-reply emails will be sent",
      required: true,
      default: "no-reply@turnerfentondeca.com"
    },
    host: {
      message: "Where this will be hosted (ex. turnerfentondeca.com)",
      required: true,
      default: "turnerfentondeca.com"
    },
    nodeEnvironment: {
      message: "What sort of environment is this (production/development)",
      required: true,
      default: "production"
    }
  }
}

prompt.get(configSchema, function(err, result) {

  var configText = `module.exports = {
    database: {
      host: "` + result.databaseHost + `",
      user: "` + result.databaseUser + `",
      password: "` + result.databasePassword + `",
      database: "turnerfentondecanode"
    },
    sessionSecret: "` + result.sessionSecret + `",
    hashComplexity: ` + result.hashComplexity + `,
    mailgun: {
      apiKey: "` + result.mailgunAPIKey + `",
      domain: "` + result.mailgunDomain + `"
    },
    mail: {
      name: "` + result.mailingName + `",
      noReplyAddress: "` + result.mailingNoReply + `"
    },
    host: "` + result.host + `",
    nodeEnvironment: "` + result.nodeEnvironment + `"
  }`;

  fs.writeFile("./config.js", configText, function(err) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("config.js created");

    var config = require('./config');

    fs.readFile("./turnerfentondecanode.sql", 'utf8', function(err, data) {

      var connection = mysql.createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        multipleStatements: true
      });

      connection.connect(function(err) {
        if (err) {
          console.log(err);
          console.log("Ensure your database is setup correctly");
          return;
        }
        console.time("Finished setting up database in: ");
        connection.query(data, function(err, rows, fields) {
          if (err) {
            console.log(err);
            return;
          }
          console.timeEnd("Finished setting up database in: ");
          console.log("Setup is completed, you may close this window");
          return;
          //process.exit(0);
        });
      });
    });
  });
});
