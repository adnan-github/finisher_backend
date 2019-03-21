// requirements for customer model
var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');
var ObjectId    = require('mongoose').Types.ObjectId;
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
servicesRouter.delete('/deleteService', (req, res, next) => {

  servicesModel.deleteOne({ _id: ObjectId(req.query.id)}, (err, user) => {
    console.log('here');
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
  }).select('name perHour');
});

// services route for find one service
servicesRouter.get('/adminService', (req, res, next) => {
  servicesModel.findOne( { _id: ObjectId(req.query.id)},(err, service) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, message: 'got the rates', service: service});
    }
  }).select('name perHour _id');
});

servicesRouter.get('/service', (req, res, next) => {
  servicesModel.findOne( { name: req.query.service_name},(err, service) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, message: 'got the rates', service: { service_name: service.name, service_rate: service.perHour}});
    }
  }).select('name perHour -_id');
});

servicesRouter.put('/updateService', ( req, res ) => {
  console.log( '--------', req.body)
  servicesModel.findByIdAndUpdate( { _id : ObjectId(req.body.id)}, { $set: { perHour: req.body.perHour } }, { new: true }, ( error, service ) => {
    if( error ) {
      res.statusCode = 500;
      res.json({ success: false, message: 'Error in updating service', error: error });
    } else {
      res.statusCode = 200;
      res.json({ success: true, message: 'updated service successfully', data: service })
    }
  }).select('name -_id perHour');
});

module.exports = servicesRouter;