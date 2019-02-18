// requirements for user model
var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');

// custom modules
var userModel     = require('../models/users');
var Validate      = require('../validators/userValidation');
var authenticate  = require('../middlewares/passportMiddleware');
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
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'you are successfully signed up'});
      });
    }
  });
});

// Route to login and create session for the user
userRouter.post('/login', passport.authenticate('local'), (req, res, next) => {
  console.log(req, res)
  let token = authenticate.generateToken({_id: req.user._id});
  res.statusCode = 200;
  console.log('asdsad', token, req.user._id);
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'Successfully Logged in..!!!'});
});
// logout user and destroy the session
userRouter.get('/logout', (req, res, next) => {
  if (req.session !== undefined) {
    // on logout . destroy session and stored cookie, redirect to homepage
    req.session.destroy();
    console.log(req.session);
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    // if user is already logged out then we will create this error to be sent to error handler middleware
    var err = new Error('you are not logged in');
    err.status = 403;
    next(err);
  }
});

module.exports = userRouter;