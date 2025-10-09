const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { requestId, requestLogger } = require('./middleware/logger');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const githubRoutes = require('./routes/github');
const debugRoutes = require('./routes/debug');
const repositoryRoutes = require('./routes/repository');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestId);
app.use(requestLogger);

app.use(session({
  store: new FileStore({
    path: './sessions',
    ttl: 24 * 60 * 60, // 24시간
    retries: 5,
    logFn: function() {} // 로그 비활성화
  }),
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24시간
  },
  name: 'gitlog.session',
}));

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/repository', repositoryRoutes);

// 루트 페이지 안내
app.get('/', (req, res) => {
  res.json({
    message: 'GitLog API 서버입니다. 상태 확인은 /api/health 를 사용하세요.',
    health: '/api/health',
    docs: 'README.md 를 참고하세요'
  });
});

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: '라우트를 찾을 수 없습니다' 
  });
});

// 오류 핸들러
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;