var express     = require('express');
var bodyParser  = require('body-parser');



// custom modules
var adminsModel     = require('../../models/admin');
var providersModel  = require('../../models/providers');
var Validate        = require('../../validators/userValidation');
var authenticate    = require('../../middlewares/admin_passport');

