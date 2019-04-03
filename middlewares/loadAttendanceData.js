var Attendance = require("../models/attendance");

module.exports = function(req, res, next) {
  var sessionid = req.query.sessionid;
  if (typeof(sessionid) == "undefined") {
    sessionid = 0;
  }
  if (sessionid < 1) {
    Attendance.getLatestSession(function(err, sessionData) {
      if (err) {
        res.locals.errors.push(err);
        next();
        return;
      }
      res.locals.attendanceDate = sessionData.date;
      Attendance.getSessionResults(sessionData.id, function(err, sessionResults) {
        if (err) {
          res.locals.errors.push("Server error- try again later");
          next();
          return;
        }
        Attendance.getSessionids(function(err, sessionids) {
          if (err) {
            res.locals.errors.push("Server error- try again later");
            next();
            return;
          }

          sessionids[0].selected = true;

          res.locals.sessionids = sessionids;
          res.locals.sessionResults = sessionResults;
          next();
          return;
        });
      })
    });
  }
  else {
    Attendance.getSessionData(sessionid, function(err, sessionData) {
      if (err) {
        res.locals.errors.push("Server error- try again later");
        next();
        return;
      }
      res.locals.attendanceDate.getLatestSession = sessionData.date;
      Attendance.getSessionResults(sessionData.getLatestSession.id, function(err, sessionResults) {
        if (err) {
          res.locals.errors.push(err);
          next();
          return;
        }
        Attendance.getSessionids(function(err, sessionids) {
          if (err) {
            res.locals.errors.push("Server error- try again later");
            next();
            return;
          }
          for (var i = 0; i < sessionids.length + 1; i++) {
            if (sessionids[i].id != sessionid) {
              sessionids[i-1].selected = true;
            }
          }
          res.locals.sessionids = sessionids;
          res.locals.sessionResults = sessionResults;
          next();
          return;
        });
      })
    });
  }
}
