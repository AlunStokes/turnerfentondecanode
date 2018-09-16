var User = require("../models/user");

module.exports = function(req, res, next) {
  var fields = [];
  if (req.query.fields) {
    fields = req.query.fields;
  }
  else {
    fields = [
      "firstName",
      "lastName",
      "studentNumber",
      "email",
      "grade",
      "program",
      "decaCluster",
      "decaEvent",
      "programName",
      "alum",
      "admin",
      "confirmedEmail",
      "requestedPasswordReset"
    ];
  }
  User.getUsers(fields, function(err, users, fields) {
    if (err) {
      res.locals.errors.push(err);
      next();
      return;
    }

    var html = "";
    html += `<table id="directory-table" class="table table-bordered table-hover">
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
    for (var i = 0; i < users.length; i++) {
      html += `<tr>`;
      html += `<th><a href="/personal-exam-statistics?studentNumber=` + users[i].studentNumber + `" target="_blank" class="active-color btn btn-default">Indiv. Stats</a></th>`;
      for (var j = 0; j < fields.length; j++) {
        if (fields[j].inTable) {
          html += `<td>` + users[i][fields[j].key] + `</td>`;
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
}
