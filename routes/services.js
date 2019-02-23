// requirements for user model
var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');

// custom modules
var servicesModel     = require('../models/services');
var authenticate  = require('../middlewares/user_passport');
// services route settings
var servicesRouter = express.Router();
servicesRouter.use(bodyParser.json());


// services route for new service
servicesRouter.post('/addNew', (req, res, next) => {

  servicesModel.create(new servicesModel(req.body),(err, service) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
        res.json({ success: true, status: 'service created successfully'});
    }
  });
});

// services route for delete service
servicesRouter.delete('/remove', (req, res, next) => {

  servicesModel.deleteOne(req.body,(err) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
        res.json({ success: true, message: 'deleted successfully'});
    }
  });
});


// services route for get all service
servicesRouter.get('/all', (req, res, next) => {

  servicesModel.find({},(err, services) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
        res.json({ success: true, message: 'ok', data:services});
    }
  });
});

// services route for find one service
servicesRouter.get('/:id', (req, res, next) => {
 
  servicesModel.findById({id: req.params.id},(err, services) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
        res.json({ success: true, message: 'ok', data:services});
    }
  });
});

module.exports = servicesRouter;