// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PassportLocalMongoose = require('passport-local-mongoose');

const customersSchema = new Schema({
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
    }
}, {
    timestamps: true
});

customersSchema.plugin(PassportLocalMongoose);
const customersModel = mongoose.model('customers', customersSchema);

module.exports = customersModel;