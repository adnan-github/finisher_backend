// requirements
const mongoose = require('mongoose');
const lean_virtual = require('mongoose-lean-virtuals');
const Schema = mongoose.Schema;

const completedAgreementsSchema = new Schema({
    agreement_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'agreements'
    },
    payed_amount: {
        type: String,
        required: true
    },
    company_share: {
        type: String,
        required: true
    },
    payment_status: {
        type: String,
        required: true,
        default: 'pending'
    }
}, {
    timestamps: true
}).index({ payment_status: 1, agreement_id: 1 });

completedAgreementsSchema.plugin(lean_virtual);
const completedAgreementsModel = mongoose.model('completedAgreements', completedAgreementsSchema);


module.exports = completedAgreementsModel;
