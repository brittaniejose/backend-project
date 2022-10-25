var express = require('express');
var router = express.Router();
const controller = require("../controllers/controller");

router.get('/signup', controller.signup_get);
router.post('/signup', controller.signup_post);
router.get('/login', controller.login_get);
router.post('/login', controller.login_post);
// router.get('/add-book', controller.ab_get);
// router.post('/add-book', controller.ab_post);
// router.get('/bookclub-schedule', controller.bcs_get);
// router.get('/favorites', controller.favorites_get);
// router.get('/join-club', controller.join_get);

module.exports = router;
