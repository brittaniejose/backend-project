const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id, username) => {
    // remember to hide secret in .env file
    return jwt.sign({ id, username: username }, process.env.JWT_SECRET, {
        expiresIn: maxAge
    });
}

// function validationErrs (error) { 
//     let errors = { username: '', email: '', password: ''};

//     // incorrect email error
//     if (error.message === 'incorrect email') {
//         errors.email = 'This email is not registered'
//     }

//     // incorrect password error
//     if (error.message === 'incorrect password') {
//         errors.email = 'Password is incorrect'
//     }

//     // duplicate email error
//     if (error.keyPattern.email === 1) {
//         errors.email = 'This email is already registered';
//         console.log(errors);
//     }
//     // duplicate username error
//     if (error.keyPattern.username === 1) {
//         errors.username = `${error.keyValue.username} is already taken`;
//         console.log(errors);
//     }

//     if (error.message.includes('user validation failed')) {
//         Object.values(error.errors).forEach(({properties}) => {
//             errors[properties.path] = properties.message
//         });
//     }
//     return errors;
// }


module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.signup_post = async (req, res) => {
    console.log('post signup start');
    
    let { username, email, password } = req.body;
    const existingUser = await User.findOne({
        username: username,
        email: email
    });
    console.log("existing user" + existingUser)
    
    if (!existingUser) {
        bcrypt.hash(password, saltRounds,  async function (err, hash) {
            password = hash;
            const newUser = await User.create({ username, email, password })
            const token = createToken(newUser._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
            console.log("new user", newUser);
            res.status(201).json({user: newUser._id});
        })
        // user exists add code to show exisiting user error
        // if user exists, tell it what to do, add existing user to error handling
    } else if (existingUser.username) {
        throw Error(`${username} is already taken`)

    } else if (existingUser.email) {
        throw Error('This email is already in use')
    }

    // if (error) {
    //     console.log("error" + error);
    //     const errors = validationErrs(error)
    //     res.status(400).json({errors});
    // }
}

module.exports.login_get = (req, res) => {
    // if (req.cookies.jwt) {
 
    //     console.log('if')
    //     const user = User.findOne({ "_id": jwt.verify(req.cookies.jwt, process.env.JWT_SECRET).id}, "username")
    //     console.log(user)
      
    //     res.render('index', { title: 'ReadIt', user });
    //   } else {
    //     console.log('else')
    //     res.render('index', { title: 'ReadIt', user: false });
    //   }

    console.log('login get')
    const user = { username: "Stephen King" }
    res.render('login', user);

}

module.exports.login_post = async (req, res) => {
    console.log('login post');

    let { username, email, password } = req.body;
    const existingUser = await User.findOne({
        username: username,
        email: email,
    });

    if (existingUser) {
        const auth = await bcrypt.compare(password, existingUser.password);
            if (auth) {
                console.log('user logged in');
                const token = createToken(existingUser._id, existingUser.username);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
                console.log("jwt token", token)
                res.status(201).json({user: existingUser._id});
            } else {
                console.log(err);
            res.redirect('/signup')
            }
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}


