var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');
var jwt_decode  = require('jwt-decode');
var mongoose    = require('mongoose');
// custom modules
var customerModel     = require('../../models/customers');
var phoneVerifyModel  = require('../../models/phoneVerify');
var authenticate      = require('../../middlewares/customer_passport');
// customer route settings
var customerRouter = express.Router();
customerRouter.use(bodyParser.json());

/* GET customers listing. */
customerRouter.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// signup route for customers
customerRouter.post('/signup', (req, res, next) => {
  console.log(req.body);
  customerModel.register(new customerModel(req.body), req.body.password, (err, Customer) => {

    if (err) {
      console.log(err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
      (authenticate.authenticateCustomer)(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'you are successfully signed up'});
      });
    }
  });
});

// Route to login and create session for the Customer
customerRouter.post('/login', authenticate.authenticateCustomer, (req, res, next) => {
  let token = authenticate.customer_generateToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'Successfully Logged in..!!!'});
});

// logout customer and destroy the session
customerRouter.get('/logout', (req, res, next) => {
  if (req.session !== undefined) {
    // on logout . destroy session and stored cookie, redirect to homepage
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    // if customer is already logged out then we will create this error to be sent to error handler middleware
    var err = new Error('you are not logged in');
    err.status = 403;
    next(err);
  }
});

customerRouter.get('/info', (req, res, next) => {
  const payload = req.headers.authorization;
  const token = payload.split(' ')[1];
  var decoded_payload = jwt_decode(token);
  _id = (decoded_payload._id);
  customerModel.findById(_id, function(err, customer){
    if(err){
      res.statusCode(400);
      res.json({ success: false , message: "login FAILED"})
      return;
    } else if(!customer) {
      res.json({ success: false , message: "customer not found"})
      return;
    }
    res.json({customer: customer , message: "customer info"});
  });
});

customerRouter.get('/all', (req, res) => {
  customerModel.find({}, ( err, customers ) => {
    if ( customers) {
      res.statusCode = 200;
      res.json({ success: true, message: 'customers retrieved successfully', customers: customers});
    } else {
      res.statusCode = 404;
      res.json({ success : false, message: 'no customers found'});
    }
  });
});

customerRouter.post('/verifyPhone', (req, res) => {
  let generatedCode = Math.floor(1000 + Math.random() * 9000);
  console.log('here')
  let query   = { phone: req.body.phone },
      update  = { code: generatedCode },
      options = { upsert: true, new: true, setDefaultsOnInsert: true };
  
  customerModel.findOne({ username: req.body.phone }, 'username').exec(function (error, customer) {
    console.log(!customer)
    if(customer && customer.username){
      res.json({ success: false, message: 'phone number already in use', data: customer.username });
    } else if(error) {
      res.json({ success: false, message: 'error in updating database', error: error });
    } else if( !customer ){
      phoneVerifyModel.findOneAndUpdate(query, update, options, ( error, phoneData ) => {
        if (error) {
          res.setHeader('Content-Type', 'application/json');
          res.json({  success: false, message: 'unable to add phone to db', error: error  });
        } else {
          console.log("sending code");
          sendSMS.sendSMSToPhone( phoneData.phone, phone_verification_message( phoneData.code ));
            res.json({ success: true, status: 'phone added to DB', data: phoneData.phone});
        }
      }).select('phone code -_id');
    }
  });
});



module.exports = customerRouter;