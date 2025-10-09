const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GitHub OAuth 라우트
router.get('/github', authController.getGitHubAuthUrl);
router.post('/callback', authController.handleCallback);

// 사용자 라우트
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);

module.exports = router;