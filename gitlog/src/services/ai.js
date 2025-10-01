// 간단한 더미 AI 분석 래퍼: 환경변수 기반으로 실제 API 연동 가능
// 예: OPENAI_API_KEY를 사용해 프록시 서버를 두고 호출

export async function analyzeWithAI(owner, repo, commits) {
  // 커밋 메시지 다양성, 빈도 등을 간단 스코어링 (더미)
  const uniqueAuthors = new Set(commits.map(c => c.commit.author.name)).size;
  const total = commits.length;
  const heuristic = Math.max(0, Math.min(1, (uniqueAuthors / 5) * 0.4 + (total / 100) * 0.6));
  return { score: heuristic };
}


