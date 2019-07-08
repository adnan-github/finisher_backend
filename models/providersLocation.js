const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const geoLocationSchema = new Schema({
    type: {
        type: String,
        default: "Point"
    },
    coordinates: {
        type: [Number],
        index: "2dsphere"
    },
});

const providersLocationSchema = new Schema({
    provider_id: {
        type: Schema.Types.ObjectId,
        ref: 'providers'
    },
    coordinate: {
        type: geoLocationSchema,
        index: '2dsphere'
    },    
    socketId: String,
    status: String,
    category: String,
    availability: Boolean    
}, {
    timestamps: true
});

const providerLocationModel = mongoose.model('providerLocations', providersLocationSchema);

module.exports = providerLocationModel;