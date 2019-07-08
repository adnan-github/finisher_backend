// 
var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');

// models
var contractsModel  = require('../models/agreements');

var ObjectId        = require('mongoose').Types.ObjectId;

// feedback Router
var contractsRouter = express.Router();
contractsRouter.use(bodyParser.json());

contractsRouter.post('/provider_id', async ( req, res ) => {
    let payload = req.body;
    if( payload.provider_id ){
        try {    
            let contracts_testObj = await contractsModel.aggregate([
                {   $match: { provider_id: ObjectId(`${req.body.provider_id}`), status: 'completed' } },
                {   $lookup: { 
                        from            : "feedbacks",
                        localField      : "_id",
                        foreignField    : "agreement_id",
                        as              : "feedback"
                    }
                },
                {   $lookup: { 
                        from            : "completedagreements",
                        localField      : "_id",
                        foreignField    : "agreement_id",
                        as              : "amount"
                    }
                },
                {
                    $project: {
                        "selected_service"  : 1,    "status"    : 1, 
                        "agreement_type"    : 1,    "createdAt" : 1,
                        "updatedAt"         : 1,    "_id"       : 1, 
                        "feedback.rating_to_customer": 1,   "amount.payed_amount": 1 
                    }
                }
            ]);
            if( contracts_testObj ) { 
                res.json({ success: true, message: 'got the agreements successfully', contracts: contracts_testObj});
            } else { 
                res.json({ success: false, message: 'unable to find document with provided provider id'});
            }
        } catch ( error ) {
            console.log(error);
            res.json({ success: false, message: 'error in getting the data', error: error});
        }
    } else {
        res.json({ success: false, message: 'please provide provider id'});
    }
});

contractsRouter.post('/customer_id', async ( req, res ) => {
    let payload = req.body;

    if( payload.customer_id ){
        try {    
            let contracts_testObj = await contractsModel.aggregate([
                {   $match: { customer_id: ObjectId(`${req.body.customer_id}`), status: 'completed' } },
                {   $lookup: { 
                        from            : "feedbacks",
                        localField      : "_id",
                        foreignField    : "agreement_id",
                        as              : "feedback"
                    }
                },
                {   $lookup: { 
                        from            : "completedagreements",
                        localField      : "_id",
                        foreignField    : "agreement_id",
                        as              : "amount"
                    }
                },
                {
                    $project: {
                        "selected_service"  : 1,    "status"    : 1, 
                        "agreement_type"    : 1,    "createdAt" : 1,
                        "updatedAt"         : 1,    "_id"       : 1, 
                        "feedback.rating_to_provider": 1,   "amount.payed_amount": 1 
                    }
                }
            ]);
            if( contracts_testObj ) { 
                res.json({ success: true, message: 'got the agreements successfully', contracts: contracts_testObj});
            } else { 
                res.json({ success: false, message: 'unable to find document with provided customer id'});
            }
        } catch ( error ) {
            console.log(error);
            res.json({ success: false, message: 'error in getting the data', error: error});
        }
    } else {
        res.json({ success: false, message: 'please provide customer id'});
    }
});



module.exports = contractsRouter;