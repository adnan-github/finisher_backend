// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PassportLocalMongoose = require('passport-local-mongoose');

const homeServicesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const homeServicesModel = mongoose.model('homeServices', homeServicesSchema);

module.exports = homeServicesModel;
