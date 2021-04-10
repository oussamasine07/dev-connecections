const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

// loading the validators
const validateProfileInput = require("../../validators/profile");
const validateExperienceInput = require("../../validators/experience");
const validateEducationInput = require("../../validators/education");

// bringin the models (users and profile)
const User = require("../../models/User");
const Profile = require("../../models/Profile");

const router = express.Router();

router.get("/test", (req, res) => {
    res.json({
        msg: "this route from profile"
    });
});

// @route       get request
// @desc        SEO : seach for users
// @access      public
router.get("/handle/:handle", (req, res) => {
    let errors = {}
    Profile.findOne({ handle: req.params.handle })
        .then(foundUser => {
            if (!foundUser) {
                errors.handle = "there is no user registered for this handle";
                return res.status(404).json(errors.handle);
            }
            res.json(foundUser);
        })
});

// @route       get request
// @desc        get user by it's id
// @access      public
router.get("/user/:user_id", (req, res) => {
    let errors = {}
    Profile.findOne({ user: req.params.user_id })
        .then(foundUser => {
            if (!foundUser) {
                errors.user = "User NOT found";
                return res.status(404).json(errors.user);
            }
            res.json(foundUser);
        })
});

// @route       get request
// @desc        SEO : seach for users
// @access      public
router.get("/all", (req, res) => {
    let errors = {}

    Profile.find()
        .then(foundUsers => {
            if (!foundUsers) {
                errors.profile = "no profile registered yet";
                return res.status(404).json(errors.profile);
            }
            res.json(foundUsers);
        })
});

// @route       get request
// @desc        getting the current loged user
// @access      private
router.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
    let errors = {};
    Profile.findOne({ user: req.user.id })
        .then(foundUser => {
            if (!foundUser) {
                errors.noprofile = "there is no user found with this profile";
                return res.json(errors)
            }
        })
        .catch(error => {
            console.log(error)
        });
})

// @route       post request
// @desc        getting the current loged user
// @access      privat
router.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {

    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors)
    }



    // initalizing a profile object
    let profileFields = {};
    // setting the keys and values the profileField object
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.status) profileFields.status = req.body.status;

    // settign the skills field to an array
    if (typeof req.body.skills !== "undefined") {
        profileFields.skills = req.body.skills.split(",");
    };

    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instgram) profileFields.social.instgram = req.body.instgram;

    Profile.findOne({ user: req.user.id })
        .populate('users', ['name', 'avatar'])
        .then(foundProfile => {
            if (foundProfile) {
                // chek if there is a profile, so we're going o update it
                Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
                    .then(profile => res.json(profile));
            } else {
                // if there is no profile we're going to make an other one
                Profile.findOne({ handle: profileFields.handle })
                    .then(foundProfile => {
                        if (foundProfile) {
                            errors.handle = "this handle is already exists";
                            res.status(400).json(errors.handle);
                        }

                        new Profile(profileFields)
                            .save()
                            .then(profile => res.json(profile));
                    })
            }
        })

})

// @route       post request
// @desc        getting the current loged user
// @access      privat
router.post("/experience", passport.authenticate("jwt", { session: false }), (req, res) => {

    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors)
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {

            // creat the new experience object
            let newExperience = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                description: req.body.description
            }

            profile.experience.unshift(newExperience);
            profile.save().then(profile => {
                res.json(profile);
            });

        })
})

router.post("/education", passport.authenticate("jwt", { session: false }), (req, res) => {
    // validate forms
    const { errors, isValid } = validateEducationInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {

            // create the new education object
            const newEducation = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                description: req.body.description
            }

            profile.education.unshift(newEducation);
            profile.save().then(profile => {
                res.json(profile);
            })
        });
});

// delete the experience route
router.delete("/experience/:exp_id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const removeExperience = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
            profile.experience.splice(removeExperience, 1);
            profile.save().then(profile => res.json(profile));
        })
});

// delete the education route
router.delete("/education/:edu_id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const removeEducation = profile.education.map(item => item.id).indexOf(req.params.edu_id);
            profile.education.splice(removeEducation, 1);
            profile.save().then(profile => res.json(profile));
        })
});

// delete an entire profile and the user
router.delete("/", passport.authenticate("jwt", { session: false }), (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
        .then(() => {
            User.findOneAndRemove({ _id: req.user.id })
                .then(() => {
                    res.json({ success: "the intire user was successfuly deleted." })
                });
        });
});

module.exports = router