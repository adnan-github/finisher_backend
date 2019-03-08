const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const geoLocationSchema = new Schema({
    type: {
        type: String,
        default: "Point"
    },
    cordinates: {
        type: [Number],
        index: "2dsphere"
    }
});

const providersLocationSchema = new Schema({
    providerId: {
        type: ObjectId
    },
    coordinate: {
        type: geoLocationSchema,
        index: true
    },    
    socketId: String    
}, {
    timestamps: true
});

const providerLocationModel = mongoose.model('providerLocations', providersLocationSchema);

module.exports = providerLocationModel;