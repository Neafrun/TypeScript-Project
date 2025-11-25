const { getUserUsage, isCreator } = require('../db/database');

// 무료 분석 횟수 (2회)
const FREE_ANALYSIS_LIMIT = 2;

// 분석 횟수 체크 미들웨어
const checkAnalysisLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const githubLogin = req.user.login;
    const githubUserId = req.user.id;

    console.log(`🔍 [분석 제한 체크] 사용자: ${githubLogin} (ID: ${userId})`);

    // 제작자 확인
    const creator = isCreator(githubLogin, githubUserId);
    if (creator) {
      console.log('✅ [분석 제한 체크] 제작자 계정 - 무제한 사용 가능');
      return next(); // 제작자는 무제한 사용
    }

    // 사용자 사용 기록 조회
    const usage = getUserUsage(userId, githubLogin);

    // 무료 분석 가능 여부 확인
    if (usage.free_analysis_used < FREE_ANALYSIS_LIMIT) {
      const remaining = FREE_ANALYSIS_LIMIT - usage.free_analysis_used;
      console.log(`✅ [분석 제한 체크] 무료 분석 가능 (남은 횟수: ${remaining}회)`);
      return next(); // 무료 분석 가능
    }

    // 유료 구독 확인
    if (usage.is_premium && usage.premium_expires_at) {
      const expiresAt = new Date(usage.premium_expires_at);
      const now = new Date();
      
      if (expiresAt > now) {
        console.log('✅ [분석 제한 체크] 유료 구독 중 - 사용 가능');
        return next(); // 유료 구독 중
      } else {
        console.log('⚠️ [분석 제한 체크] 유료 구독 만료됨');
      }
    }

    // 분석 불가 - 결제 필요
    console.log('❌ [분석 제한 체크] 결제 필요');
    return res.status(402).json({
      error: 'Payment required',
      message: '무료 분석 2회를 모두 사용했습니다. 결제가 필요합니다.',
      freeAnalysisUsed: usage.free_analysis_used,
      freeAnalysisRemaining: Math.max(0, FREE_ANALYSIS_LIMIT - usage.free_analysis_used),
      usage: {
        analysisCount: usage.analysis_count,
        freeAnalysisUsed: usage.free_analysis_used,
        isPremium: usage.is_premium === 1,
        premiumExpiresAt: usage.premium_expires_at
      }
    });
  } catch (error) {
    console.error('❌ [분석 제한 체크] 오류:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: '분석 제한 확인 중 오류가 발생했습니다.'
    });
  }
};

module.exports = checkAnalysisLimit;

