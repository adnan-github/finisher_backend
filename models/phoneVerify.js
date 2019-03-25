// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const phoneVerifySchema = new Schema({
    phone       : String,
    code        : String,
    createdAt   : { type: Date, expires: '1h', default: Date.now }
}, {
    timestamps: false
});

const phoneVerifyModel = mongoose.model('phoneVerify', phoneVerifySchema);

module.exports = phoneVerifyModel;
