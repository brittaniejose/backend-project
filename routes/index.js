var express = require("express");
var router = express.Router();
const User = require("../models/User");
const Book = require("../models/Book");
const jwt = require("jsonwebtoken");

/* GET home page. */

router.get("/", async function (req, res) {
  console.log("index route");

  if (req.cookies.jwt) {
    const currentUser = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    const user = await User.findOne({_id: currentUser.id})
    console.log(`${user.username} is browsing`)
    res.render("index", { title: "ReadIt", user: user });
  } else {
    res.render("index", { title: "ReadIt", user: false });
  }
});

module.exports = router;
