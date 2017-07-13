module.exports = function(req, res, next) {
  if (req.originalUrl == "/") {
    next();
    return;
  }
  if (res.locals.navbarActiveIndex != -1 && res.locals.navbarEntries[res.locals.navbarActiveIndex]) {
      res.locals.title = res.locals.navbarEntries[res.locals.navbarActiveIndex].title;
  }
  else {
    res.locals.title = "";
  }
  next();
}
