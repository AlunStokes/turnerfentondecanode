var Attendance = require("../models/attendance");

Attendance.getSessionResults(1, function(err, sessionResults) {
  console.log(sessionResults);
  console.log("There are " + sessionResults.length + " users data");
  for (var i = 0; i < sessionResults.length; i++) {
    if (sessionResults[i].present) {
      console.log(sessionResults[i].studentNumber + " was present");
    }
    else {
      console.log(sessionResults[i].studentNumber + " was not present");
    }
  }
});
