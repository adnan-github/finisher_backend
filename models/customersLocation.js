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
    }
});

const customersLocationSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'customers'
    },
    coordinate: {
        type: geoLocationSchema,
        index: '2dsphere'
    },    
    socketId: String,
    status: String,
    address: String
}, {
    timestamps: true
});

const customerLocationModel = mongoose.model('customerLocations', customersLocationSchema);

module.exports = customerLocationModel;