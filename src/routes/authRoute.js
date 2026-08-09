const express = require('express');
const { userSignUp, userLogIn } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', userSignUp);
router.post('/login', userLogIn);

module.exports = router;