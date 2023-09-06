const express = require('express');
const controller = require('../controllers/userController');
const { isGuest, isLoggedIn } = require('../middlewares/auth');
const {validateLogin,validateSignup, validationresult} = require('../middlewares/validator');
const{logInLimiter} =require('../middlewares/rateLimiters');
const router = express.Router();

router.get('/new',isGuest,controller.new);
router.post('/',isGuest,logInLimiter,validateSignup,validationresult, controller.create);
router.get('/login',isGuest,controller.getUserLogin);
router.post('/login',isGuest,logInLimiter,validateLogin,validationresult, controller.login);
router.get('/profile', isLoggedIn, controller.profile);
router.get('/logout', isLoggedIn,controller.logout);

module.exports = router;