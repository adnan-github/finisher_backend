var express     = require('express');
var passport    = require('passport');
var bodyParser  = require('body-parser');

var feedbackModel = require('../models/feedback');

// feedback Router
var feedbackRouter = express.Router();
feedbackRouter.use(bodyParser.json());

feedbackRouter.post('/feedbackByCustomer', async ( req, res ) => {
    let payload = req.body;
    if( payload.agreement_id && payload.rating_to_provider ){
        let query   = { agreement_id: payload.agreement_id },
            update  = { $set: {  rating_to_provider: payload.rating_to_provider, feedback_by_customer: payload.feedback_by_customer || '' }};
        try {    
            let feedbackObject = await feedbackModel.findOneAndUpdate(query, update).select('_id').lean();
            console.log(feedbackObject);
            if( feedbackObject ) { 
                res.json({ success: true, message: 'feedback by the customer successfully saved'});
            } else { 
                res.json({ success: false, message: 'unable to find document with provided agreement id'});
            }
        } catch ( error ) {
            console.log(error.ReferenceError);
            res.json({ success: false, message: 'error in saving the feedback', error: error});
        }
    } else {
        res.json({ success: false, message: 'please provide an agreement id and rating for the feedback'});
    }
});

feedbackRouter.post('/feedbackByProvider', async ( req, res ) => {
    let payload = req.body;
    if( payload.agreement_id && payload.rating_to_customer ){
        let query   = { agreement_id: payload.agreement_id },
            update  = { $set: {  rating_to_customer: payload.rating_to_customer, feedback_by_provider: payload.feedback_by_provider || '' }},
            options = { upsert: true, new: true };
        try {    
            let checkFeedback = await feedbackModel.findOne({agreement_id: payload.agreement_id}).select('_id').lean();
            if ( !checkFeedback ) {
                let feedbackObject = await feedbackModel.findOneAndUpdate(query, update, options).select('_id').lean();
                if( feedbackObject ) { 
                    res.json({ success: true, message: 'feedback by the customer successfully saved'});
                } else { 
                    res.json({ success: false, message: 'unable to find document with provided agreement id'});
                }
            } else {
                res.json({ success: false, message: 'feedback already provided by the provider'});
            }
        } catch ( error ) {
            res.json({ success: false, message: 'error in saving the feedback', error: error});
        }
    } else {
        res.json({ success: false, message: 'please provide an agreement id and rating for the feedback'});
    }
});

module.exports = feedbackRouter;