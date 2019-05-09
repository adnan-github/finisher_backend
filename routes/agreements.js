var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');
var ObjectId    = require('mongoose').Types.ObjectId;
var moment      = require('moment');

// custom modules
var promoModel        = require('../models/promoCodes'); 
var promoCode         = new promoModel();
var customer          = require('../models/customers');
var agreementsModel   = require('../models/agreements');  
var providersWithRequests = require('../models/providersWithRequests');
var customers_Location    = require('../socket_controllers/customer_location').populateCustomersRecord;
var nearby_providers_Location  = require('../socket_controllers/provider_location').returnNearbyProviders;

var sendSMS = require('../utils/sendSMS');
var { provider_arrived_message } = require('../utils/message_store');
// agreements route settings
var agreementsRouter = express.Router();
agreementsRouter.use(bodyParser.json());

let expo_sdk = require('expo-server-sdk').Expo;

let expo = new expo_sdk();
let messages = [];


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
      agreement_type    : request.body.agreement_type
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
  for ( var loop = 0; loop <= providers_list.length; loop ++) {
    (function (loop) {
      setTimeout( async () => {
        if( contract_status !== '' ) {
          if( contract_status == 'accepted') {
            response.json({ success: true, message: 'provider accepted your request'});
          } else {
            response.json({ success: false, message: 'no providers are available at this time'});
          }
        } else {
          let agreement = await agreementsModel.findById({ _id: ObjectId(contract_id)}).select('status').lean();
          console.log('status of agreement', agreement.status);
          if ( loop == providers_list.length ) {
                if( agreement.status == 'accepted') {
                  contract_status = agreement.status;
                } else {
                  agreementsModel.deleteOne({ _id: ObjectId(contract_id)});
                  contract_status = agreement.status;
                }
              } else if ( agreement.status == 'pending' && loop !== providers_list.length && loop !== 0 ) {
                console.log(loop, 'on server');
                let checkRequest = await providersWithRequests.find({ providerId: providers_list[loop].providerId}).lean();
                if( !checkRequest ){
                  io.sockets.to(providers_list[loop].socketId).emit('action', { type: 'SERVICE_AGREEMENT_REQUEST', data: customer_object});
                }
              } else if ( agreement.status == 'accepted' && loop !== providers_list.length ) {
                  contract_status = agreement.status;  
              }
        }
      }, loop * 10000);
    })(loop);
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
    }).lean();
  });


  // route to confirm the agreement between provider and customer
  agreementsRouter.post('/confirmAgreement', async ( req, res ) => {
      let payload   = req.body;
      let agreement = await agreementsModel.findById({_id: payload.agreement_id}).select('customer_id -_id').lean();
      if(agreement.status == 'accepted' ){
        res.json({ success: false, message: 'agreement already awarded to another provider'});
      } else {
        let updated_agreement = await agreementsModel.findByIdAndUpdate( { _id: payload.agreement_id} , {
          $set : { provider_Id: payload.provider_Id, status: 'accepted' }
        });
        let customer_detail = await customers_Location( updated_agreement.customer_id );
        let data = await customer.findById({ _id: updated_agreement.customer_id}).select("push_token").lean();
        messages.push({
          to    : data.push_token,
          title : 'Request Accepted',
          sound : 'default',
          body  : 'Your provider is on his way',
          data  : { action: {
            type: 'AGREEMENT_ACCEPTED',
            payload: req.body
          }}
        });
        let message = await expo.sendPushNotificationsAsync(messages);
        messages.pop();
        console.log(message, data, 'saad');
        io.sockets.to(customer_detail.socketId).emit('action', {
          type    : 'AGREEMENT_ACCEPTED',
          payload : req.body
        });
        console.log('----> hy this is customer', customer_detail)
        res.json({ success: true, message: 'successfully confirmed the agreement', data: customer_detail});
      }
  });

  agreementsRouter.post('/providerArrived', async (req, res) => {
    let payload = req.body;

    let response_data = {};
    response_data.customer_data   = {};
    response_data.agreement_data  = {};
    try {
      let customer_data   = await customers_Location ( payload.customer_id);
      let agreement_data  = await agreementsModel.findById({ _id: ObjectId(payload.agreement_id)}).lean();
      
      response_data.agreement_data  = agreement_data;
      let data = await customer.findById({ _id: payload.customer_id}).select("push_token").lean();
      if( customer_data ) {
        messages.push({
          to    : data.push_token,
          title : 'provider arrived',
          sound : 'default',
          body  : 'your provider has arrived at your location',
          data  : { action: {
            type: 'PROVIDER_ARRIVED',
            payload: response_data
          }}
        });
        let message = await expo.sendPushNotificationsAsync(messages);
        messages.pop();
        io.sockets.to(customer_data.socketId).emit('action', {
          type    : 'PROVIDER_ARRIVED', 
          payload : response_data
        });
        sendSMS.sendSMSToPhone(customer_data.customerId.username, provider_arrived_message( customer_data.customerId.name));
        res.json({ success: true, message: 'successfully sent message to customer'});
      } else {
        res.json({ success: false, message: 'unable to find customer data for the provided id'});
      }
    } catch (error) {
      res,json({ success: false, message: 'unable to inform customer', error: error});
    }

  });

  agreementsRouter.post('/startAgreement', (req, res) => {
    let payload = req.body;
    agreementsModel.findByIdAndUpdate({_id: ObjectId(payload.agreement_id)}, { $set : {
      status: 'started',
      agreement_rate: payload.agreement_rate,
      promo_code: payload.promo_code ? payload.promo_code : null
    }}, { new: true}, ( err, agreement) => {
      console.log(agreement);
      if( agreement.status == 'started' && agreement.agreement_rate ){
        res.json({ success: true, message: 'successfully started the agreement', data: agreement})
      } else {
        res.json({ success: false, message: 'unable to start the contract'});
      }
    });
  });

  agreementsRouter.post('/trackAgreementTime', async (req, res) => {
    let payload = req.body,
        query   = { _id: payload.agreement_id },
        update  = { $push: { time: payload.timetrack }}
    
        try {      
          let agreement = await agreementsModel.findOne(query).lean().select('_id time');
          if( agreement ){
            console.log(agreement, 'checking');
            let returned_time = await agreementsModel.findOneAndUpdate( query, update ).select('time').lean();
            if ( returned_time ){
              res.json({ success: true, message: 'saved the time successfully'});
            }
          } else {
            res.json({ success: false, message: 'unable to find agreement with the provided id'})
          }
        } catch (error) {
            res.json({ success: false, message: 'unable to save provided time', error : error})
        }
  });

  agreementsRouter.post('/completeAgreement', async ( req, res ) => {
    let payload   = req.body,
        query     = { _id: payload.agreement_id },
        total_hours = 0, total_amount = 0,
        agreement = await agreementsModel.findOne(query).lean().select('_id time selected_service agreement_type agreement_rate promo_code');
        agreementsModel.findByIdAndUpdate(query, { $set: { status: 'completed'}});
    if ( agreement ) {
      if(agreement.agreement_type == 'hourly') {
        let total_agreement_time = agreement.time;
        await total_agreement_time.forEach(element => {
          if(element != null)
          total_hours += Number(element.total_hours)
        });
        total_hours = total_hours.toFixed(1);
        total_amount = Number(agreement.agreement_rate) * total_hours;
        console.log(agreement)
        if ( agreement.promo_code ) {
         total_amount = await promoCode.returnFinalPrice( agreement.promo_code, total_amount );
        }
        console.log(total_amount);
        res.json({ success: true, message: 'successfully got the final price', data: total_amount});
      } else {
        total_amount = Number(agreement.agreement_rate);
        if ( agreement.promo_code ) {
           total_amount = await promoCode.returnFinalPrice( agreement.promo_code, total_amount );
        }
        res.json({ success: true, message: 'successfully got the final price', data: total_amount})
      }
    } else {
      res.json({ success: false, message: 'no agreement found with the provided id'});
    }
  });

module.exports = agreementsRouter;