const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProfileInput(data) {
    let errors = {};

    data.handle = !isEmpty(data.handle) ? data.handle : '';
    data.status = !isEmpty(data.status) ? data.status : '';
    data.skills = !isEmpty(data.skills) ? data.skills : '';

    if (Validator.isEmpty(data.handle)) {
        errors.handle = "the handle field is required";
    }

    if (!Validator.isLength(data.handle, { min: 2, max: 30 })) {
        errors.handle = "the handle should be between 2 and 30 characters";
    }

    if (Validator.isEmpty(data.status)) {
        errors.status = "the status feild is empty";
    }

    if (Validator.isEmpty(data.skills)) {
        errors.skills = "the email field is empty";
    }

    if (!isEmpty(data.website)) {
        if (!Validator.isURL(data.website)) {
            errors.website = "not a valid URL";
        }
    }

    if (!isEmpty(data.youtube)) {
        if (!Validator.isURL(data.youtube)) { // maybe this is where the error is found, the same for the other fields 
            errors.youtube = "not a valid youtube URL";
        }
    }

    if (!isEmpty(data.facebook)) {
        if (!Validator.isURL(data.facebook)) {
            errors.facebook = "not a valid facebook URL";
        }
    }

    if (!isEmpty(data.twitter)) {
        if (!Validator.isURL(data.twitter)) {
            errors.twitter = "not a valid twitter URL";
        }
    }

    if (!isEmpty(data.linkedin)) {
        if (!Validator.isURL(data.linkedin)) {
            errors.linkedin = "not a valid linkedin URL";
        }
    }

    if (!isEmpty(data.instagram)) {
        if (!Validator.isURL(data.instagram)) {
            errors.instagram = "not a valid instagram URL";
        }
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}