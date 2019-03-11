// requirements for customer model
var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');

// custom modules
var servicesModel     = require('../models/services');
var authenticate      = require('../middlewares/customer_passport');
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
servicesRouter.get('/service', (req, res, next) => {
  servicesModel.findOne( {name: req.query.service_name},(err, service) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
      console.log(service)
        res.json({ success: true, message: 'got the rates', service: { service_name: service.name, service_rate: service.perHour }});
    }
  });
});

module.exports = servicesRouter;