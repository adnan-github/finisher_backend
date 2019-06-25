// 
var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');

// models
var contractsModel = require('../models/agreements');
var feedbackModel = require('../models/feedback');

// feedback Router
var contractsRouter = express.Router();
contractsRouter.use(bodyParser.json());

contractsRouter.post('/provider_id', async ( req, res ) => {
    let payload = req.body;
    let contracts_array = [];
    if( payload.provider_id ){
        let query   = { provider_Id: payload.provider_id };
        try {    
            let contractsObject = await contractsModel.find(query).lean().limit(10);
            console.log(contractsObject);
            if( contractsObject ) { 
                Object.keys(contractsObject).forEach( data => {
                    console.log(data);
                })
                res.json({ success: true, message: 'got the agreements successfully', contracts: contractsObject});
            } else { 
                res.json({ success: false, message: 'unable to find document with provided provider id'});
            }
        } catch ( error ) {
            console.log(error.ReferenceError);
            res.json({ success: false, message: 'error in getting the data', error: error});
        }
    } else {
        res.json({ success: false, message: 'please provide provider id'});
    }
});

contractsRouter.post('/customer_id', async ( req, res ) => {
    let payload = req.body;
    let contract_ids = [];
    if( payload.customer_id ){
        let query   = { customer_id: payload.customer_id };
        try {    
            let contractsObject = await contractsModel.find(query).lean().limit(10);
            console.log(contractsObject);
            if( contractsObject ) { 
              await Object.keys(contractsObject).forEach( data => {
                  if ( contractsObject[data].status === 'completed') {
                    contract_ids.push(contractsObject[data]._id);  
                  } 
                });
                if( contract_ids.length !== 0) { 
                    feedbackModel.find({'agreement_id': {$in: contract_ids}}).select('rating_to_provider');
                }
                res.json({ success: true, message: 'got the agreements successfully', contracts: contractsObject});
            } else { 
                res.json({ success: false, message: 'unable to find document with provided customer id'});
            }
        } catch ( error ) {
            console.log(error.ReferenceError);
            res.json({ success: false, message: 'error in getting the data', error: error});
        }
    } else {
        res.json({ success: false, message: 'please provide customer id'});
    }
});



module.exports = contractsRouter;