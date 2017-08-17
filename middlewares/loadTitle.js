var Utilities = require("../models/utilities");

module.exports = function(req, res, next) {
  if (req.originalUrl == "/") {
    next();
    return;
  }
  Utilities.removeUrlParameters(req.originalUrl.split('/')[1], function(page) {
    var title = page.replace(/-/g, ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    res.locals.title = title;
  });
  next();
}
