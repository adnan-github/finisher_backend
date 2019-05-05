// requirements
var path        = require('path');
var cors        = require('cors');
var helmet      = require('helmet');
var logger      = require('morgan');
var express     = require('express');
var passport    = require('passport');
var createError = require('http-errors');
var compression = require('compression');
var dotenv      = require('dotenv').config({ debug: process.env.DEBUG });

// routes
var customersRouter     = require('./routes/customer/customers');
var indexRouter         = require('./routes/index');
var servicesRouter      = require('./routes/services');
var agreementsRouter    = require('./routes/agreements');
var providersRouter     = require('./routes/provider/providers');
var adminRouter         = require('./routes/admin/adminRouter');
var promocodesRouter    = require('./routes/promoCodes');
var feedbackRouter      = require('./routes/feedback');


//middlwares
var mongoConnect = require('./middlewares/mongoConnect');

var app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({
  limit: '50mb', extended: true
}));

// app.use(cookieParser("12345-abcde-67890-fghij"));


app.use(passport.initialize());


app.use('/', indexRouter);
app.use('/api/customers', customersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/agreements', agreementsRouter);
app.use('/api/providers', providersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/promocodes', promocodesRouter);
app.use('/api/feedback', feedbackRouter);
mongoConnect();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'idImages')));


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