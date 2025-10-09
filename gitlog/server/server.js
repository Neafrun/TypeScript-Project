const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

// dotenv 설정 - 현재 디렉토리에서 .env 파일 로드
require('dotenv').config();

// 환경 변수 디버깅
console.log('🔍 [환경 변수 확인] 서버 시작 시 환경 변수 상태:');
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? '설정됨' : '❌ 없음');
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? '설정됨' : '❌ 없음');
console.log('GITHUB_REDIRECT_URI:', process.env.GITHUB_REDIRECT_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '설정됨' : '❌ 없음');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '설정됨' : '❌ 없음');

const authRoutes = require('./routes/auth');
const githubRoutes = require('./routes/github');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  console.log('💚 [헬스 체크] 서버 상태 확인 요청을 받았습니다');
  res.json({ 
    status: 'OK', 
    message: 'GitLog Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  console.log(`❌ [404 오류] 존재하지 않는 경로에 접근했습니다: ${req.originalUrl}`);
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
});
