var fs = require("fs");

//Loads js for specific route
//Takes array of paths (as strings) as arguments
module.exports = function(jsFiles) {
  return function(req, res, next) {
    for (var i = 0; i < jsFiles.length; i++) {
      res.locals.jsFiles.push(jsFiles[i]);
    }
    next();
  }
}
