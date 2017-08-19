var Attendance = require("../models/attendance");

module.exports = function(req, res, next) {
  //Check if attendance is open
  Attendance.checkOpenSession(function(err, open) {
    if (err) {
      res.locals.errors.push(err);
      next();
      return;
    }
    res.locals.attendanceSessionOpen = open;

    //Get information about absences if attendance closed
    if (!open) {
      Attendance.getAbsences(req.session.studentNumber, function(err, absenceData) {
        if (err) {
          res.locals.errors.push(err);
          next();
          return;
        }
        res.locals.absenceData = absenceData;
        next();
        return;
      });
    }
    else {
      next();
      return;
    }
  });
}
