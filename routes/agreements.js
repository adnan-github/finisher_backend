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
agreementsRouter.post('/initiate', (request, response, next) => {
  
  customers_Location(request.body.customer_id).then( data => {
    let contract_id = '';
    let customer_location_data = {};
    customer_location_data.geometry = {};

    let customer_object = {
          name            : data.customerId.name,
          address         : data.address,
          phone           : data.customerId.phone,
          agreement_type  : request.body.agreement_type,
          category        : request.body.selected_service
    };

    agreementsModel.create(new agreementsModel({
            customer_id       : request.body.customer_id,
            selected_service  : request.body.selected_service,
            status            : 'pending',
            agreement_type    : request.body.agreement_type,
            agreement_rate    : request.body.agreement_rate
    //       socketId          : data.socketId
      }), (err, data ) => {
        if ( err ){
          response.json({ success: false, message: 'unable to initiate agreement ', err: err});
        }
        else {
          contract_id = data._id;
          
        }
      }); // agreement creation request ends here 
  
    customer_location_data.geometry.lat = data.coordinate.coordinates[1]; 
    customer_location_data.geometry.lng = data.coordinate.coordinates[0];
    
    console.log(customer_location_data)
    nearby_providers_Location(customer_location_data).then(provider => {
      console.log('', provider)
      customer_object.agreement_id = contract_id;
      io.sockets.to(provider[0].socketId).emit('action', { type: 'SERVICE_AGREEMENT_REQUEST', data: customer_object });
      for (let i = 0; i < provider.length; i++) {
        setTimeout(() => {
            if ( i > 0 && i <= provider.length) {
              agreementsModel.findById({ _id: ObjectId(contract_id)}, ( err, data ) => {
                if(err) {
                  console.log(err)
                  response.json({ success: false, message: 'No Providers are available at this time', error: err});
                  return;
                } else {
                  if(data.status == 'accepted') {
                    response.json({ success: true, message: 'agreement initiated successfully'});
                    return;
                  }
                  else if(data.status == 'pending' && !provider[i]){              
                    agreementsModel.deleteOne({ _id: ObjectId(contract_id)}, (err, data) => {
                      if(data){
                        response.json({ success: false, message: 'No Providers are available at this time'});
                        return;
                      }
                    });
                  } else if (provider[i] && data.status == 'pending') {
                    io.sockets.to(provider[i].socketId).emit('action', { type: 'SERVICE_AGREEMENT_REQUEST', data: customer_object });
                  }
                }              
              })
            } else {
              response.json({ success: false, message: 'No Providers are available at this time'});
            }
        }, 10000);
      }
     
    }).catch(error => {
      console.log('error', customer_location_data)
    });
    // initiating the agreement
    //   
  }).catch(err => {
    console.log(err)
    response.json({error : err} )
  });
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