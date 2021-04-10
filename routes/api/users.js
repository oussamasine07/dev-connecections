const express = require("express");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const passport = require("passport");

// bringing other files
const keys = require("../../config/keys");
const User = require("../../models/User");

// loading the validators
const validateRegisterInput = require("../../validators/register");
const validateLoginInput = require("../../validators/login");


const router = express.Router();

// @route       get request
// @desc        showing the users route
// @access      public
router.get("/test", (req, res) => {
    res.json({
        msg: "this route from users"
    });
});

// @route       get request
// @desc        showing the users route
// @access      public
router.post("/register", (req, res) => {
    // // destructure values from the validation
    const { errors, isValid } = validateRegisterInput(req.body);

    // check for the name field
    if (!isValid) {
        console.log(isValid);
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then(foundUser => {
            if (foundUser) {
                // errors.email = "this is email is already exist"
                return res.status(400).json({ error: "this is email is already exist" })
            } else {
                // creating a new avatar for the user
                const avatar = gravatar.url(req.body.email, {
                    s: 200, // Size
                    r: "pg", // Rating
                    default: "mm"
                });

                // creating the new user
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    avatar
                });

                // hashing the password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err);
                    })
                });
            }
        })
        .catch()
});

// @route       post request
// @desc        login the user
// @access      private
router.post("/login", (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    // check for the name field
    if (!isValid) {
        console.log(isValid);
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email })
        .then(foundUser => {
            if (!foundUser) {
                errors.email = "User not found";
                return res.status(400).json(errors);
            }

            bcrypt.compare(password, foundUser.password)
                .then(isMatch => {
                    if (!isMatch) {
                        errors.password = "incorrect Password"
                        return res.status(400).json(errors);
                    } else {
                        // make the payload 
                        const payload = { id: foundUser.id, name: foundUser.name, email: foundUser.email, avatar: foundUser.avatar };

                        // sign the user 
                        jwt.sign(
                            payload,
                            keys.secretKies, { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: "Bearer " + token
                                })
                            }
                        );
                    }
                });
        })
});

// @route       get request
// @desc        getting the current loged user
// @access      public
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
})

module.exports = router;