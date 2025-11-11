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
  overallScore: 72,
  maintainability: '프로젝트는 프론트엔드와 백엔드가 명확하게 분리되어 있어 유지보수성이 좋습니다. 모노레포 구조로 관리되고 있으며, Git 브랜치 전략이 잘 정의되어 있습니다. 하지만 TypeScript가 아닌 JavaScript를 사용하고 있어 타입 안정성 측면에서 개선이 필요합니다.',
  complexity: '프로젝트 구조는 비교적 단순합니다. Frontend와 Backend로 명확하게 분리되어 있으며, 각 디렉토리 내에서 역할이 구분되어 있습니다. 초기 단계임을 고려할 때 복잡도는 적절한 수준입니다.',
  bestPractices: '프로젝트는 여러 모범 사례를 따르고 있습니다: Conventional Commits 규칙, feature 브랜치 전략, PR 리뷰 프로세스, 스쿼시 머지 등이 잘 정의되어 있습니다. README도 상세하게 작성되어 있어 프로젝트 이해가 용이합니다.',
  improvements: [
    'TypeScript 도입으로 타입 안정성 향상',
    'ESLint와 Prettier 설정으로 코드 스타일 통일',
    '단위 테스트 및 통합 테스트 작성',
    'API 문서화 (Swagger/OpenAPI) 추가',
    '환경 변수 관리 시스템 구축 (.env.example 제공)',
    '에러 바운더리 및 전역 에러 핸들링',
    '로깅 시스템 구축',
    '성능 모니터링 도구 도입'
  ],
  recommendations: [
    '코드 리뷰 프로세스를 더욱 체계화',
    '테스트 커버리지 목표 설정 (예: 80% 이상)',
    '코드 품질 메트릭 도입 (SonarQube 등)',
    '의존성 취약점 스캔 자동화',
    '컴포넌트 라이브러리 구축 고려'
  ],
  summary: 'BenefitMap 프로젝트는 전반적으로 좋은 코드 품질을 보여줍니다. 체계적인 개발 프로세스와 명확한 프로젝트 구조가 장점입니다. TypeScript 도입, 테스트 코드 작성, API 문서화 등을 통해 코드 품질을 더욱 향상시킬 수 있습니다.'
};

// AI 피드백 분석 더미 데이터
const AI_FEEDBACK_ANALYSIS = {
  feedback: 'BenefitMap 프로젝트는 정부 복지 API를 통합한 실용적인 웹서비스로, 명확한 목적과 체계적인 개발 프로세스를 가지고 있습니다. 프론트엔드와 백엔드가 분리된 구조와 모노레포 관리 방식은 확장성과 유지보수성 측면에서 우수합니다. Conventional Commits, feature 브랜치 전략, PR 리뷰 프로세스 등이 잘 정의되어 있어 팀 협업에 적합합니다. 다만 TypeScript 미사용, 테스트 코드 부재, API 문서화 부족 등은 개선이 필요한 부분입니다.',
  positiveAspects: [
    '명확한 프로젝트 목적과 기능 정의',
    '프론트엔드와 백엔드의 명확한 분리',
    '체계적인 Git 워크플로우 (feature 브랜치, PR 리뷰)',
    '상세한 README 문서',
    'Conventional Commits 규칙 준수',
    '모노레포 구조로 관리',
    '실용적인 기능 (복지 검색, 추천, 알림, 캘린더)',
    '비회원/회원 구분 기능'
  ],
  areasForImprovement: [
    'TypeScript 도입으로 타입 안정성 향상',
    '테스트 코드 작성 (단위 테스트, 통합 테스트)',
    'API 문서화 (Swagger/OpenAPI)',
    '에러 핸들링 및 로깅 시스템',
    'CI/CD 파이프라인 구축',
    '코드 품질 메트릭 도입',
    '의존성 취약점 관리',
    '성능 최적화'
  ],
  recommendations: [
    'TypeScript로 점진적 마이그레이션 고려',
    'Jest 또는 Vitest를 사용한 테스트 프레임워크 도입',
    'Swagger/OpenAPI를 사용한 API 문서 자동 생성',
    'Sentry나 LogRocket 같은 에러 모니터링 도구 도입',
    'GitHub Actions를 사용한 CI/CD 파이프라인 구축',
    'SonarQube나 CodeClimate을 사용한 코드 품질 분석',
    'Dependabot을 사용한 의존성 업데이트 자동화',
    'Lighthouse를 사용한 성능 모니터링'
  ],
  suggestions: [
    '컴포넌트 라이브러리 구축으로 재사용성 향상',
    '상태 관리 라이브러리 (Redux, Zustand) 도입 고려',
    'API 클라이언트 레이어 구축 (Axios 인터셉터 등)',
    '다국어 지원 (i18n) 추가',
    '다크 모드 지원',
    '접근성 (a11y) 개선',
    'PWA 기능 추가',
    '모바일 반응형 디자인 최적화'
  ],
  summary: 'BenefitMap은 실용적이고 체계적으로 구성된 프로젝트입니다. 현재 상태에서도 충분히 사용 가능하지만, TypeScript 도입, 테스트 코드 작성, API 문서화 등을 통해 프로덕션 수준의 품질로 향상시킬 수 있습니다. 특히 정부 API 통합이라는 실용적인 아이디어와 체계적인 개발 프로세스가 프로젝트의 강점입니다.'
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

