var fs = require("fs");

//Loads css for specific route
//Takes array of paths (as strings) as arguments
module.exports = function(cssFiles) {
  return function(req, res, next) {
    for (var i = 0; i < cssFiles.length; i++) {
      res.locals.cssFiles.push(cssFiles[i]);
    }
    next();
  }
}
