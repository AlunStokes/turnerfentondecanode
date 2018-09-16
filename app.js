var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var session = require('cookie-session');
var compression = require('compression');

//Initialise applicaiton
var app = express();

//Various config variables
var config = require("./config.js");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, '/views/partials'));
//For loop for handlebars
hbs.registerHelper("for", function(times, block) {
  var html = "";
  for (var i = 0; i < times; i++) {
    html += block.fn(i);
  }
  return html;
});
//1 index counter
hbs.registerHelper("counter", function (index){
    return index + 1;
});

app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name: 'session',
  secret: config.sessionSecret,
  //14 Days
  maxAge: 1000*60*60*24*14
}));
//app.use(compression());

app.use(require("./routes"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.layout = "layoutFront";
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.redirect('404');
  return;
});

module.exports = app;
