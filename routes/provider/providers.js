// requirements for user model
var express     = require('express');
var bodyParser  = require('body-parser');
var multer      = require('multer');
var jwt_decode  = require('jwt-decode');

// custom modules
var providersModel    = require('../../models/providers');
var Validate          = require('../../validators/userValidation');
var authenticate      = require('../../middlewares/provider_passport');

// user route settings
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
  storage: Storage,
  limits:{fileSize: 100000000}
}).single('cnic_front')
providersRouter.post('/cnicupload', upload, (req, res) => {
      console.log(req.body, req.file);
});

providersRouter.post('/signup', upload, (req, res, next) => {

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


  providersRouter.post('/login', authenticate.authenticatProvider, (req, res, next) => {
    // let token = authenticate.generateToken({_id: req.user._id});
    let token = authenticate.provider_generateToken({_id: req.user._id});
    providersModel.findOne({ username: req.body.username }, function (err, user) {
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
          res.json({ success: true, token: token, status: 'Successfully Logged in..!!!'});
        }
        return next;
      });
  });

  providersRouter.get('/providerInfo', (req, res, next) => {
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
  
 
module.exports = providersRouter;
