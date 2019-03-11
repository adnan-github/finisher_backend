// getting required modules
var jwt = require('jsonwebtoken');
var jwtStrategy = require('passport-jwt').Strategy;
var localStrategy = require('passport-local').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var passport_admin = require('passport');


var Admin = require('../models/admin');

exports.admin_local = passport_admin.use('local-admin', new localStrategy(Admin.authenticate(
    function(username, password, done) {
        Admin.findOne({ username: username }, function (err, admin) {
          if (err) { return done(err); }
          if (!admin) { return done(null, false); }
          if (!admin.verifyPassword(password)) { return done(null, false); }
          return done(null, admin);
        });
      }
)));
// serialize and deserialize Admin 
passport_admin.serializeUser(Admin.serializeUser());
passport_admin.deserializeUser(Admin.deserializeUser());

// This function will generate Token on Admin login
exports.admin_generateToken = (Admin) => {
    return jwt.sign(Admin, process.env.SECRET_KEY_JWT, {
        expiresIn: 3600
    });
};

// options for setting the JWT Tokens
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY_JWT;

/* // jwt passport strategy 
 *   [jwt Passport] => @{Params} { jwt payload and callback for the function }
 *   checks if the admin is authenticated or not
 */
exports.jwtPassport = passport_admin.use('jwt-admin', new jwtStrategy(opts,
    (jwt_payload, done) => {
        Admin.findById(jwt_payload._id, (err, admin) => {
            if (err) {
                return done(err, false);
            } else if (admin) {
                return done(null, admin);
            } else {
                return done(null, false);
            }
        });
    }));

exports.verifyadmin = passport_admin.authenticate('jwt-admin', {
    session: false
});


exports.authenticatadmin = passport_admin.authenticate('local-admin');