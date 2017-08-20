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

                                        //Create copy of anon for profile picture
                                        copyFile("./public/images/users/thumbnail/anon.jpg", "./public/images/users/thumbnail/" + registrant.studentNumber.value + ".jpg", function(err) {
                                          if (err) {
                                            console.log(err);
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



user.getClusterProficiency = function(studentNumber, callback) {
  var statQuery = "SELECT SUM(correct = 1 && cluster = 'marketing') AS marketingCorrect, SUM(cluster = 'marketing') AS marketingAttempted, SUM( correct = 1 && cluster = 'businessadmin' ) AS businessadminCorrect, SUM(cluster = 'businessadmin') AS businessadminAttempted, SUM( correct = 1 && cluster = 'finance' ) AS financeCorrect, SUM(cluster = 'finance') AS financeAttempted, SUM( correct = 1 && cluster = 'hospitality' ) AS hospitalityCorrect, SUM(cluster = 'hospitality') AS hospitalityAttempted FROM questionsattempted JOIN questionclusters ON questionclusters.questionid = questionsattempted.questionid WHERE studentNumber = ?";
  db.pool.getConnection(function(err, connection) {
    connection.query(statQuery, [studentNumber], function(err, rows, fields) {
      connection.release();
      if (err) {
        callback("Server error - try again later");
        return;
      }
      var stats = {

      };
      var percents = {

      };
      var clusters = [
        "marketing",
        "finance",
        "businessadmin",
        "hospitality"
      ];

      for (var i = 0 ; i < clusters.length; i++) {
        if (rows[0][clusters[i] + "Attempted"] == 0) {
          percents[clusters[i]] = 0;
        }
        else {
          percents[clusters[i]] = (rows[0][clusters[i] + "Correct"]/rows[0][clusters[i] + "Attempted"]);
        }
      }


      var sum = percents.marketing + percents.finance + percents.hospitality + percents.businessadmin;
      stats.marketing = ((percents.marketing/sum) * 100).toFixed(2);
      stats.finance = ((percents.finance/sum) * 100).toFixed(2);
      stats.businessadmin = ((percents.businessadmin/sum) * 100).toFixed(2);
      stats.hospitality = ((percents.hospitality/sum) * 100).toFixed(2);
      if (isNaN(stats.marketing) || isNaN(stats.finance) || isNaN(stats.businessadmin) || isNaN(stats.hospitality)) {
        callback("Invalid statistics - try again later");
        return;
      }
      callback(null, stats);
    });
  });
}

user.getExamResultsLine = function(studentNumber, callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback(err);
      return;
    }
    connection.query("SELECT correct, total, DATE_FORMAT(startTime, '%M %Y') as date FROM examresults LEFT JOIN createdexams ON createdexams.id = examresults.examid WHERE studentNumber = ? AND correct IS NOT NULL AND (includestats = 1 OR examresults.examid = 0) ORDER BY startTime ASC", [studentNumber], function(err, rows, fields) {
      if (err) {
        callback(err);
        return;
      }
      if (rows.length == 0) {
        callback("No exam data");
        return;
      }

      var rawResults = [];
      for (var i = 0; i < rows.length; i++) {
        rawResults.push(
          {
            percentage: (rows[i].correct/rows[i].total) * 100,
            date: rows[i].date
          }
        );
      }

      var firstMonth = rawResults[0].date.split(" ")[0];
      var firstYear = parseInt(rawResults[0].date.split(" ")[1], 10);

      var lastMonth = rawResults[rawResults.length - 1].date.split(" ")[0];
      var lastYear = parseInt(rawResults[rawResults.length - 1].date.split(" ")[1], 10);

      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      var numMonths = months.forwardDistance(firstMonth, lastMonth) + 12 * (lastYear - firstYear) + 1;

      var examResults = {

      };

      var firstMonthIndex = months.indexOf(firstMonth);
      for (var i = 0; i < numMonths; i++) {
        //Creates an index in examResults for each month between the first result and the last
        examResults[months[(firstMonthIndex + i) % 12] + ' ' + (firstYear + Math.floor((i + (12 - firstMonthIndex)) / 12))] = 0;
      }

      var numInMonthCounter = 0;
      for (var i = 0; i < rawResults.length; i++) {
        if (i == 0) {
          examResults[rawResults[i].date] += rawResults[i].percentage;
            numInMonthCounter++;
        }
        else {
          if (rawResults[i].date == rawResults[i - 1].date) {
            numInMonthCounter++;
            examResults[rawResults[i].date] += rawResults[i].percentage;
          }
          else {
            examResults[rawResults[i-1].date] /= numInMonthCounter;
            numInMonthCounter = 1;
            examResults[rawResults[i].date] += rawResults[i].percentage;
          }
        }
      }
      //Get last case of for
      examResults[rawResults[rawResults.length - 1].date] /= numInMonthCounter;
      //Remove months with 0 by filling with score of previous months
      for (var prop in examResults) {
        if (examResults[prop] == 0) {
          //If not the first month (because can't check month before)
          if (prop != firstMonth) {
            //Find name of prop for month before current to set to that score
            examResults[prop] = examResults[Object.keys(examResults)[Object.keys(examResults).indexOf(prop) - 1]];
          }
        }
      }

      callback(null, examResults);
    });
  });
}

//Not finished
user.getMostIncorrectlyAnsweredBy = function(studentNumber, callback) {
  var statQuery = 'SELECT question, optionA, optionB, optionC, optionD, answer FROM questionsattempted JOIN questions ON questionsattempted.questionid = questions.questionid JOIN questionanswers ON questionsattempted.questionid = questionanswers.questionid JOIN questionoptions ON questionsattempted.questionid = questionoptions.questionid GROUP BY questionsattempted.questionid ORDER BY SUM(IF(questionsattempted.correct = 0, 1, 0)) DESC LIMIT 1'
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback(err);
      return;
    }
    connection.query(statQuery, function(err, rows, fields) {
      if (err) {
        callback(err);
        return;
      }
      connection.release();
      if (err) {
        callback(err);
        return;
      }
      var question = {
        question: rows[0].question,
        optionA: rows[0].optionA,
        optionB: rows[0].optionB,
        optionC: rows[0].optionC,
        optionD: rows[0].optionD,
        answer: rows[0].answer,
      }
      callback(null, question);
      return;
    });
  });
}

user.getExamResults = function(studentNumber, callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback(err);
      return;
    }
    connection.query("SELECT correct, total, DATE_FORMAT(startTime, '%d %M, %Y') as date, name, examresults.cluster as cluster FROM examresults LEFT JOIN createdexams ON createdexams.id = examresults.examid WHERE studentNumber = ? AND correct IS NOT NULL AND (includeStats = 1 OR examresults.examid = 0) ORDER BY startTime DESC;", [studentNumber], function(err, rows, fields) {
      if (err) {
        callback(err);
        return;
      }
      var examResults = [];
      for (var i = 0; i < rows.length; i++) {
        examResults.push(
          {
            correct: rows[i].correct,
            total: rows[i].total,
            percentage: ((rows[i].correct/rows[i].total) * 100).toFixed(2),
            name: rows[i].name ? rows[i].name : "Random",
            cluster: valueToCluster(rows[i].cluster),
            date: rows[i].date
          }
        );
      }
      callback(null, examResults);
      return;
    });
  });
}


user.uploadPhoto = function(image, callback) {

}



module.exports = user;


function valueToCluster (value) {
  switch(value) {
    case "mix":
    return "Mixed Clusters";
    break;
    case "marketing":
    return "Marketing";
    break;
    case "finance":
    return "Finance";
    break;
    case "businessadmin":
    return "Business Administration";
    break;
    case "hospitality":
    return "Hospitality & Tourism";
    break;
    case "writtens":
    return "Writtens";
    break;
    default:
    return "undefined"
  }
}

//Finds number of values for certain prop in array of objects
function numUnique (arr, prop) {
  var known = [];
  var num = 0;
  for (var i = 0; i < arr.length; i++) {
    if (known.indexOf(arr[i][prop]) == -1) {
      num++;
      known.push(arr[i][prop]);
    }
  }
  return num;
}

//Find the number of indices from the first given value to the second, moving upward in indices and looping back to the beginning if necessary
Array.prototype.forwardDistance = function(firstValue, lastValue) {
  var dist = (this.length - this.indexOf(firstValue) + this.indexOf(lastValue)) % this.length;
  return dist;
}

function copyFile(source, target, callback) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      callback(err);
      cbCalled = true;
    }
  }
}
