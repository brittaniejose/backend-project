const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id, username) => {
  return jwt.sign({ id, username: username }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

function signupErrors (error) {
    let errors = { username: '', email: '', password: ''};
    
    // duplicate username error
    if (error.keyPattern.username === 1) {
        errors.username = `${error.keyValue.username} is already taken`;
        console.log(errors);
    };
    // duplicate email error
    if (error.keyPattern.email === 1) {
      errors.email = 'This email is already registered';
      console.log(errors);
    };
    
    if (error.message.includes('user validation failed')) {
        Object.values(error.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        });
    };
    return errors;
};

function loginErrors(error) {
  let errors = { username: '', password: '', server: ''}
      // incorrect email error
      if (error.message === 'incorrect username') {
        errors.username = 'This username is not registered'
      } else if (error.message === 'incorrect password') {
        errors.password = 'Password is incorrect'
      } else {
        errors.server = error;
      }
      
    return errors
}

module.exports.signup_get = (req, res) => {
  if (req.cookies.jwt) {
    const user = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    res.render("signup", { user });
  } else {
    res.render("signup", { user: false });
  }
};

module.exports.signup_post = async (req, res) => {
  console.log("post signup start");

  let { username, email, password } = req.body

  try {
      const newUser = await User.create({ username, email, password });
      const token = createToken(newUser._id, newUser.username);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(201).json({ user: newUser });
    }

  catch (error) {
    console.log('catch block fired for signup error ln 74');
    const errors = signupErrors(error);
    res.status(400).json({errors});
  }
  
  };

module.exports.login_get = (req, res) => {
  res.render("login", { user: false });
};

module.exports.login_post = async (req, res) => {
  console.log("login post");

  const { username, password } = req.body;
  try {
    const existingUser = await User.login(username, password)
    console.log("user logged in");
    const token = createToken(existingUser._id, existingUser.username);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: existingUser });
  } catch (error) {
    console.log('catch block fired for login error ln 108');
    const errors = loginErrors(error);
    res.status(400).json({errors});
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
