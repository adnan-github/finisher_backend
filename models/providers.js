// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PassportLocalMongoose = require('passport-local-mongoose');

const providerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    cnic: {
        type: String, 
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        maxlength: 20,
        minlength: 8
    },
    profession: {
        type: String,
        // requ/ired: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    push_token: {
        type: String
    },
    socket_id: {
        type: String
    }
}, {
    timestamps: true
});

providerSchema.plugin(PassportLocalMongoose);


const providerModel = mongoose.model('providers', providerSchema);

module.exports = providerModel;