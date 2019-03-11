// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PassportLocalMongoose = require('passport-local-mongoose');

const servicesSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    perHour: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const servicesModel = mongoose.model('services', servicesSchema);

module.exports = servicesModel;
