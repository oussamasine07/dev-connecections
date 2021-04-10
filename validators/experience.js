const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateExperienceInput(data) {
    let errors = {};

    data.title = !isEmpty(data.title) ? data.title : '';
    data.company = !isEmpty(data.company) ? data.company : '';
    data.from = !isEmpty(data.from) ? data.from : '';


    if (Validator.isEmpty(data.title)) {
        errors.title = "the title feild is empty";
    }

    if (Validator.isEmpty(data.company)) {
        errors.company = "the company feild is empty";
    }

    if (Validator.isEmpty(data.from)) {
        errors.from = "the from feild is empty";
    }


    return {
        errors,
        isValid: isEmpty(errors)
    }
}