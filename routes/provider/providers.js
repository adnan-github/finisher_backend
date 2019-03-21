var express     = require('express');
var bodyParser  = require('body-parser');
var multer      = require('multer');
var jwt_decode  = require('jwt-decode');
var fs          = require('fs');
var path        = require('path');
var { Storage } = require('@google-cloud/storage');

// custom modules
var providersModel    = require('../../models/providers');
var Validate          = require('../../validators/userValidation');
var authenticate      = require('../../middlewares/provider_passport');

var providersLocationModel = require('../../models/providersLocation');

// provider route settings
var providersRouter = express.Router();
providersRouter.use(bodyParser.json());


var storage = new Storage({
  projectId   : process.env.GCLOUD_PROJECT,
  keyFilename : process.env.GCS_KEYFILE,
  keyFile     : process.env.GCS_KEYFILE
});

var my_bucket = storage.bucket(process.env.GCS_BUCKET)


const multerStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './cnic_images')
  },
  filename(req, file, callback) {
    callback(null, `${file.originalname}`)
  },
});

const upload = multer({
  storage: multerStorage,
  limits:{fileSize: 100000000},
}).fields([{
  name: 'cnic_front',
  maxCount: 1
}, {
  name: 'cnic_back',
  maxCount: 1
}]);

providersRouter.post('/cnicupload', upload, (req, res) => {

  var files_url     = [], 
  errors_array  = [];
    fs.readdir('./cnic_images', (err, files) => {

      // if error in reading images directory
      if(err) {
        res.statusCode = 400;
        res.json({ success : false, message : 'unable to upload images', error   : err })
        console.log(err)
      }
      // read all the files in images folder and upload it to google cloud storage one by one    
      files.forEach( ( file, index ) => {
        console.log(file);
        if( file.split('.')[1] == 'jpeg' ) {
          console.log('here');
          const file_path = 'cnic_images/'+ file;
        my_bucket.upload(file_path, ( err, file) => {
          if (err) {
            res.statusCode = 400;
            res.json({ success : false, message : 'unable to upload images', error   : err });
          } else {
            let publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${file.metadata.name}`;
            files_url.push(publicUrl);
            if(file.metadata.name){
              fs.unlink(path.join('./cnic_images', file.metadata.name), err => {
                errors_array.push(err);
              });
              if(files_url.length == 2){
                res.statusCode = 200;
                res.json({ success : true, message : 'successfully uploaded images', data : files_url })
              }  
            }
          }
        })
        }
      });
    });
});

providersRouter.post('/signup', upload, (req, res, next) => {


  providersModel.register(new providersModel(req.body), req.body.password, (err, provider) => {
    if (err) {
      console.log(err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, message: 'unable to signup', error: err});
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
      console.log(provider);
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
        else if (provider.isVerified == false ){
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: false, message: 'your account is not verified'});
        }
        else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, token: token, status: 'Successfully Logged in..!!!'});

        }
      });
  });

  providersRouter.get('/info', (req, res, next) => {
    const payload = req.headers.authorization;
    const token   = payload.split(' ')[1];
    const decoded_payload = jwt_decode(token);
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
      else {
        res.json({provider: provider , message: "provider info"});
      }
      
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
 
  providersRouter.delete('/deleteAll', ( req, res ) => {
    providersModel.deleteMany({}, (err, ress) => {
      res.json({ success: true, message: 'deleted all the providers'});
    })
  });

  
  providersRouter.delete('/deleteAllLocations', ( req, res ) => {
    providersLocationModel.deleteMany({}, (err, ress) => {
      res.json({ success: true, message: 'deleted all the provider Locations'});
    })
  });
module.exports = providersRouter;
