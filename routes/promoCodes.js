// requirements for customer model
var express     = require('express');
var bodyParser  = require('body-parser');
var ObjectId    = require('mongoose').Types.ObjectId;
var moment      = require('moment');


var promoModel = require('../models/promoCodes');

var promocodesRouter = express.Router();
promocodesRouter.use(bodyParser.json());

promocodesRouter.get('/listAll', ( req, res ) => {
    promoModel.find({}, (error, promocodes ) => {
        if( error ) {
            res.statusCode = 500;
            res.json({ success: false, message: 'error in retrieving promo codes', error: error});
        } else if ( !promocodes ) {
            res.statusCode = 200;
            res.json({ success: false, message: 'NO promo codes are available at this time'});
        } else {
            res.statusCode = 200;
            res.json({ success: true, message: 'successfully retrieved promocodes list', data: promocodes});
        }
    });
});

promocodesRouter.post('/addNew', ( req, res ) => {
    promoModel.create(req.body, ( error, promoCode) => {
        if(error) {
            res.statusCode = 500;
            res.json({ success: false, message: 'unable to add new promo code', error: error});
        } else if ( promoCode ) {
            res.statusCode = 200;
            res.json({ success: true, message: 'successfully added promotion code', data: promoCode})
        }
    });
});

promocodesRouter.delete('/deletepromoCode', (req, res) => {
    promoModel.deleteOne({ code: req.body.code}, ( error, deletedPromoCode ) => {
        if ( error ) {
            res.statusCode = 500;
            res.json({ success: false, message: 'unable to delete the code', error: error});
        } else {
            res.statusCode = 200;
            res.json({ success: true, message: 'successfully deleted promo code', data: deletedPromoCode.deletedCount});
        }
    });
});

promocodesRouter.get('/getPromoCode/:code', ( req, res ) => {
    promoModel.findOne({ code: req.params.code }, ( error, promoCode ) => {
        if ( error ) {
            res.json({ success: false, message: 'error in finding promo code', error: error});
        } else if ( promoCode ) {
            if( moment(promoCode.expiration_date).isBefore(Date.now()) ) {
                res.json({ success: false, message: 'code is expired or its not available yet'})
            } else {
                res.json({ success: true, message: 'successfully retrieved the code', data: promoCode})
            }
        } else {
            res.json({ success: false, message: 'inavalid promo code entered'})
        }
    }).select('-_id name code discount_type discount_amount max_discount').lean();
});

promocodesRouter.get('/getByDate', ( req, res ) => {
    let query = {};
    var options = { multi: true };
    (req.body.start_date) ? query = {start_date: new Date(req.body.start_date)} : 
                            query = { expiration_date: new Date(req.body.expiration_date) };  

    promoModel.find( query, options, ( error, promoCodes ) => {
        console.log(promoCodes)
        if (error ) {
            res.statusCode({ success: false, message: 'unable to find promo codes for the provided date', error: errorx})
        } else if ( !promoCodes || promoCodes == [] ) { 
            res.json({ success: false, message: 'no codes found for the provided date'})
        } else {
            res.json({ success: true, message: 'successfully recieved the codes', data: promoCodes});
        }
    }).limit(10).select('name discount_type discount_amount start_date expiration_date code').lean();
});

promocodesRouter.get('/getByRange', ( req, res ) => {
    var query = { $and: [ { start_date: { $gte: new Date(req.body.start_date) } }, { expiration_date: { $lte: new Date(req.body.expiration_date) } } ]};
 
    promoModel.find( query, ( error, promoCodes ) => {
        if ( error )  {
            res.json({ success: false, message: 'error finding the codes ', error: error});
        } else if ( promoCodes == [] || promoCodes == null ) {
            res.json({ success: false, message: 'could not find promo codes in the given date range'});
        } else {
            res.json ( { success: true, message: 'successfully retrieved the data', data: promoCodes})
        }
    }).limit(10).select('name discount_type discount_amount start_date expiration_date code').lean();
})

module.exports = promocodesRouter;