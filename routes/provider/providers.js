var fs          = require('fs');
var path        = require('path');
var multer      = require('multer');
var express     = require('express');
var bodyParser  = require('body-parser');
var jwt_decode  = require('jwt-decode');
var { Storage } = require('@google-cloud/storage');


// custom modules
var sendSMS           = require('../../utils/sendSMS');
var providersModel    = require('../../models/providers');
var phoneVerifyModel  = require('../../models/phoneVerify');
var authenticate      = require('../../middlewares/provider_passport');

var { signup_message, phone_verification_message }  = require('../../utils/message_store');

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

const profileImageStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './profile_images')
  },
  filename(req, file, callback) {
    callback(null, `${file.originalname}`)
  },
});
// multer config to upload profile and cnic images
const cnic_upload = multer({
  storage: multerStorage,
  limits:{fileSize: 5 * 1024 * 1024 },
}).fields([{
  name: 'cnic_front',
  maxCount: 1
}, {
  name: 'cnic_back',
  maxCount: 1
}]);

const profile_image = multer({
  storage : profileImageStorage,
  limits  : {fileSize: 5 * 1024 * 1024 },
}).fields([{
  name: 'profile_image',
  maxCount: 1
}]);

providersRouter.post('/uploadProfileImage', profile_image, (req, res) => {
  var files_url     = [], 
      errors_array  = [];

      fs.readdir('./profile_images', (err, files) => {
        if(err) {
          res.json({ success: false, message: 'unable to upload cnic', error: err});
          return;
        }
        files.forEach(( file, index ) => {
          if(file.split('.')[1] == 'jpeg'){
            const file_path = 'profile_images/' + file;
            my_bucket.upload(file_path, (err, file) => {
              if(err){
                res.json({ success : false, message : 'unable to upload images', error   : err });
              } else {
                let publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${file.metadata.name}`;
                files_url.push(publicUrl);
                if(file.metadata.name){
                  fs.unlink(path.join('./profile_images', file.metadata.name), err => {
                    errors_array.push(err);
                  });
                  if(files_url.length == 1){
                    res.statusCode = 200;
                    res.json({ success : true, message : 'successfully uploaded profile image', profile_image_url : files_url[0] })
                  }  
                }
              }
            });
          }
        });
      });
});

providersRouter.post('/cnicUpload', cnic_upload, (req, res) => {

  var files_url     = [], 
      errors_array  = [];
    fs.readdir('./cnic_images', (err, files) => {

      // if error in reading images directory
      if(err) {
        res.json({ success : false, message : 'unable to upload images', error   : err })
      }
      // read all the files in images folder and upload it to google cloud storage one by one    
      files.forEach( ( file, index ) => {
        if( file.split('.')[1] == 'jpeg' ) {
          const file_path = 'cnic_images/'+ file;
        my_bucket.upload(file_path, (err, file) => {
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

providersRouter.post('/signup', (req, res, next) => {


  providersModel.register(new providersModel(req.body), req.body.password, (err, provider) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, message: 'unable to signup', error: err});
    } else {
      (authenticate.authenticatProvider)(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        delete provider.password;
        delete provider.salt;
        delete provider.hash;
        delete provider.createdAt;
        delete provider.updatedAt;
        res.json({ success: true, status: 'you are successfully signed up', data: provider });
        sendSMS.sendSMSToPhone(provider.username, signup_message( provider.name));
      });
    }
  });
});


providersRouter.post('/login', (req, res, next) => {
    
    providersModel.findOne({ username: req.body.username }, function (err, provider) {
        if (err) {
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: false, message: 'Unable to login'});
        }
        else if (!provider || provider.password !== req.body.password ) {
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: false, message: 'wrong username or password'});
        }
        else if (provider.isVerified == false ){
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: false, message: 'your account is not verified'});
        }
        else {
          console.log('provider', provider);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          let token = authenticate.provider_generateToken({_id: provider._id});
          res.json({ success: true, token: token, message: 'Successfully Logged in..!!!'});
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
    providersModel.find({ phone: data.phone }, (err, user ) => {
      if ( user.phone ){
        res.status = 200;
        res.json({
          success : true,
          message : 'phone number correct'
        });
      } else {
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


providersRouter.post('/verifyPhone', (req, res) => {
  let generatedCode = Math.floor(1000 + Math.random() * 9000);
  let query   = { phone: req.body.phone },
      update  = { code: generatedCode },
      options = { upsert: true, new: true, setDefaultsOnInsert: true };
  
  providersModel.findOne({ username: req.body.phone }, 'username').exec(function (error, provider) {
    if(provider && provider.username){
      res.json({ success: false, message: 'phone number already in use', data: provider.username });
    } else if(error) {
      res.json({ success: false, message: 'error in updating database', error: error });
    } else if( !provider ){
      phoneVerifyModel.findOneAndUpdate(query, update, options, ( error, phoneData ) => {
        if (error) {
          res.setHeader('Content-Type', 'application/json');
          res.json({  success: false, message: 'unable to add phone to db', error: error  });
        } else {
          sendSMS.sendSMSToPhone( phoneData.phone, phone_verification_message( phoneData.code ));
            res.json({ success: true, status: 'phone added to DB', data: phoneData.phone});
        }
      }).select('phone code -_id');
    }
  });
});

providersRouter.post('/matchCode', (req, res) => {
  console.log('==>', req.body.code)
  phoneVerifyModel.findOne({ phone: req.body.phone }, 'code -_id').exec((error, response) => {
    console.log(response, error);
    if(error || response.code != req.body.code || response == null ){
      res.setHeader('Content-Type', 'application/json');
      res.json({  success: false, message: 'unable to match code', error: error  });
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, message: 'Phone has been verified successfully', data: response });
    }
  });
});

providersRouter.post('/deleteall', (req, res) => {
    providersModel.deleteMany({}, (err, data ) => {
      providersLocationModel.deleteMany({}, (err, user) => {
        res.json({ success: true, message: 'deleted'})
      })
      
    })
    
})
  

module.exports = providersRouter;
