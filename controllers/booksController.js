const Book = require('../models/Book');
const User = require('../models/User');
const Review = require('../models/Review');
const ClubUser = require('../models/Club');
const jwt = require('jsonwebtoken');


module.exports.genre_get = (req, res) => {
    console.log('genre get route');
    let { genre } = req.params

    // making first letter of genre to uppercase to match db syntax
    genre = genre.split("")
    genre[0] = genre[0].toUpperCase()
    genre = genre.join('')
    
    // const toUpper = new RegExp(/\w\S*/g);
    // const excludeSymbols = new RegExp(/[^a-zA-Z ]/g, "");

    // produces error with non-fiction genre

    // genre = function fixGenre(str) {
    //     return str.replace(toUpper.source + "|" + excludeSymbols.source)
    // }

    
    console.log(genre, 'updated genre')

    Book.find({ "genre": genre }, "title author published cover genre rating", function(err, books) {
        console.log(books);

        res.render('genreTemplate', {books})
    });

}

// More Info Page
// Show reviews here
module.exports.book_get = (req, res) => {
    let { bookID, genre } = req.params;
    Book.findOne({ "_id": bookID, "genre": genre }, "title author published desc cover rating genre reviews", async function (err, book) {
        // console.log(book);
        // console.log(bookID);

        const reviews = await Review.find({ book: bookID }).populate('author')

        const user =  jwt.verify(req.cookies.jwt, process.env.JWT_SECRET)

        res.render('bookTemplate', {book, reviews, user})
    })
}

// Review GET Here
module.exports.review_delete_get = (req, res) => {
    let { bookID, reviewID } = req.params
    const user = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET)

    const review = Review.findOne({ _id: reviewID, book: bookID }).populate('book')

    console.log(review)
    res.render('review-delete', { review, user })
    
}
// Review.deleteOne({  })

module.exports.search_get = (req, res) => {
    // search db to return books that match search value
    
    const title = req.query.search;
    const author = req.query.search;
    let regex = new RegExp(req.query.search,'i');
    console.log(regex)

    Book.find({ $or: [
        { author: regex }, 
        { title: regex }
    ] }, "title author published desc cover genre rating _id", function (err, books) {
        if (err) {
            res.send(err)
        }
        console.log(req.query);
        const user =  jwt.verify(req.cookies.jwt, process.env.JWT_SECRET) 

        res.render('searchTemplate', {books, user})
    })

};

module.exports.add_review_get = (req, res) => {
    let { bookID } = req.params;
    
    Book.findOne({ "_id": bookID }, "title author published desc cover rating genre", function (err, book) {
        // console.log(book);
        // console.log(bookID);
        
        
        const user =  jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
        
        res.render('add-review', {book, user})

    })
      
}

module.exports.add_review_post = (req, res) => {
    console.log('add review post');
    let { bookID } = req.params
    let { author, content } = req.body

    const desiredBook = Book.findOne({ "_id": bookID })
    
    const token = req.cookies.jwt
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    var userId = decoded.id  
    console.log(userId)  
    const currentUser = User.findOne({ "_id": userId })
    
    if (desiredBook) {
        console.log(bookID, currentUser._id, content)
        newReview = Review.create({ book: bookID, author: userId, content }, function (err, review) {
            if (err) {
                console.log(err);
                res.send("there was an err " + err)
            } else {
                console.log(review)
                res.redirect(302, '/');
            }
        })
        
    }
    
}

module.exports.join_club_get = (req, res) => {
    const user =  jwt.verify(req.cookies.jwt, process.env.JWT_SECRET) 
    res.render('join-club', { user });
}

module.exports.join_club_post = async (req, res) => {
    let { dUsername, discordID, bkSuggestions } = req.body

    const existingClubUser = await ClubUser.findOne({
        dUsername: dUsername,
        discordID: discordID
    })

    console.log(existingClubUser, "existingClubUser");

    if(!existingClubUser) {
        const newClubUser = await ClubUser.create({ dUsername, discordID, bkSuggestions });

        console.log("new club user!", newClubUser);
    
        res.redirect(302, '/');
    } else {
        throw Error("You've already joined");
    }
}