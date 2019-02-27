// requirements
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
const PassportLocalMongoose = require('passport-local-mongoose');


const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 10
    },
    password: {
        type: String,
        required: true,
        minlength: 15
    },
    status: {
        type: String
    }
}, {        
    timestamps: true
    });

    adminSchema.plugin(PassportLocalMongoose);
const adminsModel = mongoose.model('admins', adminSchema);

module.exports = adminsModel;
