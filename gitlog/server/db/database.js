const fs = require('fs');
const path = require('path');

// 데이터베이스 파일 경로 (JSON 파일로 저장)
const dbDir = __dirname;
const dbFile = path.join(dbDir, 'database.json');

// 데이터베이스 초기화
function initDatabase() {
  try {
    // db 디렉토리가 없으면 생성
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // 데이터베이스 파일이 없으면 초기 데이터 생성
    if (!fs.existsSync(dbFile)) {
      const initialData = {
        users: {},
        payments: [],
        creators: []
      };
      fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2), 'utf8');
      console.log('✅ [데이터베이스] 초기 데이터 생성 완료');
    }

    // 기본 제작자 목록 추가 (환경 변수에서)
    const creatorLogins = process.env.CREATOR_GITHUB_LOGINS?.split(',') || [];
    if (creatorLogins.length > 0) {
      const data = loadDatabase();
      creatorLogins.forEach((login) => {
        const trimmedLogin = login.trim();
        if (trimmedLogin && !data.creators.find(c => c.github_login === trimmedLogin)) {
          data.creators.push({
            github_login: trimmedLogin,
            github_user_id: 0,
            name: null,
            role: 'creator',
            created_at: new Date().toISOString()
          });
        }
      });
      saveDatabase(data);
      console.log('✅ [데이터베이스] 제작자 목록 초기화 완료');
    }

    return true;
  } catch (error) {
    console.error('❌ [데이터베이스] 초기화 오류:', error);
    throw error;
  }
}

// 데이터베이스 로드
function loadDatabase() {
  try {
    if (!fs.existsSync(dbFile)) {
      initDatabase();
    }
    const content = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ [데이터베이스] 로드 오류:', error);
    return { users: {}, payments: [], creators: [] };
  }
}

// 데이터베이스 저장
function saveDatabase(data) {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('❌ [데이터베이스] 저장 오류:', error);
    throw error;
  }
}

// 사용자 사용 기록 조회 또는 생성
function getUserUsage(userId, githubLogin) {
  const data = loadDatabase();
  
  if (!data.users[userId]) {
    data.users[userId] = {
      user_id: userId,
      github_login: githubLogin,
      analysis_count: 0,
      free_analysis_used: 0,
      is_premium: 0,
      premium_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    saveDatabase(data);
  }
  
  return data.users[userId];
}

// 분석 사용 기록 업데이트
function updateAnalysisUsage(userId, githubLogin) {
  const data = loadDatabase();
  const usage = getUserUsage(userId, githubLogin);
  
  usage.analysis_count += 1;
  
  // 무료 분석이 남아있으면 증가 (최대 2회)
  if (usage.free_analysis_used < 2) {
    usage.free_analysis_used += 1;
  }
  
  usage.updated_at = new Date().toISOString();
  
  data.users[userId] = usage;
  saveDatabase(data);
  
  return usage;
}

// 제작자 확인
function isCreator(githubLogin, githubUserId) {
  const data = loadDatabase();
  return data.creators.some(
    creator => creator.github_login === githubLogin || creator.github_user_id === githubUserId
  );
}

// 결제 내역 저장
function savePayment(userId, paymentData) {
  const data = loadDatabase();
  
  const payment = {
    id: data.payments.length + 1,
    user_id: userId,
    payment_id: paymentData.payment_id,
    amount: paymentData.amount,
    payment_method: paymentData.payment_method,
    status: paymentData.status,
    payment_provider: paymentData.payment_provider,
    provider_payment_id: paymentData.provider_payment_id,
    plan_type: paymentData.plan_type,
    expires_at: paymentData.expires_at,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  data.payments.push(payment);
  saveDatabase(data);
  
  return payment;
}

// 사용자 구독 업데이트
function updateUserSubscription(userId, paymentData) {
  const data = loadDatabase();
  
  // 결제 내역 저장
  savePayment(userId, paymentData);
  
  // 사용자 구독 상태 업데이트
  const usage = getUserUsage(userId, null);
  usage.is_premium = 1;
  usage.premium_expires_at = paymentData.expires_at;
  usage.updated_at = new Date().toISOString();
  
  data.users[userId] = usage;
  saveDatabase(data);
}

// 결제 내역 조회
function getPayments(userId) {
  const data = loadDatabase();
  return data.payments
    .filter(payment => payment.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// 제작자 목록 조회
function getCreators() {
  const data = loadDatabase();
  return data.creators;
}

// 제작자 추가
function addCreator(githubLogin, githubUserId, name) {
  const data = loadDatabase();
  
  // 이미 존재하는지 확인
  if (data.creators.some(c => c.github_login === githubLogin)) {
    return null;
  }
  
  const creator = {
    id: data.creators.length + 1,
    github_login: githubLogin,
    github_user_id: githubUserId || 0,
    name: name || null,
    role: 'creator',
    created_at: new Date().toISOString()
  };
  
  data.creators.push(creator);
  saveDatabase(data);
  
  return creator;
}

// 제작자 삭제
function removeCreator(githubLogin) {
  const data = loadDatabase();
  const index = data.creators.findIndex(c => c.github_login === githubLogin);
  
  if (index === -1) {
    return false;
  }
  
  data.creators.splice(index, 1);
  saveDatabase(data);
  
  return true;
}

module.exports = {
  initDatabase,
  loadDatabase,
  saveDatabase,
  getUserUsage,
  updateAnalysisUsage,
  isCreator,
  savePayment,
  updateUserSubscription,
  getPayments,
  getCreators,
  addCreator,
  removeCreator
};
