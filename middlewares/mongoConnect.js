const mongoose  = require('mongoose');
mongoose.Promise = require('bluebird');

function mongoConnect() {
    // mongodb connection
    var url = process.env.MONGODB_ADDON_URI || process.env.MONGO_LOCAL_URL || process.env.ATLAS_DB_URL;
    var connect = mongoose.connect(url, {
        useNewUrlParser: true
    });
    connect.then((db) => {
        console.log('connected to the server ');
    }, (err) => {
        console.log(err);
    });
}
module.exports = mongoConnect;

