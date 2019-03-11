var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');

// custom modules
var agreementsModel     = require('../models/agreements');
var authenticate  = require('../middlewares/customer_passport');
// agreements route settings
var agreementsRouter = express.Router();
agreementsRouter.use(bodyParser.json());


// agreements route for new service
agreementsRouter.post('/initiate', (req, res, next) => {

  var io = req.app.io;
  var nearByProviders = req.body.nearByProviders;

  agreementsModel.create(new agreementsModel({
    customer_id       : req.body.customer_id,
    selected_service  : req.body.selected_service,
    status            : "pending",
    agreement_type    : req.body.agreement_type
  }),(err, agreement) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {        
      nearByProviders.forEach(provider => {
        if( provider.socketId ){
          let driver_channel = provider.socketId + 'provider_request';
          io.emit( driver_channel , nearByProviders);
        }
        
      });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, status: 'agreement created successfully', agreement: agreement});
    }
  });
});

// agreements route for delete service
agreementsRouter.delete('/remove', (req, res, next) => {

  agreementsModel.deleteOne(req.body,(err) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
        res.json({ success: true, message: 'deleted successfully'});
    }
  });
});


// agreements route for get all service
agreementsRouter.get('/all', (req, res, next) => {

  agreementsModel.find({},(err, agreements) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    } else {
        res.json({ success: true, message: 'ok', data:agreements});
    }
  });
});

// services route for find one service
agreementsRouter.get('/:id', (req, res, next) => {
    agreementsModel.findById({_id: req.params.id},(err, agreements) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      } else {
          res.json({ success: true, message: 'ok', data:agreements});
      }
    });
  });

module.exports = agreementsRouter;