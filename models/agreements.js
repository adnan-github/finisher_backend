// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeTrackingSchema = new Schema({
        start_time: String,
        end_time: String,
        total_hours: Schema.Types.Number,
        date: Date
}, {_id: false});

const agreementsSchema = new Schema({
    customer_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'customers'
    },
    selected_service: {
        type: String,
        required: true
    },
    provider_Id: {
        type: Schema.Types.ObjectId,
        ref: 'providers'
    },
    status: {
        type: String,
        required: true
    },
    agreement_type: {
        type: String,
        required: true
    },
    customer_socket: {
        type: String
    },
    agreement_rate: {
        type: String
    },
    time: [timeTrackingSchema]
}, {        
    timestamps: true
}).index({ customer_id: 1, provider_Id: 1 });

const agreementsModel = mongoose.model('agreements', agreementsSchema);

module.exports = agreementsModel;
