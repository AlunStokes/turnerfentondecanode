module.exports = function(req, res, next) {
  if (!req.session.admin) {
    res.redirect("home");
    return;
  }
  next();
}
