// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const earningsSchema = new Schema({
    payed_amount: {
        type: Number,
        required: true
    },
    provider_earning: {
        type: Number,
        required: true
    },
    provider_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'providers'
    },
    agreement_id: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'agreements'
    },
    payment_status: {
        type: Schema.Types.String,
        default: 'pending'
    },
    company_share: {
        type: Schema.Types.Number,
        required: true
    }
}, {
    timestamps: true
}).index({ agreement_id: 1, provider_id: 1, payment_status: 1});

const earningsModel = mongoose.model('earnings', earningsSchema);

module.exports = earningsModel;