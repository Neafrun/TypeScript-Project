# 💳 결제 시스템 도입 아이디어

## 📋 요구사항
- 로그인 후 처음 **3회 무료** 사용
- 3회 이후부터 **유료 결제** 필요
- **제작자 3명**은 결제 없이 무제한 사용 가능

---

## 🗄️ 데이터베이스 설계

### 1. 사용자 분석 사용 기록 테이블
```sql
CREATE TABLE user_analysis_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,  -- GitHub user ID
  github_login VARCHAR(255) NOT NULL,
  analysis_count INT DEFAULT 0,  -- 총 분석 횟수
  free_analysis_used INT DEFAULT 0,  -- 사용한 무료 분석 횟수 (최대 3)
  is_premium BOOLEAN DEFAULT FALSE,  -- 유료 구독 여부
  premium_expires_at DATETIME NULL,  -- 유료 구독 만료일
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_github_login (github_login)
);
```

### 2. 결제 내역 테이블
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  payment_id VARCHAR(255) UNIQUE NOT NULL,  -- 결제 시스템에서 받은 결제 ID
  amount INT NOT NULL,  -- 결제 금액 (원)
  payment_method VARCHAR(50),  -- 결제 수단 (card, account, etc.)
  status VARCHAR(50) NOT NULL,  -- pending, completed, failed, refunded
  payment_provider VARCHAR(50) NOT NULL,  -- toss, iamport, stripe
  provider_payment_id VARCHAR(255),  -- 결제 제공자의 결제 ID
  expires_at DATETIME NOT NULL,  -- 구독 만료일
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_payment_id (payment_id),
  INDEX idx_status (status)
);
```

### 3. 제작자 목록 테이블
```sql
CREATE TABLE creators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  github_login VARCHAR(255) UNIQUE NOT NULL,
  github_user_id INT NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'creator',  -- creator, admin
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_github_login (github_login)
);
```

---

## 💰 결제 시스템 선택

### 옵션 1: 토스페이먼츠 (Toss Payments) ⭐ 추천
**장점:**
- 한국 사용자 친화적
- 간단한 연동
- 다양한 결제 수단 (카드, 계좌이체, 가상계좌)
- 무료 플랜 제공

**단점:**
- 한국 전용

**가격:** 거래 수수료 3.3% + VAT

### 옵션 2: 아임포트 (Iamport)
**장점:**
- 한국 결제 수단 통합
- 간단한 연동
- 무료 플랜 제공

**단점:**
- 토스페이먼츠보다 수수료가 약간 높을 수 있음

**가격:** 거래 수수료 3.5% + VAT

### 옵션 3: 스트라이프 (Stripe)
**장점:**
- 글로벌 서비스
- 강력한 기능
- 다양한 결제 수단

**단점:**
- 한국 결제 수단 제한적
- 연동이 복잡할 수 있음

**가격:** 거래 수수료 3.6% + VAT

---

## 🎯 가격 정책 제안

### 구독 플랜
1. **무료 플랜**: 2회 무료 분석
2. **베이직 플랜**: 월 6,900원 (10회 분석)
3. **프로 플랜**: 월 12,500원 (무제한 분석)
4. **연간 플랜**: 연 99,000원 (12개월 무제한 분석, +2개월 무료)

---

## 🏗️ 구현 구조

### 백엔드 (Node.js/Express)

#### 1. 사용자 분석 횟수 체크 미들웨어
```javascript
// middleware/checkAnalysisLimit.js
const checkAnalysisLimit = async (req, res, next) => {
  const userId = req.user.id;
  const githubLogin = req.user.login;
  
  // 제작자 확인
  const isCreator = await checkIfCreator(githubLogin);
  if (isCreator) {
    return next(); // 제작자는 무제한 사용
  }
  
  // 사용자 사용 기록 조회
  const usage = await getUserUsage(userId);
  
  // 무료 분석 가능 여부 확인
  if (usage.free_analysis_used < 3) {
    return next(); // 무료 분석 가능
  }
  
  // 유료 구독 확인
  if (usage.is_premium && usage.premium_expires_at > new Date()) {
    return next(); // 유료 구독 중
  }
  
  // 분석 불가 - 결제 필요
  return res.status(402).json({
    error: 'Payment required',
    message: '무료 분석 3회를 모두 사용했습니다. 결제가 필요합니다.',
    freeAnalysisUsed: usage.free_analysis_used,
    freeAnalysisRemaining: 3 - usage.free_analysis_used
  });
};
```

#### 2. 분석 사용 기록 업데이트
```javascript
// routes/ai.js 수정
router.post('/analyze', authenticateToken, checkAnalysisLimit, async (req, res) => {
  // ... 기존 분석 로직 ...
  
  // 분석 완료 후 사용 기록 업데이트
  await updateAnalysisUsage(req.user.id, req.user.login);
  
  // ... 응답 반환 ...
});
```

#### 3. 결제 검증 API
```javascript
// routes/payment.js
router.post('/verify', authenticateToken, async (req, res) => {
  const { paymentId, amount, provider } = req.body;
  
  // 결제 시스템에서 결제 검증
  const paymentResult = await verifyPayment(provider, paymentId);
  
  if (paymentResult.success) {
    // 결제 성공 - 사용자 구독 업데이트
    await updateUserSubscription(req.user.id, paymentResult);
    
    return res.json({ success: true, message: '결제가 완료되었습니다.' });
  }
  
  return res.status(400).json({ error: 'Payment verification failed' });
});
```

### 프론트엔드 (React)

#### 1. 사용 횟수 표시 컴포넌트
```jsx
// components/UsageCounter.jsx
const UsageCounter = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState(null);
  
  useEffect(() => {
    fetchUsage();
  }, []);
  
  const fetchUsage = async () => {
    const response = await apiGet('/api/user/usage');
    setUsage(response);
  };
  
  if (!usage) return null;
  
  const freeRemaining = Math.max(0, 3 - usage.free_analysis_used);
  const isPremium = usage.is_premium && new Date(usage.premium_expires_at) > new Date();
  
  return (
    <UsageCard>
      {isPremium ? (
        <PremiumBadge>프리미엄 구독 중</PremiumBadge>
      ) : (
        <FreeCounter>
          무료 분석 남은 횟수: {freeRemaining}회
        </FreeCounter>
      )}
    </UsageCard>
  );
};
```

#### 2. 결제 모달 컴포넌트
```jsx
// components/PaymentModal.jsx
const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  
  const handlePayment = async () => {
    // 결제 시스템 연동
    const paymentResult = await initiatePayment(selectedPlan);
    
    if (paymentResult.success) {
      onSuccess();
      onClose();
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <PaymentPlans>
        <PlanCard onClick={() => setSelectedPlan('basic')}>
          <PlanName>베이직</PlanName>
          <PlanPrice>9,900원/월</PlanPrice>
          <PlanFeatures>10회 분석</PlanFeatures>
        </PlanCard>
        {/* 다른 플랜들... */}
      </PaymentPlans>
      <PaymentButton onClick={handlePayment}>
        결제하기
      </PaymentButton>
    </Modal>
  );
};
```

#### 3. AI 분석 페이지 수정
```jsx
// pages/AIAnalysis.jsx 수정
const performAnalysis = async (repoInfo) => {
  try {
    const response = await apiPost('/api/ai/analyze', {
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      analysisType
    });
    
    // 성공
    setAnalysisResult({ type: analysisType, data: response });
  } catch (err) {
    // 결제 필요 오류 (402)
    if (err.status === 402) {
      setShowPaymentModal(true);
      setError('결제가 필요합니다.');
      return;
    }
    
    // 다른 오류 처리
    setError(err.message);
  }
};
```

---

## 🔐 제작자 무제한 사용 구현

### 제작자 목록 관리
```javascript
// config/creators.js 또는 데이터베이스
const CREATORS = [
  { githubLogin: 'creator1', githubUserId: 123456 },
  { githubLogin: 'creator2', githubUserId: 789012 },
  { githubLogin: 'creator3', githubUserId: 345678 }
];

// 또는 환경 변수
// CREATOR_GITHUB_LOGINS=creator1,creator2,creator3
```

### 제작자 확인 함수
```javascript
// utils/creatorCheck.js
const checkIfCreator = async (githubLogin, githubUserId) => {
  // 데이터베이스에서 확인
  const creator = await db.query(
    'SELECT * FROM creators WHERE github_login = ? OR github_user_id = ?',
    [githubLogin, githubUserId]
  );
  
  return creator.length > 0;
  
  // 또는 환경 변수에서 확인
  // const creators = process.env.CREATOR_GITHUB_LOGINS?.split(',') || [];
  // return creators.includes(githubLogin);
};
```

---

## 📝 구현 단계

### Phase 1: 기본 구조
1. ✅ 데이터베이스 스키마 생성
2. ✅ 사용자 분석 횟수 추적 시스템
3. ✅ 제작자 확인 로직

### Phase 2: 결제 시스템 연동
1. ✅ 결제 시스템 선택 및 계정 생성
2. ✅ 결제 API 연동
3. ✅ 결제 검증 로직

### Phase 3: 프론트엔드 UI
1. ✅ 사용 횟수 표시 컴포넌트
2. ✅ 결제 모달 컴포넌트
3. ✅ 결제 필요 안내 메시지

### Phase 4: 테스트 및 배포
1. ✅ 테스트 환경에서 결제 테스트
2. ✅ 제작자 계정 테스트
3. ✅ 프로덕션 배포

---

## 🎨 UI/UX 제안

### 1. 사용 횟수 표시
- 헤더에 작은 배지 형태로 표시
- "무료 분석 2/3회 남음" 또는 "프리미엄 구독 중"
- 분석 페이지 상단에 큰 카드로 표시

### 2. 결제 필요 안내
- 분석 시도 시 모달 팝업
- "무료 분석을 모두 사용했습니다"
- "지금 구독하고 무제한 분석 받기" 버튼
- 플랜 비교 표

### 3. 결제 완료 후
- 성공 메시지 표시
- 즉시 분석 가능 안내
- 구독 정보 페이지로 이동 옵션

---

## 💡 추가 아이디어

### 1. 친구 초대 시스템
- 친구 초대 시 양쪽 모두 1회 추가 무료 분석
- 최대 3명까지 초대 가능

### 2. 분석 결과 저장
- 무료 사용자: 최근 3개 결과만 저장
- 유료 사용자: 무제한 저장

### 3. 분석 히스토리
- 무료 사용자: 최근 분석 내역만 조회 가능
- 유료 사용자: 전체 분석 히스토리 조회

### 4. 이메일 알림
- 무료 분석 1회 남았을 때 알림
- 구독 만료 전 알림

---

## 🔒 보안 고려사항

1. **서버 사이드 검증**: 모든 결제 검증은 서버에서 수행
2. **사용 횟수 조작 방지**: 클라이언트에서 조작 불가능하도록 서버에서만 관리
3. **결제 정보 암호화**: 결제 정보는 암호화하여 저장
4. **제작자 목록 보안**: 제작자 목록은 환경 변수나 암호화된 데이터베이스에 저장

---

## 📊 모니터링 및 분석

1. **사용 통계**: 일일/월별 분석 사용량
2. **결제 통계**: 결제 성공률, 환불률
3. **사용자 행동**: 무료 → 유료 전환율
4. **인기 플랜**: 가장 많이 선택된 플랜

---

이 아이디어를 바탕으로 단계적으로 구현하시면 됩니다! 🚀

