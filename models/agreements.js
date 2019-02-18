// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PassportLocalMongoose = require('passport-local-mongoose');

const agreemnetsSchema = new Schema({
    customer_id: {
        type: String,
        required: true
    },
    selected_Service: {
        type: String,
        required: true
    },
    agreement_type: {
        type: String,
        required: true
    },
    provider_Id: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },

    isCompleted: {
        type: Boolean,
        required: true
    }
}, {
        timestamps: true
    });

const agreemnetsModel = mongoose.model('agreemnets', agreemnetsSchema);

module.exports = agreemnetsModel;
