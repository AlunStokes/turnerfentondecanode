var DesignTimeline = require("../models/designTimeline");

module.exports = function(req, res, next) {
  
  DesignTimeline.loadPosts(function(err, timelineData) {
    console.log("AA");
    if (err) {
      res.locals.errors.push(err);
      next();
      return;
    }
    res.locals.timelineData = timelineData;
    next();
    return;
  });

}
