// requirements
var path        = require('path');
var logger      = require('morgan');
var express     = require('express');
var passport    = require('passport');
var createError = require('http-errors');
// var cookieParser  = require('cookie-parser');

// routes
var usersRouter         = require('./routes/users');
var indexRouter         = require('./routes/index');
var servicesRouter      = require('./routes/services');
var homeServicesRouter  = require('./routes/homeServices');
var agreementsRouter    = require('./routes/agreements');
var providersRouter     = require('./routes/providers');
var adminRouter         = require('./routes/adminRouter');

//middlwares
var mongoConnect = require('./middlewares/mongoConnect');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

// app.use(cookieParser("12345-abcde-67890-fghij"));


app.use(passport.initialize());
// routes that don't need authentication and can be accessed without it

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/homeServices', homeServicesRouter);
app.use('/api/agreements', agreementsRouter);
app.use('/api/providers', providersRouter);
app.use('/api/admins', adminRouter);

mongoConnect();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(express.static(path.join(__dirname, 'public')));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status = err.status || 500;
  res.render('error');
});

module.exports = app;