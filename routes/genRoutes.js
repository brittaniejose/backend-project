var express = require('express');
var router = express.Router();
const controller = require("../controllers/authController");
const bksController = require("../controllers/booksController")

router.get('/signup', controller.signup_get);
router.post('/signup', controller.signup_post);
router.get('/login', controller.login_get);
router.post('/login', controller.login_post);
router.get('/genre/:genre/:bookID', bksController.book_get);
router.get('/genre/:genre', bksController.genre_get);
router.get('/search', bksController.search_get);
// router.get('/add-book', controller.ab_get);
// router.post('/add-book', controller.ab_post);
// router.get('/bookclub-schedule', controller.bcs_get);
// router.get('/favorites', controller.favorites_get);
// router.get('/join-club', controller.join_get);

module.exports = router;
