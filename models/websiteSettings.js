var db = require("../db");

var websiteSettings = {
  isRegisterOpen: function(callback) {
    db.pool.query("SELECT value FROM websitesettings WHERE setting = 'registrationOpen'", function(err, rows, fields) {
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
  }
};

module.exports = websiteSettings;
