# GitLog

GitHub 저장소 분석을 위한 강력한 도구입니다.

## 기능

- 🔐 GitHub OAuth 인증
- 📊 저장소 분석 및 통계
- 📈 커밋 히스토리 시각화
- 🌿 브랜치 분석
- 👥 기여자 인사이트
- 🎨 모던하고 반응형 UI

## 프로젝트 구조

```
gitlog/
├── client/                 # React 프론트엔드
│   ├── public/
│   ├── src/
│   │   ├── components/     # 재사용 가능한 UI 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── styles/        # 스타일드 컴포넌트 및 테마
│   │   ├── context/       # React 컨텍스트 프로바이더
│   │   ├── App.jsx        # 메인 앱 컴포넌트
│   │   └── index.js       # 진입점
│   ├── .env               # 클라이언트 환경 변수
│   ├── .gitignore
│   └── package.json
│
├── server/                # Express.js 백엔드
│   ├── controllers/       # 라우트 컨트롤러
│   ├── routes/           # API 라우트
│   ├── config/           # 설정 파일
│   ├── middleware/       # 커스텀 미들웨어
│   ├── .env              # 서버 환경 변수
│   ├── .gitignore
│   ├── server.js         # 메인 서버 파일
│   └── package.json
│
└── README.md
```

## 시작하기

### 사전 요구사항

- Node.js (v14 이상)
- npm 또는 yarn
- GitHub OAuth 앱

### GitHub OAuth 설정

1. GitHub 설정 > 개발자 설정 > OAuth 앱으로 이동
2. 새 OAuth 앱 생성:
   - 애플리케이션 이름: GitLog
   - 홈페이지 URL: `http://localhost:3000`
   - 인증 콜백 URL: `http://localhost:3000/callback`
3. 클라이언트 ID와 클라이언트 시크릿 복사

### 설치

1. 저장소 클론:
```bash
git clone <repository-url>
cd gitlog
```

2. 서버 의존성 설치:
```bash
cd server
npm install
```

3. 클라이언트 의존성 설치:
```bash
cd ../client
npm install
```

4. 환경 변수 설정:

**서버 (.env):**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
SESSION_SECRET=your-session-secret-key-here
JWT_SECRET=your-jwt-secret-key-here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3000/callback
```

**클라이언트 (.env):**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id_here
```

### 애플리케이션 실행

1. 서버 시작:
```bash
cd server
npm run dev
```

2. 클라이언트 시작 (새 터미널):
```bash
cd client
npm start
```

3. 브라우저에서 `http://localhost:3000`으로 이동

## API 엔드포인트

### 인증
- `GET /api/auth/github` - GitHub OAuth 시작
- `POST /api/auth/callback` - OAuth 콜백 처리
- `GET /api/auth/me` - 현재 사용자 가져오기
- `POST /api/auth/logout` - 사용자 로그아웃

### 헬스 체크
- `GET /api/health` - 서버 상태 확인

## 사용된 기술

### 프론트엔드
- React 18
- React Router DOM
- Styled Components
- Context API

### 백엔드
- Node.js
- Express.js
- Axios
- JWT
- Express Session
- CORS

## 개발

### 사용 가능한 스크립트

**클라이언트:**
- `npm start` - 개발 서버 시작
- `npm build` - 프로덕션용 빌드
- `npm test` - 테스트 실행

**서버:**
- `npm start` - 프로덕션 서버 시작
- `npm run dev` - nodemon으로 개발 서버 시작

## 기여하기

1. 저장소 포크
2. 기능 브랜치 생성
3. 변경사항 적용
4. 테스트 추가 (해당하는 경우)
5. 풀 리퀘스트 제출

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.
