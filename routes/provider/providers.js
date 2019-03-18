var express     = require('express');
var bodyParser  = require('body-parser');
var multer      = require('multer');
var jwt_decode  = require('jwt-decode');
var googleStore = require('multer-google-storage');

// custom modules
var providersModel    = require('../../models/providers');
var Validate          = require('../../validators/userValidation');
var authenticate      = require('../../middlewares/provider_passport');

// provider route settings
var providersRouter = express.Router();
providersRouter.use(bodyParser.json());

const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './idImages')
  },
  filename(req, file, callback) {
    console.log(file, "imag")
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
  },
});

// const upload = multer({
//   storage: Storage,
//   limits:{fileSize: 100000000},
// }).fields([{
//   name: 'cnic_front',
//   maxCount: 1
// }, {
//   name: 'cnic_back',
//   maxCount: 1
// }])

const upload = multer({
  storage : googleStore.storageEngine({
    projectId   : 'finisherpro-1550657571178',
    bucket      :  'finisher-images',
    keyFilename :  '../../google_bucket.json',
    maxRetries  : 2,
    autoRetry   : true
  }),
  limits  :{fileSize: 100000000}
}).fields([
  { name      : 'cnic_front', 
    maxCount  : 1 
  }, 
  { name      : 'cnic_back', 
    maxCount  : 1
  }
]);

providersRouter.post('/cnicupload', upload, (req, res) => {
      console.log(req.body, req.file);
      res.statusCode = 200;
      res.json({ success: true, message: 'images uploaded successfully'});
});

providersRouter.post('/signup', upload, (req, res, next) => {

  const { errors, isValid } = Validate(req.body);

  if(!isValid) {
    return res.status(400).json(errors);
  }
  providersModel.register(new providersModel(req.body), req.body.password, (err, provider) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
      console.log(err)
    } else {
      (authenticate.authenticatProvider)(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'you are successfully signed up', data: provider });
      });
    }
  });
});


  providersRouter.post('/login', authenticate.authenticatProvider, (req, res, next) => {
    let token = authenticate.provider_generateToken({_id: req.user._id});
    providersModel.findOne({ username: req.body.username }, function (err, provider) {
        if (err) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: false, status: 'Unable to login'});
        }
        else if (!provider || provider.password !== req.body.password ) { 
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: false, status: 'wrong username or password'});
        }
        else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, token: token, status: 'Successfully Logged in..!!!'});
        }
        return next;
      });
  });

  providersRouter.get('/info', (req, res, next) => {
    const payload = req.headers.authorization;
    const token = payload.split(' ')[1];
    var decoded_payload = jwt_decode(token);
    _id = (decoded_payload._id);
    providersModel.findById(_id, function(err, provider){
      if(err){
        res.statusCode(400);
        res.json({ success: false , message: "login FAILED"})
        return;
      } else if(!provider) {
        res.json({ success: false , message: "provider not found"})
        return;
      }
      res.json({provider: provider , message: "provider info"});
    });
  });

  providersRouter.get('/checkphone', ( req, res, next ) => {
    const data = req.query;
    console.log(data)
    providersModel.find({ phone: data.phone }, (err, user ) => {
      if ( user.phone ){
        res.status = 200;
        res.json({
          success : true,
          message : 'phone number correct'
        });
      } else {
        console.log(err)
        res.status = 404;
        res.json({
          success : false,
          message : 'phone number not found for the associated account'
        });
      }
    });
  });
  
  providersRouter.put('/updatepassword', ( req, res, next ) => {
    const data = req.body;
    providersModel.findByIdAndUpdate( data.provider_id, { password  : data.password }, (err, user ) => {
      if ( user._id ){
        res.status = 200;
        res.json({
          success : true,
          message : 'password updated',
          provider_id : user._id
        });
      } else {
        res.status = 404;
        res.json({
          success : false,
          message : 'unable to update password'
        });
      }
    }).select('_id');
  });
 
module.exports = providersRouter;
