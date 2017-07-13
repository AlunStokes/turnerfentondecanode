var db = require("../db");

var websiteSettings = {
  isRegisterOpen: function(callback) {
    db.pool.getConnection(function(err, connection) {
      if (err) {
        callback("Server error, try again later");
        return;
      }
      connection.query("SELECT value FROM websitesettings WHERE setting = 'registrationOpen'", function(err, rows, fields) {
        connection.release();
        if (err) {
          callback(err);
          return;
        }
        if (rows[0].value == 0) {
          callback(false, false);
          return;
        }
        callback(false, true);
      });
    });
  }
};

module.exports = websiteSettings;
