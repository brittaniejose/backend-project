var express = require("express");
var router = express.Router();
const Book = require("../models/Book");
const User = require("../models/User");
const Review = require("../models/Review");
const ClubUser = require("../models/Club");
const jwt = require("jsonwebtoken");

// Book Routes

const cookieValidator = async function (req, res, next) {
  console.log("auth middleware fired");
  if (req.cookies.jwt) {
    const currentUser = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

    const user = await User.findOne({_id: currentUser.id})
    console.log(`${user.username} is browsing`)
    req.user = user;
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
      res.render("genreTemplate", { books, user, genre });
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

  let searchInput = req.query.search;
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
      const firstLetterUpper = /(\b[a-z](?!\s))/g;
      searchInput = searchInput.replace(firstLetterUpper, function(x){return x.toUpperCase();})
      res.render("searchTemplate", { books, user, searchInput });
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

router.post("/add-review/:genre/:bookID", cookieValidator, async (req, res) => {
  console.log("add review post");
  let { genre, bookID } = req.params;
  let { content } = req.body;
  let postedAt = new Date().toLocaleString("en-US")

  const desiredBook = await Book.findOne({ _id: bookID });
  const userId = req.user.id;
  console.log(userId, "userID ln 96");
  if (desiredBook) {
      const review = await Review.create({ book: bookID, author: userId, content, postedAt });
      res.redirect(302, `/genre/${genre}/${bookID}`);
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
  let postedAt = new Date().toLocaleString("en-US")
  let newContent = req.body;

  Review.updateOne(
    { _id: reviewID },
    { content: newContent.content },
    { postedAt },
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
  const user = req.user;
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

router.get("/favorites", cookieValidator, async (req, res) => {
  const user = req.user;
  try {
    const userID = req.user.id;
    const aUser = await User.findById(userID).populate('favorites');
    const favorites = aUser.favorites;
    res.render('favoritesTemplate', { favorites, user });
  } catch (error) {
    console.error(error);
    res.status(400).json({message: "There was an error retrieving your favorites list"});
  }
})

router.post("/favorites", cookieValidator, async (req, res) => {
  let { bookID, bookTitle } = req.body;

  console.log(req.body, 'req body favorites')

  const userID = req.user.id;

  try {
    const user = await User.findById(userID).populate('favorites').exec();

    const inFavorites = user.favorites.some(favorite => favorite.id === bookID);
    if (inFavorites) {
      res.json({message: `${bookTitle} is already saved to your favorites`})
    } else {
      user.favorites.push(bookID);
      await user.save();
      res.status(201).json({message: `${bookTitle} has been added to favorites`});
    }
  } catch (err) {
    res.json({message: `There was an error adding ${bookTitle} to your favorites`})
  }
});

router.post("/delete-favorite", cookieValidator, async (req, res) => {
  console.log("delete favorite fired")
  let { bookID } = req.body;
  console.log(req.body, 'req body favorite')

  try {
    const userID = req.user.id;
    await User.findByIdAndUpdate(userID, { $pull: { favorites: bookID } })
    res.status(201).json({message: "book removed from favorites"})
  } catch (error) {
    console.error(error);
    res.status(400).json({message: 'There was an error removing the book from favorites'});
  }
});

module.exports = router;
