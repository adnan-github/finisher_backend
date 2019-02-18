const Validator = require('validator');
const isEmpty   = require('./is-empty');

//it will validate data for user registeration 
validateRegistration = data => {
    // store errors in this error object
    let errors  = {};
    console.log('data', data);
    let count   = 0;
    Object.keys(data).forEach((value, index) => {

        if (data[value] === undefined ) {
            errors[value] = value + "is required";
            count++;
        }
    });
    if (count > 0 || isEmpty(data)) {
        errors.object = "empty object"; 
        return {
            errors,
            isValid: false
        };
    } else {
        // user email validation
        if (Validator.isEmpty(data.name))
            errors.name = "Name is required";

        // user name validation 
        if (!Validator.isLength(data.name, {
                max: 20,
                min: 5
            }))
            errors.name = "Name must be between 5 and 20 characters";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};

module.exports = validateRegistration;