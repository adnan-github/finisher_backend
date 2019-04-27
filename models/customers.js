// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PassportLocalMongoose = require('passport-local-mongoose');

const customersSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    cnic: {
        type: String
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
    push_token: {
        type: String
    },
    socket_id: {
        type: String
    }
}, {
    timestamps: true
});

customersSchema.plugin(PassportLocalMongoose);
const customersModel = mongoose.model('customers', customersSchema);

module.exports = customersModel;