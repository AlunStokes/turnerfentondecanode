var User = require("../models/user");

module.exports = function(req, res, next) {

  //Value refers to the value of the field, valid refers to wether or not it will be kept and re-displayed on an error in submitting the form
  var registrant = {
    firstName: {value: req.body.firstName, valid: true},
    lastName: {value: req.body.lastName, valid: true},
    email: {value: req.body.email, valid: true},
    emailConfirm: {value: req.body.emailConfirm, valid: true},
    studentNumber: {value: req.body.studentNumber, valid: true},
    password: {value: req.body.password, valid: true},
    passwordConfirm: {value: req.body.passwordConfirm, valid: true},
    grade: {value: parseInt(req.body.grade), valid: true},
    alum: {value: req.body.alum == "true" ? 1: 0, valid: true}
  }

  User.register(registrant, function(err, returnRegistrant) {
    if (!err) {
      res.locals.validRegistration = true;
      next();
      return;
    }
    res.locals.validRegistration = false;
    res.locals.registrant = returnRegistrant;
    res.locals.errors.push(err);
    next();
    return;
  });
}
