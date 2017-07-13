module.exports = function(req, res, next) {
  res.locals.cssFiles = [];
  res.locals.jsFiles = [];
  res.locals.errors = [];
  res.locals.cards = [];
  next();
  return;
}
