const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: { type: String },
  author: { type: String },
  genre: { type: Array },
  published: { type: String },
  desc: { type: String },
  cover: { type: String },
  rating: { type: Number },
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
