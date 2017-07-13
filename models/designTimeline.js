var db = require("../db");

var designTimeline = function() {

}

//Returns err and timelineData in callback
//Loads design timeline posts from database
//Pictures must be named in following format:
//year-month-day-main.png (for main photo) and
//year-month-day-alt-#.png (for alternate photos)
//ex. 2016-06-08-alt-3.png
designTimeline.loadPosts = function(callback) {

  var timelineData = [];

  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback("Server error - try again later");
      return;
    }
    connection.query("SELECT entryid, DATE_FORMAT(date, '%Y-%m-%d') AS dateDay, DATE_FORMAT(date, '%M %Y') AS dateMonth, title, author, description, numAlternates FROM designtimelineentries ORDER BY date DESC", function(err, rows, fields) {
      connection.release();
      if (err) {
        callback("Server error - try again later");
        return;
      }
      for (var i = 0; i < rows.length; i++) {
        timelineData.push(
          {
            "entryid": rows[i].entryid,
            "dateDay": rows[i].dateDay,
            "dateMonth": rows[i].dateMonth,
            "author": rows[i].author,
            "title": rows[i].title,
            "description": rows[i].description,
            "numAlternates": rows[i].numAlternates,
            "names": []
          }
        );
      }
      for (var i = 0; i < timelineData.length; i++) {
        for (var j = 1; j <= timelineData[i].numAlternates; j++) {
          var path = "images/design-timeline/" + timelineData[i].dateDay + "-alt-" + j + ".png";
          timelineData[i].names.push(path);
        }
      }
      callback(null, timelineData);
      return;
    });
  });

}

module.exports = designTimeline;
