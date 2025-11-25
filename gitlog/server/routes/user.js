const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getUserUsage, getPayments } = require('../db/database');

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

// 사용자 사용 기록 조회
router.get('/usage', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const githubLogin = req.user.login;

    const usage = getUserUsage(userId, githubLogin);

    // 무료 분석 남은 횟수 계산
    const FREE_ANALYSIS_LIMIT = 2;
    const freeRemaining = Math.max(0, FREE_ANALYSIS_LIMIT - usage.free_analysis_used);
    
    // 프리미엄 구독 상태 확인
    const isPremium = usage.is_premium === 1;
    let premiumExpiresAt = null;
    let isPremiumActive = false;
    
    if (isPremium && usage.premium_expires_at) {
      premiumExpiresAt = usage.premium_expires_at;
      isPremiumActive = new Date(premiumExpiresAt) > new Date();
    }

    res.json({
      userId: usage.user_id,
      githubLogin: usage.github_login,
      analysisCount: usage.analysis_count,
      freeAnalysisUsed: usage.free_analysis_used,
      freeAnalysisRemaining: freeRemaining,
      freeAnalysisLimit: FREE_ANALYSIS_LIMIT,
      isPremium: isPremium,
      isPremiumActive: isPremiumActive,
      premiumExpiresAt: premiumExpiresAt
    });
  } catch (error) {
    console.error('❌ [사용자 사용 기록] 조회 오류:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 결제 내역 조회
router.get('/payments', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const payments = getPayments(userId);

    res.json({
      payments: payments.map(payment => ({
        id: payment.id,
        paymentId: payment.payment_id,
        amount: payment.amount,
        paymentMethod: payment.payment_method,
        status: payment.status,
        paymentProvider: payment.payment_provider,
        planType: payment.plan_type,
        expiresAt: payment.expires_at,
        createdAt: payment.created_at
      }))
    });
  } catch (error) {
    console.error('❌ [결제 내역] 조회 오류:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;

