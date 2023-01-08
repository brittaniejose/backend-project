const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clubUserSchema = new Schema({
  dUsername: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "Please enter a discord username"],
  },
  discordID: {
    type: String,
    unique: true,
    required: [true, "Please enter a discord ID"],
  },
  bkSuggestions: {
    type: String,
  },
});

const ClubUser = mongoose.model("Clubuser", clubUserSchema);

module.exports = ClubUser;
