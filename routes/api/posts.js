const express = require("express");
const passport = require("passport");

const router = express.Router();

// load the Psot model
const Post = require("../../models/Post");
// load Profile model
const Profile = require("../../models/Profile");

// load validators
const validatePostInput = require("../../validators/post");

router.get("/test", (req, res) => {
    res.json({
        msg: "this route from posts"
    });
});

// getting all the posts
router.get("/", (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(foundPosts => {
            res.json(foundPosts);
        })
        .catch(err => {
            res.status(404).json({ errorpost: "no posts found" });
        });
});

// geeting single post
router.get("/:id", (req, res) => {
    Post.findById(req.params.id)
        .then(foundPost => {
            res.json(foundPost)
        })
        .catch(err => {
            res.status(404).json({ errorpost: "no posts found" });
        });
})

router.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {
    // validate errors 
    const { errors, isValid } = validatePostInput(req.body)

    if (!isValid) {
        return res.status(400).json(errors);
    }

    // create the new post
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => {
        res.json(post);
    });
});

// deleting the post route
router.delete("/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(foundProfile => {
            Post.findById(req.params.id)
                .then(foundPost => {
                    const post = foundPost.user.toString();
                    // check if this is not the current logged in user
                    if (post !== req.user.id) {
                        return res.status(401).json({ authError: "This user is not authorized to delete this post" })
                    }

                    // if this is the current user continue the deleting process
                    foundPost.remove().then(() => res.json({ success: "post deleted successfuly" }));
                })
        })
        .catch(err => res.status(404).json({ errPost: "this post in not found" }));
});

// add likes to the post
router.post("/likes/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.length === 0) {
                        post.likes.unshift({ user: req.user.id });
                        post.save().then(post => res.json(post))
                    } else {
                        post.likes.forEach(like => {
                            if (like.user.toString() === req.user.id) {
                                return res.status(400).json({ likedpost: "you already liked this post" });
                            } else {
                                post.likes.unshift({ user: req.user.id });
                                post.save().then(post => res.json(post))
                            }
                        });
                    }
                })
        })
});

// add the unlike route
router.post("/unlike/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    const removedPost = post.likes.map(like => like.user).indexOf(req.user.id);
                    post.likes.splice(removedPost, 1);
                    post.save().then(post => {
                        res.json(post);
                    });

                    if (post.likes.length > 0) {
                        post.likes.forEach(like => {
                            if (like.user === req.user.id) {
                                const removedPost = post.likes.map(like => like.user).indexOf(req.user.id);
                                post.likes.splice(removedPost, 1);
                                post.save().then(post => {
                                    res.json(post);
                                });
                            } else {
                                return res.status(400).json({ likedpost: "you can't unlike this post" });
                            }
                        });
                    } else {
                        res.json({ likedpost: "there are no liked posts to unlike " });
                    }
                })
        })
});

// add comments
router.post("/comment/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body)

    if (!isValid) {
        return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                user: req.user.id,
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                date: req.body.date
            }

            post.comments.unshift(newComment);
            post.save().then(post => res.json(post));
        })
        .catch(err => console.log(err))
});

// deleting comment from the post
router.delete("/del_comment/:id/:com_id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if (post.comments.filter(comment => comment._id.toString() === req.params.com_id).length === 0) {
                return res.status(404).json({ commentnotexists: "this comment does not exists" });
            }
            // selecting the comment we want to remove
            const removeComment = post.comments.map(comment => comment.user).indexOf(req.user.id);
            // remove the comment from the array
            post.comments.splice(removeComment, 1);
            post.save().then(post => res.json(post));
        })
        .catch(err => console.log(err));
});

module.exports = router;