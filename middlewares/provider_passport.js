// getting required modules
var jwt = require('jsonwebtoken');
var jwtStrategy = require('passport-jwt').Strategy;
var localStrategy = require('passport-local').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var passport_provider = require('passport');

var Provider = require('../models/providers');

exports.provider_local = passport_provider.use('local-provider', new localStrategy(Provider.authenticate(
    function(username, password, done) {
        Provider.findOne({ username: username }, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (!user.verifyPassword(password)) { return done(null, false); }
          return done(null, user);
        });
      }
)));

// serialize and deserialize User 
passport_provider.serializeUser(Provider.serializeUser());
passport_provider.deserializeUser(Provider.deserializeUser());

// This function will generate Token on User login
exports.provider_generateToken = (User) => {
    return jwt.sign(User, process.env.SECRET_KEY_JWT, {
        expiresIn: 3600
    });
};

// options for setting the JWT Tokens
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY_JWT;

/* // jwt passport strategy 
 *   [jwt Passport] => @{Params} { jwt payload and callback for the function }
 *   checks if the user is authenticated or not
 */
exports.jwtPassport = passport_provider.use('jwt-provider', new jwtStrategy(opts,
    (jwt_payload, done) => {
        Provider.findById(jwt_payload._id, (err, user) => {
            if (err) {
                return done(err, false);
            } else if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));

exports.verifyProvider = passport_provider.authenticate('jwt-provider', {
    session: false
});


exports.authenticatProvider = passport_provider.authenticate('local-provider');