const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getCreators, addCreator, removeCreator } = require('../db/database');

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// 제작자 확인 미들웨어
const checkIsCreator = (req, res, next) => {
  const { isCreator } = require('../db/database');
  const isCreatorUser = isCreator(req.user.login, req.user.id);
  
  if (!isCreatorUser) {
    return res.status(403).json({ error: 'Forbidden', message: '제작자만 접근할 수 있습니다.' });
  }
  
  next();
};

// 제작자 목록 조회
router.get('/creators', authenticateToken, checkIsCreator, (req, res) => {
  try {
    const creators = getCreators();
    
    res.json({
      creators: creators.map(creator => ({
        id: creator.id,
        githubLogin: creator.github_login,
        githubUserId: creator.github_user_id,
        name: creator.name,
        role: creator.role,
        createdAt: creator.created_at
      }))
    });
  } catch (error) {
    console.error('❌ [제작자 목록] 조회 오류:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 제작자 추가
router.post('/creators', authenticateToken, checkIsCreator, (req, res) => {
  try {
    const { githubLogin, githubUserId, name } = req.body;
    
    if (!githubLogin) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'GitHub 로그인이 필요합니다.'
      });
    }
    
    const creator = addCreator(githubLogin, githubUserId, name);
    
    if (!creator) {
      return res.status(409).json({
        error: 'Conflict',
        message: '이미 등록된 제작자입니다.'
      });
    }
    
    console.log(`✅ [제작자 추가] ${githubLogin} 추가됨`);
    
    res.json({
      success: true,
      message: '제작자가 추가되었습니다.',
      creator: {
        githubLogin: creator.github_login,
        githubUserId: creator.github_user_id,
        name: creator.name
      }
    });
  } catch (error) {
    console.error('❌ [제작자 추가] 오류:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 제작자 삭제
router.delete('/creators/:githubLogin', authenticateToken, checkIsCreator, (req, res) => {
  try {
    const { githubLogin } = req.params;
    
    const removed = removeCreator(githubLogin);
    
    if (!removed) {
      return res.status(404).json({
        error: 'Not found',
        message: '제작자를 찾을 수 없습니다.'
      });
    }
    
    console.log(`✅ [제작자 삭제] ${githubLogin} 삭제됨`);
    
    res.json({
      success: true,
      message: '제작자가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('❌ [제작자 삭제] 오류:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;

