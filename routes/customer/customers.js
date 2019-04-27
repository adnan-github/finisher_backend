var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');
var jwt_decode  = require('jwt-decode');
var mongoose    = require('mongoose');
let expo_sdk    = require('expo-server-sdk');
// custom modules

var sendSMS           = require('../../utils/sendSMS');
var customerModel     = require('../../models/customers');
var phoneVerifyModel  = require('../../models/phoneVerify');
var authenticate      = require('../../middlewares/customer_passport');

var { signup_message, phone_verification_message, customer_signup_message }  = require('../../utils/message_store');
// customer route settings
var customerRouter = express.Router();
customerRouter.use(bodyParser.json());

/* GET customers listing. */
customerRouter.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// signup route for customers
customerRouter.post('/signup', (req, res, next) => {

  customerModel.register(new customerModel(req.body), req.body.password, (error, Customer) => {

    if (error) {
      console.log(error)
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: false, message: 'unable to signUp', error: error});
    } else {
      (authenticate.authenticateCustomer)(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        let customer = {};
        customer.name = Customer.name;
        customer.phone = Customer.username;
        res.json({ success: true, status: 'you are successfully signed up', customer});
        sendSMS.sendSMSToPhone( Customer.username, customer_signup_message( Customer.name ));
      });
    }
  });
});

// Route to login and create session for the Customer
customerRouter.post('/login', authenticate.authenticateCustomer, (req, res, next) => {
  customerModel.findOne({ username: req.body.username }, function (err, customer) {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: false, message: 'Unable to login, please provide credentials again'});
    }
    else if (!customer || customer.password !== req.body.password ) {
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: false, message: 'wrong username or password'});
    }
    else if (customer.isVerified == false ){
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: false, message: 'your account is not verified'});
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      let token = authenticate.customer_generateToken({_id: customer._id});
      res.json({ success: true, token: token, message: 'Successfully Logged in..!!!'});

    }
  });
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

customerRouter.post('/verifyPhone', async (req, res) => {
  let generatedCode = Math.floor(1000 + Math.random() * 9000);
  let query   = { phone: req.body.phone },
      update  = { code: generatedCode },
      options = { upsert: true, new: true, setDefaultsOnInsert: true };
  
      let customer = await customerModel.findOne({ username: req.body.phone}, 'username');
      if(customer && customer.username){
        res.json({ success: false, message: 'phone number already in use', data: customer.username, exists: true });
      } else if( !customer ){
        try {
          let phoneData = await phoneVerifyModel.findOneAndUpdate(query, update, options).select('phone code -_id');  
          let SMSResponse = await sendSMS.sendSMSToPhone( phoneData.phone, phone_verification_message ( phoneData.code));
          if ( SMSResponse.type == 'success') {
            res.json({ success: true, message: 'phone added to DB', data: phoneData.phone});
          } else {
            res.json( { success: false, message: 'unable to add phone to the db', error: SMSResponse.response})
          }
        } catch (error) {
          res.json({ success: false, message: 'error in updating database', error: error });    
        }
        
      }
});

customerRouter.post('/matchCode', (req, res) => {
  phoneVerifyModel.findOne({ phone: req.body.phone }, 'code -_id').exec((error, response) => {
    if(error || response.code != req.body.code || response == null ){
      res.setHeader('Content-Type', 'application/json');
      res.json({  success: false, message: 'The Code you provided did not match' , error: error  });
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, message: 'Phone has been verified successfully', data: response });
    }
  });
});

customerRouter.delete('/deleteByNumber', (req, res) => {
  customerModel.deleteOne({ username: req.body.phone }, ( error, data ) => {
    if (error){
      res.json({ success: false, message: 'error in deleteing user', error: error })
    } else if ( data ) {
      res.json({ success: true, message: 'successfully deleted the customer', data: data.deletedCount})
    }
  });
});

customerRouter.post('/pushNotificationToken', async (req, res) => {

  if ( !expo_sdk.Expo.isExpoPushToken( req.body.push_token ) )
    res.json({ success: false, message: 'provided token is not a valid expo push notification token', data: req.body.push_token});

  let query     = { username: req.body.phone },
      update    = { push_token: req.body.push_token },
      options   = { upsert: true, new: true };

  let customer  = await customerModel.findOneAndUpdate( query, update, options ).select('-_id username push_token');
  if ( customer.push_token ){
    res.json({ success: true, message: 'successfully added push notification id', data: customer});
  } else {
    res.json({ success: false, message: 'unable to add push notification id'})
  }
});

module.exports = customerRouter;