const express = require('express');
const userController = require('./../../controllers/userAuthControllers/userController');
const authController = require('./../../controllers/userAuthControllers/authController');

const router = express.Router();

// Route for signup
router.get('/signup', (req, res) => {
  res.status(200).json({
    message: 'Signup endpoint',
    title: 'Sign Up',
  });
});

// Route for login
router.get('/login', (req, res) => {
  res.status(200).json({
    message: 'Login endpoint',
    title: 'Log into your account',
  });
});

// Route for handling signup form submission
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
