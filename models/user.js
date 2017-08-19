var db = require("../db");
var bcrypt = require("bcryptjs")
var fs = require("fs");
var config = require("../config");
var Utilities = require("./utilities");
var mailgun = require("mailgun-js")({apiKey: config.mailgun.apiKey, domain: config.mailgun.domain});
var handlebars = require("handlebars");

var user = function() {

}

//Takes user object holding student number and password
//Callback returns error if login fails
user.login = function(user, callback) {
  //Checks if student number follows rules
  if (!user.studentNumber.match(/^\d+$/) || user.studentNumber.toString().length != 6) {
    callback("Invalid student number");
    return;
  }
  //Checks if password corresponds with student number
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback("Server error, try again later");
      return;
    }
    else {
      connection.query("SELECT password, confirmEmailCode FROM members WHERE studentNumber = ?", [user.studentNumber], function(err, rows, fields) {
        connection.release();
        if (rows.length != 1) {
          callback("Student number is not registered");
          return;
        }
        else {
          //If email is not confirmed
          if (rows[0].confirmEmailCode) {
            callback("Validate your email before logging in");
            return;
          }
          var hashedPassword = rows[0].password;
          bcrypt.compare(user.password, hashedPassword, function(err, result) {
            if (err) {
              callback("Server error, try again later");
              return;
            }
            else if (!result) {
              callback("Password does not match student number");
              return;
            }

            callback(null);
            return;

          });
        }
      });
    }
  });
}


//Registrant is an object with fields for firstName, lastName, email, emailConfirm, studentNumber, password, passwordConfirm, grade, and alum
//each field is an object containing value, and valid
user.register = function(registrant, callback) {

  errors = [];

  //Checks if registrant object has any empty fields
  for(var prop in registrant) {
    if(typeof registrant[prop].value === 'undefined' || registrant[prop].value == "" && prop != "alum") {
      //Only adds error once
      if (errors.length == 0) {
        errors.push("All fields must be filled");
      }
      registrant[prop].valid = false;
    }
  }

  //Checks if email follows pattern
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(registrant.email.value)) {
    errors.push("Email is improperly formatted");
    registrant.email.valid = false;
    registrant.emailConfirm.valid = false;
  }

  //Checks if emails match
  if (registrant.email.value != registrant.emailConfirm.value) {
    errors.push("Emails do not match");
    registrant.email.valid = false;
    registrant.emailConfirm.valid = false;
  }

  //Checks if student number follows rules
  if (!registrant.studentNumber.value.match(/^\d+$/) && registrant.studentNumber.value.toString().length != 6) {
    errors.push("Student number is invalid");
    registrant.studentNumber.valid = false;
  }

  //Checks if password follows rules
  if (registrant.password.value.toString().lengh < 8) {
    errors.push("Password too short");
    registrant.password.valid = false;
    registrant.passwordConfirm.valid = false;
  }

  //Checks if passwords match
  if (registrant.password.value != registrant.passwordConfirm.value) {
    errors.push("Passwords do not match");
    registrant.password.valid = false;
    registrant.passwordConfirm.valid = false;
  }

  //Checks if student number available
  db.pool.getConnection(function(err, connection) {
    if (err) {
      errors.push("Server error, try again later");
    }
    else {
      connection.query("SELECT studentNumber FROM members WHERE studentNumber = ?", [registrant.studentNumber.value], function(err, rows, fields) {
        connection.release();
        if (err) {
          errors.push("Server error, try again later");
        }
        else {
          if (rows.length != 0) {
            errors.push("Student number already registered");
            registrant.studentNumber.valid = false;
          }

          //Checks if email available
          db.pool.getConnection(function(err, connection) {
            if (err) {
              errors.push("Server error, try again later");
            }
            else {
              connection.query("SELECT email FROM members WHERE email = ?", [registrant.email.value], function(err, rows, fields) {
                connection.release();
                if (err) {
                  errors.push("Server error, try again later");
                }
                else {
                  if (rows.length != 0) {
                    errors.push("Email already registered");
                  }


                  //Check if user is ready to be put into database or not
                  if (errors.length == 0) {
                    //Register user in database
                    db.pool.getConnection(function(err, connection) {
                      if (err) {
                        errors.push("Server error, try again later");
                        user.buildRegistrant(registrant, function(returnRegistrant) {
                          callback(errors[0], returnRegistrant);
                          return;
                        });
                      }
                      else {
                        bcrypt.hash(registrant.password.value, config.hashComplexity, function(err, hash) {
                          Utilities.generateRandomString(32, function(confirmEmailCode) {
                            connection.query("INSERT INTO members (firstName, lastName, email, password, studentNumber, confirmEmailCode, grade, alum, admin) VALUES (?,?,?,?,?,?,?,?,?)", [registrant.firstName.value, registrant.lastName.value, registrant.email.value, hash, registrant.studentNumber.value, confirmEmailCode, registrant.grade.value, registrant.alum.value, 0], function(err, rows, fields) {
                              if (err) {
                                errors.push("Server error, try again later");
                                user.buildRegistrant(registrant, function(returnRegistrant) {
                                  callback(errors[0], returnRegistrant);
                                  return;
                                });
                              }
                              else {
                                connection.query("INSERT INTO membersettings(studentNumber) VALUES (?)", [registrant.studentNumber.value], function(err, rows, fields) {
                                  if (err) {
                                    errors.push("Server error, try again later");
                                    user.buildRegistrant(registrant, function(returnRegistrant) {
                                      callback(errors[0], returnRegistrant);
                                      return;
                                    });
                                  }
                                  //Check if registration was success
                                  if (errors.length == 0) {
                                    //Send confirmation email
                                    fs.readFile("./views/mail/confirmEmail.hbs", function(err, data) {
                                      if (err) {
                                        errors.push("Server error, try again later");
                                        user.buildRegistrant(registrant, function(returnRegistrant) {
                                          callback(errors[0], returnRegistrant);
                                          return;
                                        });
                                      }
                                      //Create handlebars template from hbs file read in
                                      var htmlTemplate = handlebars.compile(data.toString());
                                      //Define handlebars required data
                                      handlebarsData = {
                                        firstName: registrant.firstName.value,
                                        url: config.host + "/register?confirmEmailCode=" + confirmEmailCode
                                      };
                                      //Insert variables into handlebars template
                                      var html = htmlTemplate(handlebarsData);


                                      var mailData = {
                                        from: config.mail.name + " <" + config.mail.noReplyAddress + ">",
                                        to: registrant.email.value,
                                        subject: "Confirm Email",
                                        text: "Hello, " + registrant.firstName.value + ", \r\n In order to verify your email and complete your registration with Turner Fenton DECA, please proceed to the following url: \r\n " + config.host + "/register?confirmEmailCode=" + confirmEmailCode,
                                        html: html
                                      };

                                      mailgun.messages().send(mailData, function(err, body) {
                                        if (err) {
                                          errors.push("Server error, try again later");
                                          user.buildRegistrant(registrant, function(returnRegistrant) {
                                            callback(errors[0], returnRegistrant);
                                            return;
                                          });
                                        }
                                        //Registration completed
                                        callback(null);
                                        return;
                                      });

                                    });

                                  }
                                  //If insert failed
                                  else {
                                    user.buildRegistrant(registrant, function(returnRegistrant) {
                                      callback(errors[0], returnRegistrant);
                                      return;
                                    });
                                  }
                                });
                              }
                            });
                          });
                        });
                      }
                    });
                  }
                  //Return to register page to show errors
                  else {
                    user.buildRegistrant(registrant, function(returnRegistrant) {
                      callback(errors[0], returnRegistrant);
                      return;
                    });
                  }
                }
              });
            }
          });
        }
      });
    }
  });

}

//Builds registrant object with only valid fields (only defines value), from two dimensional registrant object (which defines value/valid)
user.buildRegistrant = function(registrant, callback) {
  //Creates new registrant object which contains only the valid fields to be passed back into the form when the page is reloaded
  var returnRegistrant = {};
  for(var prop in registrant) {
    if (registrant[prop].valid) {
      returnRegistrant[prop] = registrant[prop].value;
    }
  }
  switch(registrant.grade.value) {
    case 9:
    returnRegistrant.gradeNine = true;
    break;
    case 10:
    returnRegistrant.gradeTen = true;
    break;
    case 11:
    returnRegistrant.gradeEleven = true;
    break;
    case 12:
    returnRegistrant.gradeTwelve = true;
    break;
  }
  if (registrant.alum.value == 1) {
    returnRegistrant.alum = true;
  }
  callback(returnRegistrant);
}


//Takes user object with password and studentNumber or resetCode
user.setPassword = function(user, callback) {
  //If invoking password reset
  if (user.resetCode) {
    bcrypt.hash(user.password, config.hashComplexity, function(err, hash) {
      db.pool.getConnection(function(err, connection) {
        if (err) {
          callback("Server error, try again later");
          return;
        }
        connection.query("UPDATE members SET password = ?, passwordResetCode = NULL WHERE passwordResetCode = ?", [hash, user.resetCode], function(err, rows, fields) {
          connection.release();
          if (err) {
            callback("Server error, try again later");
            return;
          }
          if (rows.affectedRows != 0) {
            callback(null);
            return;
          }
        });
      });
    });
  }
  //If normally changing password
  else {
    bcrypt.hash(user.password, config.hashComplexity, function(err, hash) {
      db.pool.getConnection(function(err, connection) {
        if (err) {
          callback("Server error, try again later");
          return;
        }
        connection.query("UPDATE members SET password = ? WHERE studentNumber = ?", [hash, user.studentNumber], function(err, rows, fields) {
          connection.release();
          if (err) {
            callback("Server error, try again later");
            return;
          }
          if (rows.affectedRows != 0) {
            callback(null);
            return;
          }
        });
      });
    });
  }
}

user.setEmail = function(user, callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback("Server error, try again later");
      return;
    }
    connection.query("UPDATE members SET email = ? WHERE studentNumber = ?", [user.email, user.studentNumber], function(err, rows, fields) {
      connection.release();
      if (err) {
        callback("Server error, try again later");
        return;
      }
      if (rows.affectedRows != 0) {
        callback(null);
        return;
      }
    });
  });
}

//Takes user object containing studentNumber as input and generates and inserts a password resetCode for corresponding user
//Returns err in callback function
user.sendResetCode = function(user, callback) {
  Utilities.generateRandomString(32, function(resetCode) {
    db.pool.getConnection(function(err, connection) {
      if (err) {
        callback("Server error, try again later");
        return;
      }
      connection.query("UPDATE members SET passwordResetCode = ? WHERE studentNumber = ?", [resetCode, user.studentNumber], function(err, rows, fields) {
        if (err) {
          connection.release();
          callback("Server error, try again later");
          return;
        }
        else if (rows.affectedRows == 0) {
          connection.release();
          callback("Student number not found");
          return;
        }
        //Get email data to send reset code
        connection.query("SELECT email, firstName FROM members WHERE studentNumber = ?", [user.studentNumber], function(err, rows, fields) {
          connection.release();
          if (err) {
            callback("Server error, try again later");
            return;
          }
          fs.readFile("./views/mail/resetPassword.hbs", function(err, data) {
            if (err) {
              callback("Server error, try again later");
              return;
            }
            //Create handlebars template from hbs file read in
            var htmlTemplate = handlebars.compile(data.toString());
            //Define handlebars required data
            handlebarsData = {
              firstName: rows[0].firstName,
              url: config.host + "/reset-password?resetCode=" + resetCode
            };
            //Insert variables into handlebars template
            var html = htmlTemplate(handlebarsData);


            var mailData = {
              from: config.mail.name + " <" + config.mail.noReplyAddress + ">",
              to: rows[0].email,
              subject: "Password Reset",
              text: "Hello, " + rows[0].firstName + ", \r\n We noticed you've requested a password reset.  To choose a new password, please proceed to the following url: \r\n " + config.host + "/reset-password?resetCode=" + resetCode,
              html: html
            };

            mailgun.messages().send(mailData, function(err, body) {
              if (err) {
                callback("Server error, try again later");
                return;
              }
              callback(null);
              return;
            });
          });
        });
      });
    });
  });
}

//Takes user object containing studentNumber as input
//Returns err in callback function, returns object with settings
user.getUserSettings = function(user, callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback("Server error, try again later");
      return;
    }
    connection.query("SELECT sidebarBackground, sidebarText, sidebarActive, canSubmitExtensions FROM membersettings WHERE studentNumber = ?", [user.studentNumber], function(err, rows, fields) {
          connection.release();
      if (err) {
        callback("Server error, try again later");
        return;
      }
      //REMEMBER TO ADD ANY MEMBER INTO MEMBER SETTINGS TABLE
      if (typeof(rows[0]) == "undefined") {
        callback("Error loading user settings - no entry in table");
        return;
      }

      var settings = {
        //Colour preference
        sidebarText: rows[0].sidebarText || "333333",
        sidebarActive: rows[0].sidebarActive || "FFFFFF",
        sidebarBackground: rows[0].sidebarBackground || "aacfff",
        //Shows submit extension card on homepage
        canSubmitExtensions: rows[0].canSubmitExtensions || 0
      }

      //Check for chosen colour that is not white to set as active colour for icons
      if (settings.sidebarActive.toUpperCase() != "FFFFFF") {
        settings.activeColor = settings.sidebarActive;
      }
      else if (settings.sidebarBackground.toUpperCase() != "FFFFFF") {
        settings.activeColor = settings.sidebarBackground;
      }
      else if (settings.sidebarText.toUpperCase() != "FFFFFF") {
        settings.activeColor = settings.sidebarText;
      }
      else {
        settings.activeColor = "#aacfff";
      }

      callback(null, settings);
      return;
    });
  });
}

user.updateColorPreference = function(studentNumber, colors, callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback("Server error, try again later");
      return;
    }
    connection.query("UPDATE membersettings SET sidebarBackground = ?, sidebarText = ?, sidebarActive = ? WHERE studentNumber = ?", [colors.sidebarBackground, colors.sidebarText, colors.sidebarActive, studentNumber], function(err, rows, fields) {
      connection.release();
      if (err) {
        callback("Server error, try again later");
        return;
      }
      callback(null);
    });
  });
}

//Takes user object containing confirmEmailCode as input
//Returns err in callback function
user.confirmEmail = function(user, callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback("Server error, try again later");
      return;
    }
    connection.query("UPDATE members SET confirmEmailCode = NULL WHERE BINARY confirmEmailCode = ?", [user.confirmEmailCode], function(err, rows, fields) {
    connection.release();
      if (err) {
        callback("Server error, try again later");
        return;
      }
      if (rows.affectedRows != 1) {
        callback("Your email confirmation code is invalid, or your email has already been confirmed");
        return;
      }
      callback(null);
      return;
    });
  });
}


//Takes user object containing resetCode as input
//Returns err in callback function
user.checkResetCode = function(user, callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback("Server error, try again later");
      return;
    }
    //BINARY enforces case-sensitive search
    connection.query("SELECT passwordResetCode FROM members WHERE BINARY passwordResetCode = ?", [user.resetCode], function(err, rows, fields) {
    connection.release();
      if (err) {
        callback("Server error, try again later");
        return;
      }
      if (rows.length == 1) {
        callback(null);
        return;
      }
      callback("Invalid reset code");
      return;
    });
  });
}


user.addSession = function(user, callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback("Server error, try again later");
      return;
    }
    connection.query("SELECT firstName, lastName, email, decaCluster, decaEvent, admin FROM members WHERE studentNumber = ?", [user.studentNumber], function(err, rows, fields) {
    connection.release();
      if (err) {
        callback("Server error, try again later");
        return;
      }

      user.firstName = rows[0].firstName;
      user.lastName = rows[0].lastName;
      user.email = rows[0].email;
      user.decaCluster = rows[0].decaCluster;
      user.decaEvent = rows[0].decaEvent;
      user.admin = rows[0].admin == 1;

      callback(null, user);
      return;
    });
  });
}


module.exports = user;
