const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book" },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: [true, "Review required to submit"] },
  postedAt: { type: String }
});

reviewSchema.pre('save', function(next) {
  console.log("pre middleware function fired")
  this.postedAt = new Date().toLocaleString("en-US")
  next();
})

const Review = mongoose.model("review", reviewSchema);

module.exports = Review;
