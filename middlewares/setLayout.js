//Sets current layout for handlebars
module.exports = function(layout) {
  return function(req, res, next) {
    //prepends string with "layout" and capitalises its first letter
    res.locals.layout = "layout" + layout.charAt(0).toUpperCase() + layout.slice(1);
    next();
    return;
  }
}
