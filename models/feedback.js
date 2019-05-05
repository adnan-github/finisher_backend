// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    feedback_by_provider: {
        type: String
    },
    rating_to_provider: {
        type: Number
    },
    feedback_by_customer: {
        type: String
    },
    rating_to_customer: {
        type: Number
    },
    agreement_id: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'agreements'
    }
}, {
    timestamps: true
}).index({ agreement_id: 1, rating_to_customer: 1, rating_to_provider: 1});

const feedbackModel = mongoose.model('feedbacks', feedbackSchema);

module.exports = feedbackModel;