var express = require('express');
var router = express.Router();

var db = require("../db");

//Models
var Statistics = require("../models/statistics");

router.get("/", function(req, res, next) {

  db.pool.getConnection(function(err, connection) {
    switch(req.query.ajaxid) {
      case "questionsAnswered":
      Statistics.getNumQuestionsAnswered(function(err, numQuestionsAnswered) {
        if (!err) {
          res.send({
            numQuestionsAnswered: numQuestionsAnswered
          });
        }
        else {
          err: "Server error"
        }
      });
      break;

      case "getTFDExtensions":
      connection.query("SELECT extension FROM tfdextensions WHERE approved = 1 ORDER BY RAND() LIMIT 10", function(err, rows, fields) {
        var extensions = [];
        for (var i = 0; i < rows.length; i++) {
          extensions.push(rows[i].extension)
        }
        res.json(extensions);
      });
      break;


      case "allowSubmitExtensions":
      connection.query("UPDATE membersettings SET canSubmitExtensions = 1 WHERE studentNumber = ?", [req.session.studentNumber], function(err, rows, fields) {
        if (rows.affectedRows != 1) {
          res.json({err: "Server error - try again later"});
        }
        else {
          res.json({err: false});
        }
      });
      break;


      case "checkAllowedSubmitExtensions":
      connection.query("SELECT canSubmitExtensions FROM membersettings WHERE studentNumber = ?", [req.session.studentNumber], function(err, rows, fields) {
        if (err) {
          res.json({err: "Server error - try again later"});
        }
        else {
          res.json({canSubmitExtensions: rows[0].canSubmitExtensions == 1});
        }
      });
      break;


      default:
      res.send({
        err: "No valid ajax id defined"
      });


    }
    connection.release();
  });
  return;
});


router.post("/", function(req, res, next) {

  db.pool.getConnection(function(err, connection) {
    switch(req.body.ajaxid) {


      case "getTimelineData":
      var firstIndex = parseInt(req.body.firstIndex);
      var limit = parseInt(req.body.limit);
      var offset = parseInt(req.body.offset);
      connection.query("SELECT timeline.id, timeline.messageHTML, timeline.messageMarkdown, DATE_FORMAT(timeline.date, '%M %D %Y') as date, DATE_FORMAT(timeline.date, '%H:%i') as time, members.firstName as posterFirstName, members.lastName as posterLastName, timeline.poster as posterStudentNumber, timeline.class FROM timeline JOIN members ON members.studentNumber = timeline.poster ORDER BY UNIX_TIMESTAMP(timeline.date) DESC LIMIT ? OFFSET ?", [limit, offset], function(err, rows, fields) {
        res.json(rows);
      });
      break;


      case "submitExtension":
      var extension = req.body.extension;
      connection.query("INSERT INTO tfdextensions (extension, author) VALUES (?, ?)", [extension, req.session.studentNumber], function(err, rows, fields) {
        if (err) {
          if(err.code == "ER_DUP_ENTRY") {
            res.json({
              duplicate: true
            });
          }
          else {
            res.json({
              err: "Server error - try again later"
            });
          }
        }
        else {
          res.json({
            err: false
          });
        }
      });
      break;


      default:


    }
    connection.release();
  });
  return;
});

module.exports = router;
