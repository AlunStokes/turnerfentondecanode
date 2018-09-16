var Statistics = require("../models/statistics");

module.exports = function(req, res, next) {
  var examid = req.query.examid;
  if (typeof(examid) == "undefined") {
    examid = -1;
  }
  Statistics.getExamids(function(err, examids) {
    for (var i = 0; i < examids.length; i++) {
      if (examids[i].id == examid) {
        examids[i].selected = true;
      }
    }

    var fields = [];
    if (req.query.fields) {
      fields = req.query.fields;
    }
    else {
      fields = [
        "firstName",
        "lastName",
        "studentNumber",
        "correct",
        "total",
        "percentage",
        "name",
        "endTime",
        "cluster",
        "grade"
      ];
    }

    res.locals.examids = examids;
    Statistics.getChapterExamResults(examid, fields, function(err, examResults, fields) {
      if (err) {
        res.locals.errors.push(err);
        next();
        return;
      }



      var html = "";
      html += `<table id="exam-results-table" class="table table-bordered table-hover">
      <thead>
      <tr>
      <th>Indiv. Stats</th>`;
      for (var i = 0; i < fields.length; i++) {
        if (fields[i].inTable) {
          html += `<th>` + fields[i].name + `</th>`
        }
      }
      html +=    `</tr>
      </thead>
      <tbody id="table-body">`;
      for (var i = 0; i < examResults.length; i++) {
        html += `<tr>`;
        html += `<th><a href="/personal-exam-statistics?studentNumber=` + examResults[i].studentNumber + `" target="_blank" class="active-color btn btn-default">Indiv. Stats</a></th>`;
        for (var j = 0; j < fields.length; j++) {
          if (fields[j].inTable) {
            html += `<td>` + examResults[i][fields[j].key] + `</td>`;
          }
        }
        html += `</tr>`;
      }
      html += `</tbody>
      <tfoot id="table-footer">
      <tr>
      <th>Indiv. Stats</th>`;
      for (var i = 0; i < fields.length; i++) {
        if (fields[i].inTable) {
          html += `<th>` + fields[i].name + `</th>`
        }
      }
      html += `</tr>
      </tfoot>
      </table>`;



      res.locals.html = html;
      res.locals.fields = fields;
      next();
      return;
    });
  });
}
