// requirements for user model
var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');
var jwt_decode  = require('jwt-decode');
var mongoose    = require('mongoose');
// custom modules
var userModel     = require('../models/users');
var Validate      = require('../validators/userValidation');
var authenticate  = require('../middlewares/user_passport');
// user route settings
var userRouter = express.Router();
userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// signup route for user
userRouter.post('/signup', (req, res, next) => {

  const { errors, isValid } = Validate(req.body);

  if(!isValid) {
    return res.status(400).json(errors);
  }
  userModel.register(new userModel(req.body), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
      (authenticate.authenticateUser)(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'you are successfully signed up'});
      });
    }
  });
});

// Route to login and create session for the user
userRouter.post('/login', authenticate.authenticateUser, (req, res, next) => {
  let token = authenticate.user_generateToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'Successfully Logged in..!!!'});
});
// logout user and destroy the session
userRouter.get('/logout', (req, res, next) => {
  if (req.session !== undefined) {
    // on logout . destroy session and stored cookie, redirect to homepage
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    // if user is already logged out then we will create this error to be sent to error handler middleware
    var err = new Error('you are not logged in');
    err.status = 403;
    next(err);
  }
});

userRouter.get('/userInfo', (req, res, next) => {
  const payload = req.headers.authorization;
  const token = payload.split(' ')[1];
  var decoded_payload = jwt_decode(token);
  _id = (decoded_payload._id);
  userModel.findById(_id, function(err, user){
    if(err){
      res.statusCode(400);
      res.json({ success: false , message: "login FAILED"})
      return;
    }
    res.json({user: user , message: "user info"});
  });
});

module.exports = userRouter;