// requirements for user model
var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser'); 

// custom modules
var homeServicesModel     = require('../models/homeServices');
var authenticate  = require('../middlewares/passportMiddleware');
// homeServices route settings
var homeServicesRouter = express.Router();
homeServicesRouter.use(bodyParser.json());


// homeServices route for new service
homeServicesRouter.post('/addNew', (req, res, next) => {
    console.log(req.body);

  homeServicesModel.create(new homeServicesModel(req.body),(err, service) => {
    console.log(service);
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
        res.json({ success: true, status: 'home service created successfully'});
    }
  });
});

// homeServices route for delete service
homeServicesRouter.delete('/remove', (req, res, next) => {

  homeServicesModel.deleteOne(req.body,(err) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
        res.json({ success: true, message: 'deleted successfully'});
    }
  });
});


// homeServices route for get all service
homeServicesRouter.get('/all', (req, res, next) => {

  homeServicesModel.find({},(err, homeServices) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
        res.json({ success: true, message: 'ok', data:homeServices});
    }
  });
});

// home services route for find one service
homeServicesRouter.get('/:id', (req, res, next) => {
 
    homeServicesModel.findById({id: req.params.id},(err, homeServices) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      } else {
          res.json({ success: true, message: 'ok', data:homeServices});
      }
    });
  });

module.exports = homeServicesRouter;