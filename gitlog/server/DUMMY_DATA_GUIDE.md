# 더미 데이터 사용 가이드

## 개요

BenefitMap 레포지토리를 분석한 더미 데이터가 하드코딩되어 있습니다.
API 문제 해결을 위해 임시로 사용되는 데이터입니다.

## 작동 방식

1. **기본 동작**: 더미 데이터 모드가 기본적으로 활성화되어 있습니다.
2. **모든 요청**: 어떤 레포지토리 URL을 입력하더라도 BenefitMap 레포지토리 분석 결과가 반환됩니다.
3. **분석 타입**: 일반 분석, 코드 품질, AI 피드백 모두 지원합니다.

## 분석 타입별 더미 데이터

### 1. 일반 분석 (general)
- 프로젝트 개요
- 프로젝트 건강도
- 활동 분석
- 협업 평가
- 코드 품질 인사이트
- 성장 가능성 분석

### 2. 코드 품질 (code-quality)
- 전체 점수: 72점
- 유지보수성 평가
- 복잡도 분석
- 베스트 프랙티스
- 개선 영역
- 권장사항

### 3. AI 피드백 (ai-feedback)
- 전체 피드백
- 긍정적인 측면
- 개선 영역
- 권장사항
- 제안사항
- 요약

## 테스트 방법

1. 브라우저에서 `http://localhost:3000` 접속
2. AI 분석 탭으로 이동
3. 저장소 URL 입력 (어떤 URL이든 상관없음)
   - 예: `BenefitMap/BenefitMap`
   - 예: `facebook/react`
   - 예: `any/repo`
4. 분석 유형 선택
   - 일반 분석
   - 코드 품질
   - AI 피드백
5. "AI로 분석하기" 버튼 클릭
6. BenefitMap 레포지토리 분석 결과 확인

## 제거 방법

### 방법 1: 환경 변수로 비활성화 (권장)

1. `gitlog/server/.env` 파일에 추가:
   ```
   USE_DUMMY_DATA=false
   ```

2. 서버 재시작

### 방법 2: 파일 삭제

1. 다음 파일 삭제:
   - `gitlog/server/data/dummy-analysis-data.js`
   - `gitlog/server/data/README.md`
   - `gitlog/server/REMOVE_DUMMY_DATA.md`
   - `gitlog/server/DUMMY_DATA_GUIDE.md` (이 파일)

2. `gitlog/server/routes/ai.js` 파일에서 다음 부분 삭제:
   - 6-34번 줄 (더미 데이터 로드 부분)
   - 494-499번 줄 (인증 필요 엔드포인트의 더미 데이터 체크)
   - 624-629번 줄 (공개 엔드포인트의 더미 데이터 체크)

3. 서버 재시작

## 파일 구조

```
gitlog/server/
├── data/
│   ├── dummy-analysis-data.js  # 더미 데이터 파일
│   ├── README.md                # 더미 데이터 설명
│   └── .gitkeep                 # Git 디렉토리 유지
├── routes/
│   └── ai.js                    # AI 분석 라우트 (더미 데이터 로직 포함)
├── REMOVE_DUMMY_DATA.md         # 제거 가이드
└── DUMMY_DATA_GUIDE.md          # 사용 가이드 (이 파일)
```

## 확인

더미 데이터가 활성화되었는지 확인:

1. 서버 시작 시 콘솔에 다음 메시지가 표시되어야 합니다:
   ```
   📦 [더미 데이터] 더미 데이터 모드가 활성화되었습니다.
      모든 AI 분석 요청은 더미 데이터로 응답합니다.
   ```

2. 브라우저에서 AI 분석을 실행하면 BenefitMap 레포지토리 분석 결과가 표시됩니다.

## 복원

더미 데이터를 다시 사용하려면:

1. `gitlog/server/.env` 파일에서 `USE_DUMMY_DATA=false` 줄 삭제 또는 주석 처리
2. 서버 재시작

## BenefitMap 레포지토리 정보

- **이름**: BenefitMap/BenefitMap
- **설명**: 대학교 캡스톤 프로젝트 | 맞춤형 복지정책 추천 웹사이트
- **언어**: JavaScript (43.4%), CSS (37.1%), Java (11.9%), HTML (7.6%)
- **커밋 수**: 10개
- **기여자**: 3명
- **이슈**: 4개

## 주의사항

- 더미 데이터는 **임시** 데이터입니다.
- 실제 API가 작동하면 더미 데이터를 비활성화하세요.
- 더미 데이터를 사용하는 동안은 모든 레포지토리에 대해 BenefitMap 분석 결과가 반환됩니다.

