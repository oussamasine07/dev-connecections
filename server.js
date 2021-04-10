const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const app = express();

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

// bring the db location 
const db = require("./config/keys").mongoURI;

// make the connection to database
mongoose.connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log("databas connected");
});

// sitting up the bodyparser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// add the passport middleware
app.use(passport.initialize());

// getting the passport form the passport.js file
require("./config/passport")(passport);

app.use("/api/users", users)
app.use("/api/profile", profile)
app.use("/api/posts", posts)

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});