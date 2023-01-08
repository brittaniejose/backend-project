var express = require("express");
var router = express.Router();
const Book = require("../models/Book");
const User = require("../models/User");
const Review = require("../models/Review");
const ClubUser = require("../models/Club");
const jwt = require("jsonwebtoken");

// Book Routes

const cookieValidator = function (req, res, next) {
  console.log("auth middleware fired");
  if (req.cookies.jwt) {
    req.user = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/genre/:genre", cookieValidator, (req, res) => {
  console.log("genre get route");
  let { genre } = req.params;

  const user = req.user;
  Book.find(
    { genre: genre },
    "title author published cover genre rating",
    function (err, books) {
      res.render("genreTemplate", { books, user });
    }
  );
});

router.get("/genre/:genre/:bookID", cookieValidator, (req, res) => {
  let { bookID, genre } = req.params;
  const user = req.user;
  Book.findOne(
    { _id: bookID, genre: genre },
    "title author published desc cover rating genre reviews",
    async function (err, book) {
      const reviews = await Review.find({ book: bookID }).populate("author");
      res.render("bookTemplate", { book, reviews, user });
    }
  );
});

router.get("/search", cookieValidator, (req, res) => {
  // search db to return books that match search value

  const title = req.query.search;
  const author = req.query.search;
  let regex = new RegExp(req.query.search, "i");
  console.log(regex);

  const user = req.user;

  Book.find(
    { $or: [{ author: regex }, { title: regex }] },
    "title author published desc cover genre rating _id",
    function (err, books) {
      if (err) {
        res.send(err);
      }
      res.render("searchTemplate", { books, user });
    }
  );
});

router.get("/add-review/:genre/:bookID", cookieValidator, (req, res) => {
  let { bookID } = req.params;
  const user = req.user;

  Book.findOne(
    { _id: bookID },
    "title author published desc cover rating genre",
    function (err, book) {
      res.render("add-review", { book, user });
    }
  );
});

router.post("/add-review/:genre/:bookID", cookieValidator, (req, res) => {
  console.log("add review post");
  let { genre, bookID } = req.params;
  let { content } = req.body;

  const desiredBook = Book.findOne({ _id: bookID });
  const userId = req.user.id;
  console.log(userId, "userID ln 96");
  if (desiredBook) {
    Review.create(
      { book: bookID, author: userId, content },
      function (err, review) {
        if (err) {
          console.log(err);
          res.send("there was an error " + err);
        } else {
          console.log("review created successfully");
          res.redirect(302, `/genre/${genre}/${bookID}`);
        }
      }
    );
  }
});

router.get("/review-delete/:genre/:bookID/:reviewID", cookieValidator, (req, res) => {
  let { bookID, reviewID } = req.params;
  const user = req.user;

  Review.findOne({ _id: reviewID, book: bookID }, "content")
    .populate("book")
    .exec(function (err, review) {
      res.render("review-delete", { review, user });
    });
});

router.post("/review-delete/:genre/:bookID/:reviewID", cookieValidator, (req, res) => {
  console.log("review-delete post");
  let { genre, bookID, reviewID } = req.params;

  Review.deleteOne({ _id: reviewID, book: bookID }, function (err, reviewID) {
    if (err) {
      console.log(`Review with ReviewId: ${reviewID} could not be deleted`);
    } else {
      console.log(`Review with ReviewId: ${reviewID} was deleted`);

      res.redirect(302, `/genre/${genre}/${bookID}`);
    }
  });
});

router.get("/review-edit/:genre/:bookID/:reviewID", cookieValidator, (req, res) => {
  const user = req.user;

  let { bookID, reviewID } = req.params;

  Review.findOne({ _id: reviewID, book: bookID }, "content")
    .populate("book")
    .exec(function (err, review) {
      res.render("review-edit", { review, user });
    });
});

router.post("/review-edit/:genre/:bookID/:reviewID", cookieValidator, (req, res) => {
  let { genre, bookID, reviewID } = req.params;
  let newContent = req.body;

  Review.updateOne(
    { _id: reviewID },
    { content: newContent.content },
    function (err, review) {
      if (err) {
        console.log(req.body);
        console.log(err, "review edit error");
      } else {
        console.log(newContent, "updated review with new content");

        res.redirect(302, `/genre/${genre}/${bookID}`);
      }
    }
  );
});

router.get("/join-club", cookieValidator, (req, res) => {
  const user = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
  res.render("join-club", { user });
});

function joinClubErrors(error) {
  let errors = { dUsername: "", discordID: "" };

  if (error.keyPattern.dUsername === 1) {
    errors.dUsername = "This username is already registered";
  }

  if (error.keyPattern.discordID === 1) {
    errors.discordID = "This discordID is already registered";
  }

  return errors;
}

router.post("/join-club", cookieValidator, async (req, res) => {
  let { dUsername, discordID, bkSuggestions } = req.body;

  try {
    const newClubUser = await ClubUser.create({
      dUsername,
      discordID,
      bkSuggestions,
    });

    res.status(201).json({ clubUser: newClubUser._id });
  } catch (error) {
    console.log(error);
    const errors = joinClubErrors(error);
    res.status(400).json({ errors });
  }
});

module.exports = router;
