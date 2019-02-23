// getting required modules
var jwt = require('jsonwebtoken');
var jwtStrategy = require('passport-jwt').Strategy;
var localStrategy = require('passport-local').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var FacebookStrategy = require('passport-facebook').Strategy;
var passport_provider = require('passport');
var passport_user = require('passport');


// getting configuration file for the server
var config = require('../utils/config');

var User = require('../models/users');
var Provider = require('../models/providers');

exports.user_local = passport_user.use('local-user', new localStrategy(User.authenticate(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (!user.verifyPassword(password)) { return done(null, false); }
          return done(null, user);
        });
      }
)));
exports.facebook = passport_user.use(new FacebookStrategy({
    clientID: "2055752244507130",
    clientSecret: "29edc6fd48d24b8bf4a13e26dc91e60f",
    callbackURL: "http://localhost:4000/api/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile)
    // TODO: do sth with returned values
  }));

// serialize and deserialize User 
passport_user.serializeUser(User.serializeUser());
passport_user.deserializeUser(User.deserializeUser());

// This function will generate Token on User login
exports.user_generateToken = (User) => {
    return jwt.sign(User, config.secret_key, {
        expiresIn: 3600
    });
};

// options for setting the JWT Tokens
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secret_key;

/* // jwt passport strategy 
 *   [jwt Passport] => @{Params} { jwt payload and callback for the function }
 *   checks if the user is authenticated or not
 */
exports.jwtPassport = passport_user.use('jwt-user', new jwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("jwt payload => ", jwt_payload);
        User.findById(jwt_payload._id, (err, user) => {
            if (err) {
                return done(err, false);
            } else if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport_user.authenticate('jwt-user', {
    session: false
});


exports.authenticateUser = passport_user.authenticate('local-user');