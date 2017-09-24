var WebsiteSettings = require("../models/websiteSettings");

//Check if registration is currently open
module.exports = function(req, res, next) {
  WebsiteSettings.isRegisterOpen(function(err, open) {
    /*if (err || !open) {
      res.render("registerClosed");
      return;
    }*/
    next();
  });
}
