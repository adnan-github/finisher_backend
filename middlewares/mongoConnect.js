const mongoose  = require('mongoose');
const config    = require('../utils/config'); 
mongoose.Promise = require('bluebird');

function mongoConnect() {
    // mongodb connection
    var url = process.env.MONGODB_ADDON_URI || config.mongo_url;
    var connect = mongoose.connect(url, {
        useNewUrlParser: true
    });
    connect.then((db) => {
        console.log('connected to the server');
    }, (err) => {
        console.log(err);
    });
}
module.exports = mongoConnect;

