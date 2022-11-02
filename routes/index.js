var express = require('express');
var router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/* GET home page. */

router.get('/', function(req, res) {
  console.log('header')
  
 
  if (req.cookies.jwt) {

    const user =  jwt.verify(req.cookies.jwt, process.env.JWT_SECRET)
    console.log(user)
  
    res.render('index', { title: 'ReadIt', user });
  } else {

    res.render('index', { title: 'ReadIt', user: false });
  }
});


module.exports = router;
