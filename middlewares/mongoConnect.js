const mongoose  = require('mongoose');
const config    = require('../utils/config'); 
mongoose.Promise = require('bluebird');

function mongoConnect() {
    // mongodb connection
    var url = config.mongo_url;
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

/*
* Custom auth
// get auth header
  var authorization = req.headers.authorization;
  if (!req.session.user) {
    if (!authorization) {
      // if there is no auth header in the request, this error will be sent to middleware
      var err = new Error('you are not authorized');

      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    } else {
      // extracting username and password from the header
      var log_details = new Buffer(authorization.split(' ')[1], 'base64').toString().split(':');
      var username = log_details[0];
      var password = log_details[1];

      // finding provided username in the db 
      userModel.findOne({
          username: username
        })
        .then((user) => {
          if (user !== null) {
            if (user.password === password) {
              req.session.user = 'authenticated';
              res.setHeader('Content-Type', 'text/plain');
              res.end('you are authenticated');
              res.sendStatus(200);
            } else {
              // if the password stored in the db does not matches with the provided one
              var err = new Error('your provided password is incorrect');
              console.log("passwords are " + user.password + password);
              err.status = 403;
              return next(err);
            }
          } else {
            //
             
             If No matching username is returned from the db, this error will be sent to middleware
             
            var err1 = new Error('username ' + username + 'does not exists');

            res.setHeader('WWW-Authenticate', 'Basic');
            err1.status = 403;
            return next(err1);
          }
        })
        .catch(err => next(err));
    }
  } else {
    if (req.session.user === 'authenticated') {
      res.sendStatus(200);
      res.setHeader('Content-Type', 'text/plain');
      res.end('you are already logged in');
    }
  }
*/