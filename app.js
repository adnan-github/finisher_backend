// requirements
const path        = require('path');
const cors        = require('cors');
const helmet      = require('helmet');
const logger      = require('morgan');
const express     = require('express');
const passport    = require('passport');
const createError = require('http-errors');
const compression = require('compression');
const dotenv      = require('dotenv').config({ debug: process.env.DEBUG });
const swaggerUi   = require('swagger-ui-express');

// routes
const customersRouter     = require('./routes/customer/customers');
const indexRouter         = require('./routes/index');
const servicesRouter      = require('./routes/services');
const agreementsRouter    = require('./routes/agreements');
const providersRouter     = require('./routes/provider/providers');
const adminRouter         = require('./routes/admin/adminRouter');
const promocodesRouter    = require('./routes/promoCodes');
const feedbackRouter      = require('./routes/feedback');
const contractsRouter     = require('./routes/contracts');


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
app.use('/api/contracts', contractsRouter);
mongoConnect();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(express.static((__dirname + '/js')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'idImages')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.get('/api/documentation',function(req,res) {
  res.sendFile('./docs/index.html');
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