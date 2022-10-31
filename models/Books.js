const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema ({
    title: { type: String },
    author: { type: String },
    genre: { type: Array },
    published: { type: String },
    desc: { type: String },
    cover: { type: String },
    rating: { type: Number },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }]
});

const reviewSchema = new Schema ({
    book: [{ type: Schema.Types.ObjectId, ref: 'Book'}],
    author: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    content: { type: String },
    timestamps: { type: Boolean }
})

const Book = mongoose.model('book', bookSchema);
const Review = mongoose.model('review', reviewSchema);

module.exports = Book;
module.exports = Review;


