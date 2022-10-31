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
router.get('/add-review/:bookID', bksController.add_review_get);
router.post('/add-review', bksController.add_review_post);
// router.get('/logout', controller.logout_get); 
// router.get('/favorites', controller.favorites_get);
router.get('/join-club', bksController.join_club_get);
router.post('/join-club', bksController.join_club_post);

module.exports = router;
