const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema;


const userSchema = new Schema ({
    username: { 
        type: String,
        required: [true, "Please enter a username"],
        maxlength: [15, "Username cannot be more than 15 characters"],
        minlength: [3, "Username cannot be less than 6 characters"],
        unique: true,
        lowercase: true

    },
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [6, "Minimum password length is 6 characters"]
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review'}]
});

const User = mongoose.model('User', userSchema);


module.exports = User;
