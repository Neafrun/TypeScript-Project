# 💳 결제 시스템 설정 가이드

## 📋 구현 완료 사항

✅ 데이터베이스 스키마 생성 (SQLite)
✅ 사용자 분석 횟수 추적 시스템
✅ 제작자 확인 로직
✅ 백엔드 API 구현 (분석 횟수 체크, 결제 검증)
✅ 프론트엔드 UI 구현 (결제 모달, 사용 횟수 표시)

## 🚀 설치 및 설정

### 1단계: 의존성 설치

```bash
cd gitlog/server
npm install
```

`better-sqlite3` 패키지가 자동으로 설치됩니다.

### 2단계: 환경 변수 설정

`gitlog/server/.env` 파일에 다음을 추가:

```env
# 제작자 GitHub 로그인 (쉼표로 구분)
CREATOR_GITHUB_LOGINS=creator1,creator2,creator3
```

예시:
```env
CREATOR_GITHUB_LOGINS=Neafrun,user2,user3
```

### 3단계: 데이터베이스 초기화

서버를 시작하면 자동으로 데이터베이스가 초기화됩니다:

```bash
cd gitlog/server
npm start
```

데이터베이스 파일은 `gitlog/server/db/gitlog.db`에 생성됩니다.

## 📊 가격 정책

- **무료 플랜**: 2회 무료 분석
- **베이직 플랜**: 월 6,900원 (10회 분석)
- **프로 플랜**: 월 12,500원 (무제한 분석)
- **연간 플랜**: 연 99,000원 (12개월 무제한 분석, +2개월 무료)

## 🔧 API 엔드포인트

### 사용자 사용 기록
- `GET /api/user/usage` - 사용자 분석 사용 기록 조회
- `GET /api/user/payments` - 결제 내역 조회

### 결제
- `GET /api/payment/plans` - 플랜 정보 조회
- `POST /api/payment/verify` - 결제 검증 (테스트 모드)

## 🧪 테스트 모드

현재는 테스트 모드로 동작합니다:
- 실제 결제는 처리되지 않음
- 결제 검증은 항상 성공 처리
- 실제 결제 시스템 연동 시 `routes/payment.js`의 `verify` 함수를 수정해야 함

## 🔐 제작자 무제한 사용

환경 변수 `CREATOR_GITHUB_LOGINS`에 제작자의 GitHub 로그인을 쉼표로 구분하여 입력하면 해당 사용자는 결제 없이 무제한 사용 가능합니다.

## 📝 다음 단계

실제 결제 시스템 연동을 위해서는:

1. **토스페이먼츠 계정 생성**
   - https://www.toss.im/developers 접속
   - 테스트 키 발급

2. **결제 검증 로직 수정**
   - `gitlog/server/routes/payment.js`의 `verify` 함수 수정
   - 토스페이먼츠 API 연동

3. **프론트엔드 결제 위젯 연동**
   - `gitlog/client/src/components/PaymentModal.jsx` 수정
   - 토스페이먼츠 결제 위젯 추가

## 🐛 문제 해결

### 데이터베이스 오류
- `gitlog/server/db/gitlog.db` 파일 삭제 후 서버 재시작
- 데이터베이스가 자동으로 재생성됩니다

### 제작자 확인이 안 될 때
- 환경 변수 `CREATOR_GITHUB_LOGINS` 확인
- GitHub 로그인이 정확히 입력되었는지 확인
- 서버 재시작

### 분석 횟수가 업데이트되지 않을 때
- 브라우저 콘솔에서 오류 확인
- 서버 로그 확인
- 데이터베이스 직접 확인: `sqlite3 gitlog/server/db/gitlog.db`

