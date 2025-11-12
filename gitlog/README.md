# 코드 수정 후 
    cd client
   npm run build
   ```
   → `postbuild`가 `server/public`으로 자동 복사
4. **루트로 돌아와 커밋 & 푸시**
   ```
   cd ..
   git status
   git add .
   git commit -m "메시지"
   git push origin <브랜치>
   ```
5. **Render에서 재배포**
   - `Manual Deploy → Clear build cache & deploy` 선택 (새 빌드 강제)
6. **배포 완료 후 테스트** (로그, 기능 점검)

### 추가 팁
- `npm run build` 후 `server/public`에 결과물이 들어갔는지 가끔 확인하세요.
- 환경 변수 변경이 필요하면 Render에서 먼저 수정 → 저장 → `Clear build cache & deploy`.
- 프런트만 수정한 경우에도 반드시 빌드 후 커밋/푸시가 있어야 Render가 새 빌드를 가져옵니다.
- 백엔드만 수정했다면 `client` 빌드는 필요 없지만, `server` 수정분 커밋·푸시 후 그대로 재배포하면 됩니다.

이 흐름으로 작업하시면 매번 최신 코드가 배포됩니다.

# GitLog

GitHub 저장소 분석을 위한 강력한 도구입니다. AI를 활용한 코드 품질 분석과 기여자 인사이트를 제공합니다.

## ✨ 주요 기능

- 🔐 **GitHub OAuth 인증** - 안전한 GitHub 계정 연동
- 📊 **저장소 분석** - 레포지토리 통계 및 메트릭 분석
- 🤖 **AI 코드 분석** - 코드 품질, 복잡도, 유지보수성 평가
- 👥 **기여자 순위** - 코드 기여도 기반 기여자 분석
- 📈 **커밋 히스토리** - 시각화된 커밋 패턴 분석
- 🎨 **모던 UI** - 반응형 디자인과 직관적인 사용자 경험

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

## 🚀 시작하기

### 📋 사전 요구사항

- **Node.js** (v16 이상 권장)
- **npm** 또는 **yarn**
- **GitHub 계정** (OAuth 앱 생성용)

### 🔧 GitHub OAuth 앱 설정

#### 1단계: GitHub에서 OAuth 앱 생성

1. **GitHub 로그인** 후 우측 상단 프로필 클릭
2. **Settings** → **Developer settings** → **OAuth Apps** 이동
3. **New OAuth App** 클릭
4. 다음 정보 입력:
   ```
   Application name: GitLog
   Homepage URL: http://localhost:3000
   Application description: GitHub repository analysis tool with AI insights
   Authorization callback URL: http://localhost:5000/api/auth/callback
   ```
5. **Register application** 클릭
6. **Client ID**와 **Client Secret** 복사 (중요!)

#### 2단계: OAuth 앱 설정 확인

- ✅ **Client ID**: `ghp_xxxxxxxxxxxxxxxxxxxx` 형태
- ✅ **Client Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` 형태
- ✅ **Callback URL**: `http://localhost:5000/api/auth/callback` (정확히 일치해야 함)

### 💾 설치 및 설정

#### 1단계: 필수 소프트웨어 설치

**🔧 Node.js 설치 (필수)**

1. **Node.js 공식 사이트 방문**: https://nodejs.org/
2. **LTS 버전 다운로드** (Long Term Support - 안정 버전)
3. **설치 파일 실행** 후 다음 단계를 따라 설치:
   - ✅ "Add to PATH" 체크박스 선택
   - ✅ "npm package manager" 포함 설치
   - ✅ "Automatically install the necessary tools" 선택
4. **설치 확인**:
   ```bash
   node --version    # v18.x.x 이상 권장
   npm --version     # v9.x.x 이상
   ```

**📦 Git 설치 (선택사항 - 이미 설치된 경우 생략)**

1. **Git 공식 사이트 방문**: https://git-scm.com/
2. **Windows용 Git 다운로드**
3. **설치 파일 실행** 후 기본 설정으로 설치
4. **설치 확인**:
   ```bash
   git --version
   ```

#### 2단계: 프로젝트 다운로드

**방법 1: Git으로 클론 (권장)**
```bash
# 원하는 폴더에서 실행
git clone <repository-url>
cd gitlog
```

**방법 2: ZIP 파일 다운로드**
1. GitHub 저장소 페이지에서 **"Code"** → **"Download ZIP"** 클릭
2. ZIP 파일 압축 해제
3. 폴더명을 `gitlog`로 변경

#### 3단계: 의존성 설치

**🔄 방법 1: 개별 설치 (권장 - 문제 발생 시 디버깅 용이)**

```bash
# 서버 의존성 설치
cd server
npm install
# ✅ 성공 시: "added X packages" 메시지 확인

# 클라이언트 의존성 설치
cd ../client
npm install
# ✅ 성공 시: "added X packages" 메시지 확인
```

**⚡ 방법 2: 한 번에 설치 (고급 사용자용)**

```bash
# 루트 디렉토리에서 실행
cd gitlog

# 서버와 클라이언트 동시 설치
npm install --prefix server && npm install --prefix client

# 또는 Windows PowerShell에서
npm install --prefix server; npm install --prefix client
```

**🔧 방법 3: Yarn 사용 (선택사항)**

```bash
# Yarn 설치 (Node.js와 함께 설치됨)
npm install -g yarn

# 의존성 설치
cd server && yarn install
cd ../client && yarn install
```

#### 4단계: 설치 확인

**✅ 설치 성공 확인:**
```bash
# 서버 의존성 확인
cd server
npm list --depth=0
# ✅ 성공 시: 패키지 목록이 표시됨

# 클라이언트 의존성 확인
cd ../client
npm list --depth=0
# ✅ 성공 시: 패키지 목록이 표시됨
```

**❌ 설치 실패 시 해결 방법:**
```bash
# 캐시 삭제 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 또는 관리자 권한으로 실행
# Windows: PowerShell을 관리자로 실행 후 npm install
```

#### 5단계: 환경 변수 설정

**📁 서버 환경 변수 (`server/.env`)**

```env
# 서버 포트 설정
PORT=5000

# 환경 설정
NODE_ENV=development

# 클라이언트 URL (프론트엔드 주소)
CLIENT_URL=http://localhost:3000

# 세션 암호화 키 (개인용 랜덤 문자열 생성 필요)
SESSION_SECRET=여기에_개인용_랜덤_문자열_입력

# JWT 토큰 암호화 키 (개인용 랜덤 문자열 생성 필요)
JWT_SECRET=여기에_개인용_랜덤_문자열_입력

# GitHub OAuth 설정 (GitHub에서 발급받은 값)
GITHUB_CLIENT_ID=여기에_GitHub_Client_ID_입력
GITHUB_CLIENT_SECRET=여기에_GitHub_Client_Secret_입력

# GitHub OAuth 리다이렉트 URL
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/callback
```

**📁 클라이언트 환경 변수 (`client/.env`)**

```env
# 백엔드 API 서버 주소
REACT_APP_API_URL=http://localhost:5000

# GitHub OAuth 클라이언트 ID (서버와 동일)
REACT_APP_GITHUB_CLIENT_ID=여기에_GitHub_Client_ID_입력
```

#### 6단계: .env 파일 생성 및 설정

**📝 1단계: .env 파일 생성**

**Windows에서:**
```bash
# 서버용 .env 파일 생성
cd server
echo. > .env

# 클라이언트용 .env 파일 생성
cd ../client
echo. > .env
```

**Mac/Linux에서:**
```bash
# 서버용 .env 파일 생성
cd server
touch .env

# 클라이언트용 .env 파일 생성
cd ../client
touch .env
```

**🔐 2단계: 보안 키 생성 (각자 개인용)**

```bash
# SESSION_SECRET 생성 (128자리 랜덤 문자열)
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# JWT_SECRET 생성 (다른 128자리 랜덤 문자열)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

**📋 3단계: .env 파일 작성**

1. **텍스트 에디터로 파일 열기:**
   - Windows: 메모장, VS Code, Notepad++
   - Mac: TextEdit, VS Code
   - Linux: nano, vim, VS Code

2. **서버 `.env` 파일에 템플릿 복사:**
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   SESSION_SECRET=여기에_개인용_랜덤_문자열_입력
   JWT_SECRET=여기에_개인용_랜덤_문자열_입력
   GITHUB_CLIENT_ID=여기에_GitHub_Client_ID_입력
   GITHUB_CLIENT_SECRET=여기에_GitHub_Client_Secret_입력
   GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/callback
   ```

3. **클라이언트 `.env` 파일에 템플릿 복사:**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_GITHUB_CLIENT_ID=여기에_GitHub_Client_ID_입력
   ```

4. **실제 값으로 교체:**
   - `여기에_개인용_랜덤_문자열_입력` → 위에서 생성한 랜덤 문자열
   - `여기에_GitHub_Client_ID_입력` → GitHub OAuth 앱의 Client ID
   - `여기에_GitHub_Client_Secret_입력` → GitHub OAuth 앱의 Client Secret

**⚠️ 4단계: 보안 확인**

- ✅ `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- ✅ 실제 보안 키를 GitHub에 올리지 않았는지 확인
- ✅ 각자 고유한 키를 사용하고 있는지 확인
- ✅ 파일 저장 시 인코딩이 UTF-8인지 확인

### 🚀 애플리케이션 실행

#### 방법 1: 터미널 2개 사용 (권장 - 초보자용)

**🖥️ 터미널 1 - 백엔드 서버 시작**

1. **새 터미널/PowerShell 창 열기**
2. **서버 폴더로 이동:**
   ```bash
   cd gitlog/server
   ```
3. **서버 시작:**
   ```bash
   npm run dev
   ```
4. **성공 확인:**
   ```
   ✅ Server running on port 5000
   ✅ MongoDB connected successfully
   ✅ GitHub OAuth configured
   ```

**🖥️ 터미널 2 - 프론트엔드 시작**

1. **새 터미널/PowerShell 창 열기**
2. **클라이언트 폴더로 이동:**
   ```bash
   cd gitlog/client
   ```
3. **프론트엔드 시작:**
   ```bash
   npm start
   ```
4. **성공 확인:**
   ```
   ✅ Compiled successfully!
   ✅ Local: http://localhost:3000
   ✅ 브라우저가 자동으로 열림
   ```

#### 방법 2: 한 터미널에서 동시 실행 (고급 사용자용)

**📦 concurrently 설치 (최초 1회만):**
```bash
npm install -g concurrently
```

**🚀 동시 실행:**
```bash
# 루트 디렉토리에서 실행
cd gitlog
npx concurrently "npm run dev --prefix server" "npm start --prefix client"
```

#### 방법 3: Windows PowerShell (절대 경로)

**백엔드:**
```powershell
cd C:\Users\home\Desktop\TypeScript-Project-1\gitlog\server
npm run dev
```

**프론트엔드:**
```powershell
cd C:\Users\home\Desktop\TypeScript-Project-1\gitlog\client
npm start
```

#### 방법 4: VS Code에서 실행

1. **VS Code에서 프로젝트 폴더 열기**
2. **터미널 메뉴** → **"New Terminal"** (2개 생성)
3. **첫 번째 터미널:**
   ```bash
   cd server && npm run dev
   ```
4. **두 번째 터미널:**
   ```bash
   cd client && npm start
   ```

### ✅ 실행 확인 체크리스트

**🔍 필수 확인사항:**
- [ ] 서버 `.env`의 `CLIENT_URL=http://localhost:3000`
- [ ] 클라이언트 `.env`의 `REACT_APP_API_URL=http://localhost:5000`
- [ ] GitHub OAuth Redirect URL: `http://localhost:5000/api/auth/callback`
- [ ] 백엔드 서버가 포트 5000에서 실행 중
- [ ] 프론트엔드가 포트 3000에서 실행 중

**🌐 접속 주소:**
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5000
- **API 헬스체크**: http://localhost:5000/api/health

### 🐛 문제 해결

#### ❌ 포트 충돌 오류

**문제:** `EADDRINUSE: address already in use :::5000`

**해결 방법:**
```bash
# Windows에서 포트 사용 중인 프로세스 확인
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# 프로세스 종료 (PID는 위 명령어 결과에서 확인)
taskkill /PID <PID번호> /F

# 또는 다른 포트 사용
# server/.env에서 PORT=5001로 변경
```

#### ❌ 의존성 설치 오류

**문제:** `npm ERR!` 메시지가 나타남

**해결 방법:**
```bash
# 1단계: 캐시 삭제
npm cache clean --force

# 2단계: node_modules 삭제
rm -rf node_modules package-lock.json

# 3단계: 재설치
npm install

# 4단계: 관리자 권한으로 실행 (Windows)
# PowerShell을 관리자로 실행 후 npm install
```

#### ❌ Node.js 버전 오류

**문제:** `Node.js version not supported`

**해결 방법:**
```bash
# Node.js 버전 확인
node --version

# LTS 버전 설치 (v18.x.x 이상 권장)
# https://nodejs.org/ 에서 다운로드
```

#### ❌ .env 파일 오류

**문제:** `Environment variable not found`

**해결 방법:**
1. `.env` 파일이 올바른 위치에 있는지 확인
2. 파일 인코딩이 UTF-8인지 확인
3. 줄바꿈이 올바른지 확인 (Windows: CRLF, Mac/Linux: LF)
4. 따옴표나 특수문자가 없는지 확인

#### ❌ GitHub OAuth 오류

**문제:** `GitHub authentication failed`

**해결 방법:**
1. GitHub OAuth 앱 설정 확인
2. Callback URL이 정확한지 확인: `http://localhost:5000/api/auth/callback`
3. Client ID와 Client Secret이 올바른지 확인
4. `.env` 파일의 값이 정확한지 확인

#### ❌ CORS 오류

**문제:** `CORS policy` 오류

**해결 방법:**
1. 서버 `.env`의 `CLIENT_URL` 확인: `http://localhost:3000`
2. 클라이언트 `.env`의 `REACT_APP_API_URL` 확인: `http://localhost:5000`
3. 브라우저 캐시 삭제 후 새로고침

#### 🔧 일반적인 해결 방법

**완전 초기화:**
```bash
# 1단계: 모든 node_modules 삭제
rm -rf server/node_modules client/node_modules
rm -rf server/package-lock.json client/package-lock.json

# 2단계: npm 캐시 삭제
npm cache clean --force

# 3단계: 재설치
cd server && npm install
cd ../client && npm install

# 4단계: 재실행
cd server && npm run dev
# 새 터미널에서
cd client && npm start
```

**로그 확인:**
```bash
# 서버 로그 확인
cd server
npm run dev
# 터미널에 표시되는 오류 메시지 확인

# 클라이언트 로그 확인
cd client
npm start
# 브라우저 개발자 도구 Console 탭 확인
```

## 📚 API 엔드포인트

### 🔐 인증 관련
- `GET /api/auth/github` - GitHub OAuth 로그인 시작
- `POST /api/auth/callback` - OAuth 콜백 처리
- `GET /api/auth/me` - 현재 로그인된 사용자 정보 조회
- `POST /api/auth/logout` - 사용자 로그아웃

### 🏥 헬스 체크
- `GET /api/health` - 서버 상태 확인

### 📊 GitHub 데이터
- `GET /api/github/repos` - 로그인 사용자의 저장소 목록
- `GET /api/github/repos/:owner/:repo` - 특정 저장소 정보
- `GET /api/github/repos/:owner/:repo/commits` - 저장소 커밋 히스토리
- `GET /api/github/repos/:owner/:repo/contributors` - 저장소 기여자 목록

### 🤖 AI 분석 (새로 추가!)
- `POST /api/ai/analyze` - 레포지토리 AI 분석 (향후 구현 예정)
- `GET /api/ai/insights` - AI 인사이트 조회 (향후 구현 예정)

## 🛠️ 사용된 기술

### 🎨 프론트엔드
- **React 18** - 최신 React 기능 활용
- **React Router DOM** - 클라이언트 사이드 라우팅
- **Styled Components** - CSS-in-JS 스타일링
- **Context API** - 전역 상태 관리
- **GitHub API** - GitHub 데이터 연동

### ⚙️ 백엔드
- **Node.js** - JavaScript 런타임
- **Express.js** - 웹 프레임워크
- **Axios** - HTTP 클라이언트
- **JWT** - JSON Web Token 인증
- **Express Session** - 세션 관리
- **CORS** - Cross-Origin Resource Sharing

### 🔧 개발 도구
- **Nodemon** - 개발 서버 자동 재시작
- **Concurrently** - 멀티 프로세스 실행
- **Git** - 버전 관리

## 🛠️ 개발 가이드

### 📜 사용 가능한 스크립트

**🎨 클라이언트 (React):**
```bash
npm start          # 개발 서버 시작 (http://localhost:3000)
npm run build      # 프로덕션용 빌드
npm test           # 테스트 실행
npm run eject      # Create React App 설정 추출 (비권장)
```

**⚙️ 서버 (Express):**
```bash
npm start          # 프로덕션 서버 시작
npm run dev        # nodemon으로 개발 서버 시작 (자동 재시작)
```

### 🔍 디버깅 가이드

#### 1단계: 서버 상태 확인
```bash
# API 헬스체크
curl http://localhost:5000/api/health
# 또는 브라우저에서 http://localhost:5000/api/health 접속
```
✅ **성공**: `{"status":"ok","timestamp":"..."}` 응답

#### 2단계: 인증 상태 확인
```bash
# 로그인 후 사용자 정보 확인
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/auth/me
```

#### 3단계: GitHub API 연결 확인
```bash
# 저장소 목록 조회
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/github/repos
```

### 🐛 일반적인 문제 해결

**❌ "Cannot GET /" 오류:**
- 서버가 제대로 시작되지 않음
- `.env` 파일 확인 및 포트 충돌 체크

**❌ "401 Unauthorized" 오류:**
- GitHub OAuth 설정 확인
- JWT 토큰 만료 또는 잘못된 토큰

**❌ "CORS" 오류:**
- `CLIENT_URL` 환경변수 확인
- 프론트엔드와 백엔드 포트 확인

**❌ "Module not found" 오류:**
- `npm install` 재실행
- `node_modules` 폴더 삭제 후 재설치

### 📊 성능 모니터링

**서버 로그 확인:**
```bash
# 실시간 로그 모니터링
tail -f server/logs/app.log
```

**메모리 사용량 확인:**
```bash
# Node.js 프로세스 메모리 사용량
ps aux | grep node
```

## 📝 환경 변수 템플릿

### 서버용 `.env` 템플릿
```env
# ===========================================
# GitLog Server Environment Variables
# ===========================================

# 서버 설정
PORT=5000
NODE_ENV=development

# 클라이언트 URL (프론트엔드 주소)
CLIENT_URL=http://localhost:3000

# 보안 키 (개인용 랜덤 문자열 생성 필요)
SESSION_SECRET=여기에_개인용_랜덤_문자열_입력
JWT_SECRET=여기에_개인용_랜덤_문자열_입력

# GitHub OAuth 설정 (GitHub에서 발급받은 값)
GITHUB_CLIENT_ID=여기에_GitHub_Client_ID_입력
GITHUB_CLIENT_SECRET=여기에_GitHub_Client_Secret_입력
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/callback
```

### 클라이언트용 `.env` 템플릿
```env
# ===========================================
# GitLog Client Environment Variables
# ===========================================

# 백엔드 API 서버 주소
REACT_APP_API_URL=http://localhost:5000

# GitHub OAuth 클라이언트 ID (서버와 동일)
REACT_APP_GITHUB_CLIENT_ID=여기에_GitHub_Client_ID_입력
```

### 🔐 보안 키 생성 방법

**Node.js 명령어로 생성:**
```bash
# SESSION_SECRET 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT_SECRET 생성 (다른 값으로)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**⚠️ 중요 보안 사항:**
- 각자 개인마다 고유한 키를 사용하세요
- 절대 다른 사람과 같은 키를 공유하지 마세요
- `.env` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함)
- 실제 보안 키를 GitHub에 올리지 마세요

## 🤝 기여하기

1. **저장소 포크** - 이 저장소를 포크합니다
2. **기능 브랜치 생성** - `git checkout -b feature/amazing-feature`
3. **변경사항 적용** - 코드를 수정하고 커밋합니다
4. **테스트 추가** - 새로운 기능에 대한 테스트를 작성합니다
5. **풀 리퀘스트 제출** - 변경사항을 검토받기 위해 PR을 생성합니다

## 📄 라이선스

이 프로젝트는 **MIT 라이선스** 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면:
- **Issues** 탭에서 버그 리포트 또는 기능 요청
- **Discussions** 탭에서 일반적인 질문
- **Pull Requests** 탭에서 코드 기여

---

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**
