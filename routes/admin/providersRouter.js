// requirements for user model
var express     = require('express');
var bodyParser  = require('body-parser');

// custom modules
var adminsModel   = require('../../models/admin');
var Validate      = require('../../validators/userValidation');
var authenticate = require('../../middlewares/admin_passport');

// user route settings
var adminsRouter = express.Router();
adminsRouter.use(bodyParser.json());
``
  adminsRouter.get('/providersList', (req, res, next) => {
    
    adminsModel.find({}, function(err, admin){
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
