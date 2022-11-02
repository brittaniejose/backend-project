const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema ({
    book: { type: Schema.Types.ObjectId, ref: 'Book'},
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: [true, "Review required to submit"] }
})


const Review = mongoose.model('review', reviewSchema); 

module.exports = Review;

