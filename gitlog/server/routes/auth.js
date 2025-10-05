const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GitHub OAuth routes
router.get('/github', authController.getGitHubAuthUrl);
router.post('/callback', authController.handleCallback);

// User routes
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);

module.exports = router;
