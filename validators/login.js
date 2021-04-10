const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';


    if (!Validator.isEmail(data.email)) {
        errors.email = "invalid Email";
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = "the email feild is empty";
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = "the password feild is empty";
    }


    return {
        errors,
        isValid: isEmpty(errors)
    }
}