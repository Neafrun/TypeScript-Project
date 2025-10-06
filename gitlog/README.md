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

### GitHub 데이터
- `GET /api/github/repos` - 로그인 사용자의 저장소 목록 (쿠키 필요)
- `GET /api/github/repos/:owner/:repo/stats` - 저장소 통계 (쿠키 필요)
- `GET /api/github/repos/:owner/:repo/commits` - 저장소 커밋 (쿠키 필요)

### 디버그
- `GET /api/debug/ping` - 단순 핑 확인
- `GET /api/debug/headers` - 요청 헤더 확인
- `GET /api/debug/session` - 세션 확인
- `GET /api/debug/jwt` - JWT 디코딩 결과 확인 (쿠키 필요)

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

### 문제 원인 빠르게 파악하기 (프론트/백엔드 구분)

1) 백엔드 헬스 확인: `GET /api/health` 응답 200이면 서버 OK

2) 세션/쿠키 확인:
- `GET /api/debug/session`로 세션 OK 확인
- 로그인 후 `GET /api/debug/jwt`로 JWT 파싱 결과 확인 (쿠키 포함 요청 필요)

3) GitHub API 경로 독립 테스트:
- Postman으로 `GET /api/github/repos` 호출 → 200이면 백엔드/토큰 OK, 프론트 이슈 가능
- 401/403이면 인증/토큰 이슈 (백엔드/설정 문제)

4) 요청 추적: 모든 응답 헤더의 `X-Request-Id`를 확인해 서버 로그와 매칭

### Postman 사용법

1. Postman 설치 후, 아래 파일 임포트:
- `server/GitLog.postman_collection.json`
- `server/GitLog.postman_environment.json`

2. 환경 선택: 상단 우측에서 `GitLog Local` 선택

3. 순서:
- `Auth - GitHub Start`로 state 발급 → 브라우저 OAuth 진행 후 code/state 확보
- `Auth - Callback`에 code/state 입력하고 실행 → `token` 쿠키 설정됨
- `Auth - Me` 또는 `GitHub` 폴더의 요청들 실행 (쿠키 필요)

4. 쿠키 전송: Postman에서 Cookie 탭으로 `localhost` 도메인 쿠키 `token` 확인

5. 에러시: 응답의 `X-Request-Id`를 서버 로그와 매칭해 원인 추적

## 기여하기

1. 저장소 포크
2. 기능 브랜치 생성
3. 변경사항 적용
4. 테스트 추가 (해당하는 경우)
5. 풀 리퀘스트 제출

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.
