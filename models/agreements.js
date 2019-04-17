// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeTrackSchema = new Schema({
    start_time: {
        type: String
    },
    end_time: {
        type: String
    },
    hours: {
        type: String
    } 
}); 

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
    time: [timeTrackSchema]
}, {        
    timestamps: true
    });

const agreementsModel = mongoose.model('agreements', agreementsSchema);

module.exports = agreementsModel;
