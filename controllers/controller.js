const User = require('../models/User');

function handler(error) {
    let errors = { username: '', email: '', password: ''};

    // incorrect email error
    if (error.message === 'incorrect email') {
        errors.email = 'This email is not registered'
    }

    // incorrect password error
    if (error.message === 'incorrect password') {
        errors.email = 'Password is incorrect'
    }

    // duplicate email error
    if (error.keyPattern.email === 1) {
        errors.email = 'This email is already registered';
        console.log(errors);
    }
    // duplicate username error
    if (error.keyPattern.username === 1) {
        errors.username = `${error.keyValue.username} is already taken`;
        console.log(errors);
    }

    if (error.message.includes('user validation failed')) {
        Object.values(error.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        });
    }
    return errors;
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.signup_post = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = await User.create({ username, email, password })
        console.log(req.body);
        res.status(201).json({user: newUser._id});
        
    } catch (error) {
        console.log(error);
        const errors = handler(error)
        
        res.status(400).json({errors});
    }
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.login_post = (req, res) => {
    const { username, email, password } = req.body;
    console.log(User);
    console.log(req.body);
    res.send("user logged in");
}
