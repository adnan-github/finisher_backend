// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promoCodesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    discount_type: {
        type: String,
        required: true
    },
    discount_amount: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true,
        min: Date.now(),
        default: Date.now()
    },
    expiration_date: {
        type: Date,
        required:  [true, 'Promo Code expiration date should be mentioned'], 
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