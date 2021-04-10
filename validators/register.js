const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterError(data) {
    let errors = {};

    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = "name should be between 2 and 30 characters"
    }

    if (Validator.isEmpty(data.name)) {
        errors.name = "the name feild is empty";
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = "the email field is empty";
    }

    if (!Validator.isEmail(data.email)) {
        errors.email = "email is invalid"
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = "the password field is empty"
    }

    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = "the password should be at least 6 characters"
    }

    if (Validator.isEmpty(data.password2)) {
        errors.password2 = "the password field is empty"
    }

    if (!Validator.equals(data.password, data.password2)) {
        errors.password = "passwords don't match"
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}