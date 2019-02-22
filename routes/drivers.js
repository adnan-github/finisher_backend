// requirements for user model
var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');

// custom modules
var userModel     = require('../models/users');
var Validate      = require('../validators/userValidation');
var authenticate  = require('../middlewares/passportMiddleware');

// user route settings
var driverRouter = express.Router();
driverRouter.use(bodyParser.json());

