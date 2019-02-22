// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
const PassportLocalMongoose = require('passport-local-mongoose');


const agreemnetsSchema = new Schema({
    customer_id: {
        type: ObjectId,
        required: true
    },
    selected_Service: {
        type: String,
        required: true
    },
    provider_Id: {
        type: ObjectId,
        required: true
    },
    status: {
        type: String,
        required: true
    }
}, {        
    timestamps: true
    });

const agreemnetsModel = mongoose.model('agreemnets', agreemnetsSchema);

module.exports = agreemnetsModel;
