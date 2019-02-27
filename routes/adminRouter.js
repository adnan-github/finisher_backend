// requirements for user model
var express     = require('express');
var bodyParser  = require('body-parser');

// custom modules
var adminsModel   = require('../models/admin');
var Validate      = require('../validators/userValidation');
var authenticate = require('../middlewares/admin_passport');

// user route settings
var adminsRouter = express.Router();
adminsRouter.use(bodyParser.json());

adminsRouter.post('/signup', (req, res, next) => {
  // const { errors, isValid } = Validate(req.body);

  // if(!isValid) {
  //   return res.status(400).json(errors);
  // }
  adminsModel.register(new adminsModel(req.body), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
      (authenticate.authenticatadmin)(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'you are successfully signed up'});
      });
    }
  });
});

  adminsRouter.post('/login', authenticate.authenticatadmin, (req, res, next) => {
    // let token = authenticate.generateToken({_id: req.user._id});
    adminsModel.findOne({ username: req.body.username }, function (err, user) {
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
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Successfully Logged in..!!!'});
        }
        return next;
      });
  });

  adminsRouter.get('/adminInfo', (req, res, next) => {
    const payload = req.headers.authorization;
    const token = payload.split(' ')[1];
    var decoded_payload = jwt_decode(token);
    _id = (decoded_payload._id);
    adminsModel.findById(_id, function(err, admin){
      if(err){
        res.statusCode(400);
        res.json({ success: false , message: "login FAILED"})
        return;
      } else if(!admin) {
        res.json({ success: false , message: "admin not found"})
        return;
      }
      res.json({admin: admin , message: "admin info"});
    });
  });
  
 
module.exports = adminsRouter;
