// requirements for user model
var express     = require('express');
var bodyParser  = require('body-parser');

// custom modules
var providersModel   = require('../models/providers');
var Validate      = require('../validators/userValidation');
var authenticate = require('../middlewares/provider_passport');

// user route settings
var providersRouter = express.Router();
providersRouter.use(bodyParser.json());

providersRouter.post('/signup', (req, res, next) => {
  console.log(req.body)
  const { errors, isValid } = Validate(req.body);

  if(!isValid) {
    return res.status(400).json(errors);
  }
  providersModel.register(new providersModel(req.body), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
      (authenticate.authenticatProvider)(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'you are successfully signed up'});
      });
    }
  });
});

  providersRouter.post('/login', (req, res, next) => {
    // let token = authenticate.generateToken({_id: req.user._id});
    providersModel.findOne({ phone: req.body.phone }, function (err, user) {
        if (err) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: false, status: 'Unable to login'});
        }
        else if (!user || user.password !== req.body.password ) { 
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: false, status: 'wrong username or password'});
        }
        else {
          console.log(req.body.password, user.password);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Successfully Logged in..!!!'});
        }
        return next;
      });
  });

module.exports = providersRouter;
