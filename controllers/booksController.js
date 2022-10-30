const Book = require('../models/Books');


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

module.exports.book_get = (req, res) => {
    let { bookID, genre } = req.params;
    Book.findOne({ "_id": bookID, "genre": genre }, "title author published desc cover rating genre", function (err, book) {
        console.log(book);
        console.log(bookID);

        res.render('bookTemplate', {book})
    })
}

module.exports.search_get = (req, res) => {
    // search db to return books that match search value
    
    const title = req.query;
    const author = req.query.search;
    let regex = new RegExp(req.query.search,'i');
    console.log(regex)

    Book.find({ $or: [
        { author: regex }, 
        { title: regex }
    ] }, "title author published desc cover genre rating", function (err, books) {
        if (err) {
            res.send(err)
        }
        console.log(req.query);
        console.log(books)
        res.render('searchTemplate', {books})
    })

};

