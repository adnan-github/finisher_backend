// getting required modules
var jwt = require('jsonwebtoken');
var passport = require('passport');
var jwtStrategy = require('passport-jwt').Strategy;
var localStrategy = require('passport-local').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;



// getting configuration file for the server
var config = require('../utils/config');

var User = require('../models/users');

exports.local = passport.use(new localStrategy(User.authenticate()));
// exports.facebook = passport.use(new FacebookStrategy({

",
//     callbackURL: "http://localhost:4000/api/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     console.log(profile)
//     // TODO: do sth with returned values
//   }));

// serialize and deserialize User 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// This function will generate Token on User login
exports.generateToken = (User) => {
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
exports.jwtPassport = passport.use(new jwtStrategy(opts,
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

exports.verifyUser = passport.authenticate('jwt', {
    session: false
});

