// 더미 분석 데이터
// 이 파일은 API 문제 해결을 위한 임시 더미 데이터입니다.
// 제거하려면: gitlog/client/src/pages/AIAnalysis.jsx에서 useDummyData 플래그를 false로 변경하고 이 파일을 삭제하세요.

// BenefitMap 레포지토리 정보
const REPO_INFO = {
  name: 'BenefitMap/BenefitMap',
  description: '대학교 캡스톤 프로젝트 | 맞춤형 복지정책 추천 웹사이트',
  language: 'JavaScript',
  stars: 0,
  forks: 0
};

// 일반 분석 더미 데이터
const GENERAL_ANALYSIS = {
  overview: 'BenefitMap은 정부 복지 API를 통합하여 맞춤형 복지정책을 추천하는 웹서비스입니다. 프로젝트는 Frontend와 Backend로 구성되어 있으며, JavaScript(43.4%), CSS(37.1%), Java(11.9%), HTML(7.6%)로 개발되었습니다. 비회원 검색/필터, 회원 자동 추천, 즐겨찾기, 알림, 캘린더 등 핵심 기능을 제공합니다.',
  health: '프로젝트는 초기 단계로 보이며, 10개의 커밋과 4개의 이슈가 있습니다. README가 잘 작성되어 있어 프로젝트 구조와 실행 방법을 쉽게 이해할 수 있습니다. Git 브랜치 전략(feature/*, dev, main)이 명확하게 정의되어 있습니다.',
  activity: '프로젝트 활동은 비교적 낮은 수준입니다. 하지만 체계적인 브랜치 전략과 커밋 규칙(Conventional Commits)이 정의되어 있어 향후 협업이 원활할 것으로 예상됩니다.',
  collaboration: '프로젝트는 팀 기반 개발을 위해 명확한 Git 워크플로우를 수립했습니다. feature 브랜치 전략, PR 리뷰 프로세스, 스쿼시 머지 등이 잘 정의되어 있습니다.',
  quality: '코드 품질은 초기 단계임을 고려할 때 적절합니다. 프론트엔드와 백엔드가 분리되어 있으며, 모노레포 구조로 관리되고 있습니다. TypeScript가 아닌 JavaScript를 사용하고 있어 타입 안정성 측면에서 개선 여지가 있습니다.',
  recommendations: [
    'TypeScript 도입을 고려하여 타입 안정성 향상',
    '테스트 코드 작성으로 코드 품질 보장',
    'CI/CD 파이프라인 구축으로 자동화된 배포 프로세스 수립',
    'API 문서화 (Swagger/OpenAPI) 추가',
    '에러 핸들링 및 로깅 시스템 구축'
  ],
  growth: '프로젝트는 대학교 캡스톤 프로젝트로 시작되었으나, 실제 서비스로 발전할 수 있는 잠재력을 가지고 있습니다. 정부 복지 API 통합이라는 실용적인 아이디어와 체계적인 개발 프로세스가 프로젝트의 성장 가능성을 높입니다.',
  summary: 'BenefitMap은 정부 복지 API를 통합한 맞춤형 복지정책 추천 웹서비스로, 체계적인 개발 프로세스와 명확한 기능 정의를 가지고 있습니다. 초기 단계이지만 확장 가능한 구조와 실용적인 아이디어로 인해 성장 잠재력이 높은 프로젝트입니다.'
};

// 코드 품질 분석 더미 데이터
const CODE_QUALITY_ANALYSIS = {
  overallScore: 78,
  sectionScores: {
    analyze: 19,
    detect: 18,
    feedback: 21,
    value: 20
  },
  maintainability: '모노레포 구조와 분리된 프론트/백엔드 덕분에 유지보수성은 양호하지만, typing 부재와 환경 변수 관리 미흡으로 인해 장기적 건강도에 위험 요소가 남아 있습니다.',
  complexity: '인증 로직과 통합 API 계층에서 반복 코드가 발견되며, 입력 검증이 일부 엔드포인트에서 누락돼 잠재적 버그와 성능 저하를 유발할 수 있습니다.',
  bestPractices: 'ESLint/Prettier 자동화, TypeScript 전환, 보안 헤더 적용 등 코드 레벨의 개선안이 시급하며, 테스트 전략을 명문화하면 팀 단위 품질 편차를 줄일 수 있습니다.',
  improvements: [
    '보안 취약점 정밀 스캔: 인증 및 API 계층에 OWASP ASVS 기반 검증 로직 추가',
    '데이터 유효성 강화를 위해 Zod/JOI 같은 스키마 기반 검증 도입',
    '비동기 로직의 에러 핸들링 공통 유틸 작성으로 예외 누락 차단',
    '핵심 컴포넌트에 대한 스냅샷·단위 테스트 작성으로 회귀 버그 예방'
  ],
  recommendations: [
    'TypeScript로 점진 마이그레이션하여 계약(Contract) 안정화 및 IDE 피드백 강화',
    'ESLint, Prettier, Husky를 CI 파이프라인과 연결해 코드 스타일을 일관되게 유지',
    'GitHub Advanced Security 또는 Snyk을 연동해 의존성 취약점 탐지 자동화',
    '핵심 API에 대해 k6 기반 부하 테스트를 수행해 실제 트래픽 대비 성능 여유 확보'
  ],
  additionalInsights: [
    '위 개선안을 적용하면 배포 차수마다 평균 코드 리뷰 시간 20% 단축과 장애 MTTR 감소를 기대할 수 있습니다.',
    '보안 취약점 선제 제거로 개인정보 처리 서비스에서 요구되는 컴플라이언스 대응력이 강화됩니다.'
  ],
  summary: 'BenefitMap 코드베이스는 기본 구조가 탄탄하지만, Analyze → Detect → Feedback 단계의 조치를 선제적으로 수행할 때 더 안전하고 깨끗하며 효율적인 코드베이스를 확보할 수 있습니다.'
};

// AI 피드백 분석 더미 데이터
const AI_FEEDBACK_ANALYSIS = {
  feedback: `AI 심층 분석 결과, BenefitMap은 정부 복지 API 집약형 서비스로 설계되어 있으며, React 기반 프론트엔드와 Node/Express 백엔드가 모노레포 구조 속에서 긴밀히 연결되어 있습니다. 라우팅/권한/데이터 수집 흐름이 명확히 나뉘어 있고, Styled-Components와 Chakra UI를 혼합해 UI 레이어를 구축한 점이 특징입니다.

실무 맞춤형 피드백 관점에서, API 통합 계층과 인증 토큰 처리 로직은 점진적 확장이 가능한 구조지만, 캐싱·재시도 정책과 예외 대응 체계가 부족해 실 서비스 운영 시 장애 복구 시간이 길어질 위험이 있습니다. 프로젝트 일정에 맞춰 우선순위를 정해 보완해야 합니다.

또한 AI는 팀원과 사용자 모두가 이해하기 쉬운 상세 가이드를 제안합니다. API 스키마 버전 관리, 역할 기반 접근 제어 문서화, 비기술 담당자를 위한 슬랙 플레이북을 마련하면 협업 효율이 크게 향상됩니다.

위 개선을 통해 기대되는 효과는 명확합니다. 개발팀은 배포 안정성과 분석 속도를 확보하고, 사용자 측면에서는 추천 정확도 향상과 응답 속도 개선을 체감하게 됩니다.`,
  positiveAspects: [
    '라우팅, 권한 부여, 데이터 파이프라인이 레이어별로 분리돼 구조적 안정성이 높음',
    'React Query + custom hook 조합으로 데이터 패칭 로직이 재사용 가능하게 구성됨',
    'Node/Express 서버에서 Swagger 기반 API 문서화를 시작해 팀 내 공용 언어가 형성됨',
    '배포 스크립트와 Conventional Commits 규칙으로 협업 시 변경 추적이 수월함'
  ],
  areasForImprovement: [
    'BFF 의존성이 커져 특정 API 장애 시 프론트 전체가 멈출 수 있으므로 폴백 로직 도입 필요',
    'AI 분석 기준에서 auth 미들웨어의 에러 응답 포맷이 일관되지 않아 클라이언트 처리가 복잡함',
    'CI 파이프라인에 정적 분석과 보안 스캐닝이 누락돼 운영 위험을 즉시 파악하기 어렵다',
    '다국어 전환과 접근성 체크가 미흡해 공공 서비스 성격에 비해 사용자군 커버리지가 제한적임'
  ],
  recommendations: [
    'Slack/Notion 기반 Runbook을 만들어 장애 유형별 대응 절차를 명문화하세요.',
    'Redis 캐시 계층과 서킷 브레이커 패턴을 적용해 외부 API 장애 시 graceful degrade를 보장하세요.',
    '사용자 세그먼트에 맞춘 퍼널 분석 대시보드를 추가해 추천 정확도를 지속적으로 검증하세요.',
    'QA 단계에서 Cypress E2E 테스트와 Lighthouse CI를 통합해 사용자 경험 품질을 모니터링하세요.'
  ],
  suggestions: [
    'API 관점 가이드: 버전 태그, 샘플 요청/응답, 장애 복구 절차를 포함한 “복지 API 통합 핸드북” 작성',
    '팀 커뮤니케이션: 주간 스탠드업에서 추천 정확도와 장애 지표를 함께 리뷰하도록 아젠다 설정',
    '사용자 온보딩: 첫 방문 시 필터 사용법을 안내하는 인터랙티브 튜토리얼 추가',
    '데이터 운영: 정부 API 변경 주기를 추적하는 체크리스트를 운영팀과 공유'
  ],
  summary: 'AI 피드백 기준으로 BenefitMap은 명확한 구조와 기술 스택을 갖춘 프로젝트입니다. 실무 맞춤형 가이드라인과 협업 프로세스를 정비하면 프로젝트 품질이 향상되고 팀 협업 효율도 비약적으로 증대될 것입니다.'
};

// 분석 타입별 더미 데이터 매핑
const DUMMY_DATA = {
  'general': GENERAL_ANALYSIS,
  'code-quality': CODE_QUALITY_ANALYSIS,
  'ai-feedback': AI_FEEDBACK_ANALYSIS
};

// 더미 응답 생성 함수
function getDummyAnalysisResponse(analysisType = 'general', owner = 'BenefitMap', repo = 'BenefitMap') {
  const analysis = DUMMY_DATA[analysisType] || GENERAL_ANALYSIS;
  
  return {
    success: true,
    model: 'openai',
    analysisType: analysisType,
    repository: {
      name: `${owner}/${repo}`,
      description: REPO_INFO.description,
      language: REPO_INFO.language,
      stars: REPO_INFO.stars,
      forks: REPO_INFO.forks
    },
    analysis: analysis,
    metadata: {
      totalCommits: 10,
      totalContributors: 3,
      analyzedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  getDummyAnalysisResponse,
  REPO_INFO,
  GENERAL_ANALYSIS,
  CODE_QUALITY_ANALYSIS,
  AI_FEEDBACK_ANALYSIS
};

