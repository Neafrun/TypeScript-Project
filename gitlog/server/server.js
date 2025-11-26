const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

// dotenv 설정 - 현재 디렉토리에서 .env 파일 로드
require('dotenv').config();

// 데이터베이스 모듈 import (다른 라우트보다 먼저)
const { initDatabase } = require('./db/database');

// 데이터베이스 초기화
try {
  initDatabase();
  console.log('✅ [데이터베이스] 초기화 완료');
} catch (error) {
  console.error('❌ [데이터베이스] 초기화 실패:', error);
}

// 환경 변수 디버깅
console.log('🔍 [환경 변수 확인] 서버 시작 시 환경 변수 상태:');
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? '설정됨' : '❌ 없음');
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? '설정됨' : '❌ 없음');
console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? '설정됨' : '❌ 없음');
console.log('GITHUB_REDIRECT_URI:', process.env.GITHUB_REDIRECT_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '설정됨' : '❌ 없음');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '설정됨' : '❌ 없음');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '설정됨' : '❌ 없음');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '설정됨' : '❌ 없음');

const authRoutes = require('./routes/auth');
const githubRoutes = require('./routes/github');
const repositoryRoutes = require('./routes/repository');
const aiRoutes = require('./routes/ai');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_BUILD_PATH = path.join(__dirname, 'public');

const baseOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
  process.env.RENDER_EXTERNAL_URL,
  process.env.RENDER_INTERNAL_HOSTNAME ? `https://${process.env.RENDER_INTERNAL_HOSTNAME}` : null
].filter(Boolean).map(origin => origin.replace(/\/$/, ''));

// 미들웨어 설정
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const sanitizedOrigin = origin.replace(/\/$/, '');
    if (baseOrigins.includes(sanitizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`⚠️ [CORS] 허용되지 않은 Origin에서 요청이 들어왔습니다: ${origin}. 임시로 허용합니다.`);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 개발 환경에서는 false
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

// 헬스 체크 엔드포인트 (가장 먼저 등록)
app.get('/api/health', (req, res) => {
  console.log('💚 [헬스 체크] 서버 상태 확인 요청을 받았습니다');
  res.status(200).json({ 
    status: 'OK', 
    message: 'GitLog Server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/repository', repositoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 정적 파일 제공 (React 빌드 결과)
app.use(express.static(CLIENT_BUILD_PATH));

// SPA 라우팅 대응 (모든 비-API 요청은 index.html 반환)
app.get('*', (req, res, next) => {
  // API 경로는 제외
  if (req.path.startsWith('/api')) {
    return next();
  }

  console.log(`📄 [SPA 라우팅] ${req.path} 요청 - index.html 반환`);
  res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'), (err) => {
    if (err) {
      console.error('❌ [SPA 라우팅] index.html 전달 중 오류:', err.message);
      next(err);
    } else {
      console.log(`✅ [SPA 라우팅] ${req.path} - index.html 전달 성공`);
    }
  });
});

// 404 핸들러 (API 전용)
app.use('*', (req, res) => {
  console.log(`❌ [404 오류] 존재하지 않는 경로에 접근했습니다: ${req.method} ${req.originalUrl}`);
  console.log(`❌ [404 오류] 요청 헤더:`, req.headers);
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('❌ [서버 오류] 예상치 못한 서버 오류가 발생했습니다:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 [서버 시작] GitLog 백엔드 서버가 포트 ${PORT}에서 실행되었습니다`);
  console.log(`🌍 [환경 설정] 현재 실행 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 [프론트엔드] 웹 애플리케이션 주소: http://localhost:3000`);
  console.log(`🔗 [백엔드] API 서버 주소: http://localhost:${PORT}`);
      console.log(`📋 [API 엔드포인트] 사용 가능한 API 목록:`);
      console.log(`   - GET  /api/health - 서버 상태 확인`);
      console.log(`   - GET  /api/auth/github - GitHub 로그인 시작`);
      console.log(`   - POST /api/auth/callback - GitHub 로그인 콜백`);
      console.log(`   - GET  /api/auth/me - 현재 사용자 정보`);
      console.log(`   - POST /api/auth/logout - 로그아웃`);
      console.log(`   - GET  /api/github/repos - GitHub 저장소 목록`);
      console.log(`   - GET  /api/github/repos/:owner/:repo/commits - 저장소 커밋 히스토리`);
      console.log(`   - GET  /api/repository/info/:owner/:repo - 레포지토리 정보`);
      console.log(`   - GET  /api/repository/commits/:owner/:repo - 커밋 통계`);
      console.log(`   - GET  /api/repository/all-commits/:owner/:repo - 모든 브랜치 커밋`);
      console.log(`   - POST /api/repository/analyze - 레포지토리 분석`);
      console.log(`   - POST /api/ai/analyze - AI 분석 (인증 필요)`);
      console.log(`   - POST /api/ai/public/analyze - AI 분석 (공개 레포지토리)`);
});
