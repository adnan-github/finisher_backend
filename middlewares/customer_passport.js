// getting required modules
var jwt = require('jsonwebtoken');
var jwtStrategy = require('passport-jwt').Strategy;
var localStrategy = require('passport-local').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var passport_provider = require('passport');
var passport_customer = require('passport');

var Customer = require('../models/customers');

exports.customer_local = passport_customer.use('local-customer', new localStrategy(Customer.authenticate(
    function(username, password, done) {
        Customer.findOne({ username: username }, function (err, customer) {
          if (err) { return done(err); }
          if (!customer) { return done(null, false); }
          if (!customer.verifyPassword(password)) { return done(null, false); }
          return done(null, customer);
        });
      }
)));

// serialize and deserialize Customer 
passport_customer.serializeUser(Customer.serializeUser());
passport_customer.deserializeUser(Customer.deserializeUser());

// This function will generate Token on Customer login
exports.customer_generateToken = (Customer) => {
    return jwt.sign(Customer, process.env.SECRET_KEY_JWT, {
        expiresIn: 3600
    });
};

// options for setting the JWT Tokens
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY_JWT;

/* // jwt passport strategy 
 *   [jwt Passport] => @{Params} { jwt payload and callback for the function }
 *   checks if the customer is authenticated or not
 */
exports.jwtPassport = passport_customer.use('jwt-customer', new jwtStrategy(opts,
    (jwt_payload, done) => {
        Customer.findById(jwt_payload._id, (err, customer) => {
            if (err) {
                return done(err, false);
            } else if (customer) {
                return done(null, customer);
            } else {
                return done(null, false);
            }
        });
    }));

exports.verifyCustomer = passport_customer.authenticate('jwt-customer', {
    session: false
});


exports.authenticateCustomer = passport_customer.authenticate('local-customer');