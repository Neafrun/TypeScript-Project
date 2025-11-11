# 더미 데이터 제거 가이드

이 파일은 더미 데이터를 제거하는 방법을 안내합니다.

## 제거 방법

### 방법 1: 환경 변수로 비활성화 (권장)

1. `gitlog/server/.env` 파일을 열고 다음 줄 추가:
   ```
   USE_DUMMY_DATA=false
   ```

2. 서버 재시작

### 방법 2: 파일 삭제

1. 다음 파일 삭제:
   - `gitlog/server/data/dummy-analysis-data.js`
   - `gitlog/server/data/README.md`
   - `gitlog/server/REMOVE_DUMMY_DATA.md` (이 파일)

2. `gitlog/server/routes/ai.js` 파일에서 다음 부분 삭제:
   - 6-19번 줄 (더미 데이터 로드 부분)
   - 483-488번 줄 (인증 필요 엔드포인트의 더미 데이터 체크)
   - 613-618번 줄 (공개 엔드포인트의 더미 데이터 체크)

3. 서버 재시작

## 확인

더미 데이터가 비활성화되었는지 확인:

1. 서버 시작 시 콘솔에 "더미 데이터 모드가 활성화되었습니다" 메시지가 없어야 합니다.
2. 브라우저에서 AI 분석을 실행하면 실제 API를 호출합니다.

## 복원

더미 데이터를 다시 사용하려면:

1. `gitlog/server/.env` 파일에서 `USE_DUMMY_DATA=false` 줄 삭제 또는 주석 처리
2. 서버 재시작

