//Adds session data to res.locals
//Takes parameter restricted
//If true, will redirect use if they are not logged in
module.exports = function(restricted) {
  return function(req, res, next) {
    if (restricted) {
      if (!req.session.studentNumber) {
        res.redirect("login");
        return;
      }
    }
    if (req.session.studentNumber) {
      res.locals.loggedIn = true;
      Object.assign(res.locals, req.session);
    }
    next();
  }
}
