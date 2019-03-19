var express     = require('express');
var bodyParser  = require('body-parser');

// custom modules
var adminsModel   = require('../../models/admin');
var providersModel = require('../../models/providers');
var Validate      = require('../../validators/userValidation');
var authenticate = require('../../middlewares/admin_passport');

// admin route settings
var adminsRouter = express.Router();
adminsRouter.use(bodyParser.json());

adminsRouter.post('/signup', (req, res, next) => {
  
  adminsModel.register(new adminsModel(req.body), req.body.password, (err, admin) => {
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

    let token = authenticate.admin_generateToken({_id: req.user._id});
    adminsModel.findOne({ username: req.body.username }, function (err, admin) {
        if (err) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: false, status: 'Unable to login'});
        }
        else if (!admin || admin.password !== req.body.password ) { 
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: false, status: 'wrong username or password'});
        }
        else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, token:token, status: 'Successfully Logged in..!!!'});
        }
        return next;
      });
  });

  adminsRouter.get('/info', (req, res, next) => {
    const payload = req.headers.authorization;
    const token   = payload.split(' ')[1];
    const decoded_payload = jwt_decode(token);
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

  adminsRouter.get('/requestList', (req, res, next) => {
    
    providersModel.find({}, function(err, admin){
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

  adminsRouter.get('/request', (req, res, next) => {
    console.log(req.params, req.query)
    providersModel.findById({_id: req.query.id }, function(err, provider){
      if(err){
        res.statusCode = 400;
        res.json({ success: false , message: "Could not find provider", error: err.name })
        return;
      } else if(!provider) {
        const err = new Error(' no provider found');
        res.json({ success: false , message: "No provider found with provider id", error: err})
        return;
      }
      res.json({ success: true, provider: provider , message: "provider info"});
    }).select('-password -createdAt -updatedAt');
  });

  adminsRouter.post('/approveRequest', (req, res, next) => {
    const payload = req.body;
    providersModel.findByIdAndUpdate(payload.id, { $set: payload }, ( err, response ) => {
      if ( err || !response.isVerified ){
        console.log(err);
        res.statusCode = 500;        
        res.json({ success: false, message: 'provider has not been verified' });
      } else {
        res.json({ success: true, message: 'provider has been updated', data: response });
      }
    }).select('-password -_id -createdAt -updatedAt');
    next();
  });
  
 
module.exports = adminsRouter;
