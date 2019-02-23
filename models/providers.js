// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PassportLocalMongoose = require('passport-local-mongoose');

const providerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
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
        required: true
    }
}, {
    timestamps: true
});

providerSchema.plugin(PassportLocalMongoose);
const providerModel = mongoose.model('providers', providerSchema);

module.exports = providerModel;

/*
username: {
        type: String,
        unique: true,
        required: true,
        minlength: 5,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        maxlength: 20,
        minlength: 5
    },
*/