// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promoCodesSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name of the Promo code should be mentioned']
    },
    code: {
        type: String,
        required: [true, 'Code of Promo Code is not provided'],
        unique: true
    },
    discount_type: {
        type: String,
        required: [true, 'Discount Type should be provided']
    },
    discount_amount: {
        type: String,
        required: [true, 'Discount Amount should be provided for the Promo Code']
    },
    start_date: {
        type: Date,
        required: [true, 'Promo Code starting date should be provided'],
        min: Date.now(),
        default: Date.now()
    },
    expiration_date: {
        type: Date,
        required:  [true, 'Promo Code expiration date should be provided'], 
        expires: 0
    },
    max_discount: {
        type: String
    }
}, {
    timestamps: true
});

const promoCodesModel = mongoose.model('promocodes', promoCodesSchema);

module.exports = promoCodesModel;