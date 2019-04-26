var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');
var ObjectId    = require('mongoose').Types.ObjectId;

// custom modules
var agreementsModel     = require('../models/agreements');
var authenticate        = require('../middlewares/customer_passport');
var customers_Location  = require('../socket_controllers/customer_location').populateCustomersRecord;
var nearby_providers_Location  = require('../socket_controllers/provider_location').returnNearbyProviders;
// agreements route settings
var agreementsRouter = express.Router();
agreementsRouter.use(bodyParser.json());


// agreements route for new service
agreementsRouter.post('/initiate', async (request, response) => {
    let contract_id = '';
    let customer_location_data = {};
    customer_location_data.geometry = {};
    let created_agreement = {};
  
  let customer_details = await customers_Location(request.body.customer_id);
  let customer_object = {
    name            : customer_details.customerId.name,
    address         : customer_details.address,
    phone           : customer_details.customerId.phone,
    agreement_type  : request.body.agreement_type,
    category        : request.body.selected_service
};

  try {
     created_agreement = await agreementsModel.create(new agreementsModel({
      customer_id       : request.body.customer_id,
      selected_service  : request.body.selected_service,
      status            : 'pending',
      agreement_type    : request.body.agreement_type,
      agreement_rate    : request.body.agreement_rate
    }));
  } catch (error) {
    response.json({ success: false, message: 'unable to initiate agreement', error: error});
  }

  contract_id = created_agreement._id;
  customer_location_data.geometry.lat   = customer_details.coordinate.coordinates[1]; 
  customer_location_data.geometry.lng   = customer_details.coordinate.coordinates[0];

  let providers_list = await nearby_providers_Location(customer_location_data);
  console.log('this is newly sent providers list', providers_list);
  customer_object.agreement_id = created_agreement._id;
  io.sockets.to(providers_list[0].socketId).emit('action', { type: 'SERVICE_AGREEMENT_REQUEST', data: customer_object });
  // checking if agreenent is assigned to a provider else the request will be sent
  // to next provider
  let contract_status = '';
  for ( loop = 0; loop <= providers_list.length; loop ++) {
    if( contract_status !== '' ) {
      if( contract_status == 'accepted') { 
        response.json({ success: true, message: 'provider accepted your request'});
      } else {
        response.json({ success: false, message: 'no providers are available at this time'});
      }
      break;
    }
    else{
      setTimeout( async () => {
        let agreement = await agreementsModel.findById({ _id: ObjectId(contract_id)});
        console.log('status of agreement', agreement.status);
        if ( loop == providers_list.length ) {
              if( agreement.status == 'accepted') {
                contract_status = agreement.status;
              } else {
                agreementsModel.deleteOne({ _id: ObjectId(contract_id)});
                contract_status = agreement.status;
              }
            } else if ( agreement.status == 'pending' && loop !== providers_list.length) {
              io.sockets.to(providers_list[i].socketId).emit('action', { type: 'SERVICE_AGREEMENT_REQUEST', data: customer_object})
            } else if ( agreement.status == 'accepted' && loop !== providers_list.length ) {
                contract_status = agreement.status;  
            }
      }, 10000);
    }
  }

});

// agreements route for delete service
agreementsRouter.delete('/remove', (req, res, next) => {

  agreementsModel.deleteOne(req.body,(err) => {
    if (err) {
      res.json({success: false, message: 'unable to delete the agreement', error: err});
    } else {
        res.json({ success: true, message: 'deleted successfully'});
    }
  });
});


// agreements route to get all service
agreementsRouter.get('/all', (req, res, next) => {

  agreementsModel.find({},(err, agreements) => {
    if (err) {
      res.json({success: false, message: 'unable to get lists of agreements', error: err});
    } else {
        res.json({ success: true, message: 'ok', data:agreements});
    }
  });
});

// services route for find one service
agreementsRouter.get('/:id', (req, res, next) => {
    agreementsModel.findById({_id: req.params.id},(err, agreements) => {
      if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false , message: 'unable to get the agreement', error: err});
      } else {
          res.json({ success: true, message: 'ok', data:agreements});
      }
    });
  });


  // route to confirm the agreement between provider and customer
  agreementsRouter.post('/confirmAgreement', ( req, res ) => {
      let payload = req.body;
      console.log('----->', req.body);
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