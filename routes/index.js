var express = require("express");
var router = express.Router();
const User = require("../models/User");
const Book = require("../models/Book");
const jwt = require("jsonwebtoken");

/* GET home page. */

router.get("/", function (req, res) {
  console.log("index route");

  // let books = Book.find({ rating: {$gt: 7 }}, "title cover genre rating").sort({ rating: -1 }).limit(3)

  // console.log(books)

  if (req.cookies.jwt) {
    const user = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    console.log(user);

    res.render("index", { title: "ReadIt", user });
  } else {
    res.render("index", { title: "ReadIt", user: false });
  }
});

module.exports = router;
