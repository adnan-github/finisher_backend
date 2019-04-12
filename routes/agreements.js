var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');

// custom modules
var agreementsModel     = require('../models/agreements');
var authenticate        = require('../middlewares/customer_passport');
var customers_Location  = require('../socket_controllers/customer_location').populateCustomersRecord;
// agreements route settings
var agreementsRouter = express.Router();
agreementsRouter.use(bodyParser.json());


// agreements route for new service
agreementsRouter.post('/initiate', (req, res, next) => {

  customers_Location(req.body.customer_id).then( data => {

    let customer_object = {
          name            : data.customerId.name,
          address         : data.address,
          phone           : data.customerId.phone,
          agreement_type  : req.body.agreement_type,
          category        : req.body.selected_service
    };

    // initiating the agreement
    agreementsModel.create(new agreementsModel({
        customer_id       : req.body.customer_id,
        selected_service  : req.body.selected_service,
        status            : 'pending',
        agreement_type    : req.body.agreement_type,
        socketId          : data.socketId
    }), (err, data ) => {
      if ( err ){
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      }
      else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        customer_object.agreement_id = data._id;
        res.json({ success: true, data: data._id, message: 'contract initiated'});
        nearByProviders.sockets.forEach( socketId => {
            io.sockets.to(socketId).emit('action', { type: 'SERVICE_AGREEMENT_REQUEST', data: customer_object });
        });
      }
    }); // agreement creation request ends here 

  }).catch(err => res.json(err ));
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


// agreements route to get all service
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


  // route to confirm the agreement between provider and customer
  agreementsRouter.post('/confirmAgreement', ( req, res ) => {
      let payload = req.body;
      agreementsModel.findByIdAndUpdate( { _id: payload.agreement_id } , { $set: {
        provider_Id : payload.provider_Id,
        status      : 'accepted' }
       }, (err, obj ) => {
        customers_Location(obj.customer_id).then( data => {
          res.status = 200;
          res.json({ success: true, data: data});
          io.sockets.to(data.socketId).emit('action', {
            type    : 'AGREEMENT_ACCEPTED',
            payload : req.body 
          });
        }).catch(err => {
          res.status = 404;
          res.json({ success: false, error: err});
        })
       }).select('customer_id -_id');
  });

module.exports = agreementsRouter;