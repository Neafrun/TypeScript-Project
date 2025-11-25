const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { updateUserSubscription } = require('../db/database');

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

// 플랜 정보
const PLANS = {
  basic: {
    name: '베이직',
    price: 6900,
    analysisLimit: 10,
    duration: 30 // 일
  },
  pro: {
    name: '프로',
    price: 12500,
    analysisLimit: -1, // 무제한
    duration: 30 // 일
  },
  annual: {
    name: '연간',
    price: 99000,
    analysisLimit: -1, // 무제한
    duration: 420 // 일 (14개월)
  }
};

// 결제 검증 (더미 데이터 - 실제 결제 시스템처럼 동작)
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { paymentId, planType, provider } = req.body;
    const userId = req.user.id;

    console.log(`💳 [더미 결제] 사용자: ${req.user.login}, 플랜: ${planType}, 결제 ID: ${paymentId}`);

    // 플랜 확인
    const plan = PLANS[planType];
    if (!plan) {
      return res.status(400).json({
        error: 'Invalid plan type',
        message: '유효하지 않은 플랜입니다.'
      });
    }

    // 더미 결제 검증 시뮬레이션 (항상 성공)
    // 실제 결제 시스템 연동 시 여기서 결제 검증
    // TODO: 토스페이먼츠/아임포트 API로 실제 결제 검증
    
    // 더미 결제 정보 생성
    const dummyPaymentMethods = ['카드', '계좌이체', '간편결제'];
    const randomMethod = dummyPaymentMethods[Math.floor(Math.random() * dummyPaymentMethods.length)];
    
    // 만료일 계산
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    // 결제 데이터
    const paymentData = {
      payment_id: paymentId || `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      amount: plan.price,
      payment_method: randomMethod,
      status: 'completed',
      payment_provider: provider || 'dummy',
      provider_payment_id: `PROVIDER_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      plan_type: planType,
      expires_at: expiresAt.toISOString()
    };

    // 사용자 구독 업데이트
    updateUserSubscription(userId, paymentData);

    console.log('✅ [더미 결제] 결제 완료 및 구독 업데이트:', {
      paymentId: paymentData.payment_id,
      amount: paymentData.amount,
      plan: plan.name,
      expiresAt: expiresAt.toISOString()
    });

    res.json({
      success: true,
      message: '결제가 완료되었습니다.',
      payment: {
        paymentId: paymentData.payment_id,
        planType: planType,
        planName: plan.name,
        amount: plan.price,
        paymentMethod: randomMethod,
        expiresAt: expiresAt.toISOString(),
        expiresAtFormatted: expiresAt.toLocaleDateString('ko-KR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      }
    });
  } catch (error) {
    console.error('❌ [결제 검증] 오류:', error);
    res.status(500).json({
      error: 'Payment verification failed',
      message: error.message
    });
  }
});

// 플랜 정보 조회
router.get('/plans', (req, res) => {
  try {
    const plans = Object.keys(PLANS).map(key => ({
      id: key,
      name: PLANS[key].name,
      price: PLANS[key].price,
      analysisLimit: PLANS[key].analysisLimit,
      duration: PLANS[key].duration
    }));

    res.json({ plans });
  } catch (error) {
    console.error('❌ [플랜 정보] 조회 오류:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;

