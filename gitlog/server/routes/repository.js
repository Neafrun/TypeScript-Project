const express = require('express');
const router = express.Router();
const axios = require('axios');

// GitHub API 토큰 (공개 레포지토리 접근용)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// 레포지토리 정보 가져오기
router.get('/info/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitLog-Analyzer'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    
    res.json(response.data);
  } catch (error) {
    console.error('레포지토리 정보 가져오기 실패:', error.message);
    if (error.response?.status === 404) {
      res.status(404).json({ error: '레포지토리를 찾을 수 없습니다' });
    } else if (error.response?.status === 403) {
      res.status(403).json({ error: 'API 요청 한도 초과. 잠시 후 다시 시도해주세요.' });
    } else {
      res.status(500).json({ error: '서버 오류가 발생했습니다' });
    }
  }
});

// 커밋 통계 가져오기
router.get('/commits/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitLog-Analyzer'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/stats/contributors`, { headers });
    
    res.json(response.data);
  } catch (error) {
    console.error('커밋 통계 가져오기 실패:', error.message);
    if (error.response?.status === 403) {
      res.status(403).json({ error: 'API 요청 한도 초과' });
    } else {
      res.status(500).json({ error: '커밋 통계를 가져올 수 없습니다' });
    }
  }
});

// 모든 브랜치 가져오기
router.get('/branches/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitLog-Analyzer'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, { headers });
    
    res.json(response.data);
  } catch (error) {
    console.error('브랜치 가져오기 실패:', error.message);
    if (error.response?.status === 403) {
      res.status(403).json({ error: 'API 요청 한도 초과' });
    } else {
      res.status(500).json({ error: '브랜치를 가져올 수 없습니다' });
    }
  }
});

// 특정 브랜치의 커밋 가져오기
router.get('/commits/:owner/:repo/:branch', async (req, res) => {
  try {
    const { owner, repo, branch } = req.params;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitLog-Analyzer'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=100`, { headers });
    
    res.json(response.data);
  } catch (error) {
    console.error('브랜치 커밋 가져오기 실패:', error.message);
    if (error.response?.status === 403) {
      res.status(403).json({ error: 'API 요청 한도 초과' });
    } else {
      res.status(500).json({ error: '브랜치 커밋을 가져올 수 없습니다' });
    }
  }
});

// 모든 브랜치의 커밋 가져오기
router.get('/all-commits/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitLog-Analyzer'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    // 1. 모든 브랜치 가져오기
    const branchesResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, { headers });
    const branches = branchesResponse.data;
    
    console.log(`발견된 브랜치 수: ${branches.length}`);
    
    // 2. 각 브랜치의 커밋 가져오기 (더 많은 브랜치 처리)
    const allCommits = [];
    const branchCommits = {};
    let totalCommitsAcrossBranches = 0;
    
    for (const branch of branches.slice(0, 50)) { // 최대 50개 브랜치까지 처리
      try {
        const commitsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch.name}&per_page=200`, { headers });
        const commits = commitsResponse.data;
        
        // 브랜치 정보 추가
        const commitsWithBranch = commits.map(commit => ({
          ...commit,
          branch: branch.name,
          branchProtected: branch.protected || false
        }));
        
        allCommits.push(...commitsWithBranch);
        branchCommits[branch.name] = commitsWithBranch;
        totalCommitsAcrossBranches += commits.length;
        
        console.log(`브랜치 ${branch.name}: ${commits.length}개 커밋`);
      } catch (branchError) {
        console.warn(`브랜치 ${branch.name} 커밋 가져오기 실패:`, branchError.message);
        // 실패한 브랜치도 빈 배열로 추가
        branchCommits[branch.name] = [];
      }
    }
    
    // 3. 중복 커밋 제거 (같은 SHA를 가진 커밋)
    const uniqueCommits = [];
    const seenShas = new Set();
    
    for (const commit of allCommits) {
      if (!seenShas.has(commit.sha)) {
        seenShas.add(commit.sha);
        uniqueCommits.push(commit);
      }
    }
    
    // 4. 날짜순으로 정렬
    uniqueCommits.sort((a, b) => new Date(b.commit.author.date) - new Date(a.commit.author.date));
    
    console.log(`총 브랜치별 커밋 수: ${totalCommitsAcrossBranches}, 고유 커밋 수: ${uniqueCommits.length}`);
    
    // 메모리 사용량을 고려하여 커밋 수 제한
    const maxCommitsForAnalysis = 10000; // 최대 10000개 커밋만 분석 (한도 증가)
    const limitedCommits = uniqueCommits.slice(0, maxCommitsForAnalysis);
    
    if (uniqueCommits.length > maxCommitsForAnalysis) {
      console.warn(`커밋 수가 너무 많아 ${maxCommitsForAnalysis}개로 제한합니다. (총 ${uniqueCommits.length}개)`);
    }
    
    // 브랜치별 실제 커밋 수 계산 (원본 커밋 수 사용)
    const actualBranchStats = Object.keys(branchCommits).map(branchName => {
      const branchCommitsList = branchCommits[branchName];
      return {
        branch: branchName,
        commitCount: branchCommitsList.length, // 원본 커밋 수 사용
        branchProtected: branchCommitsList[0]?.branchProtected || false
      };
    });
    
    // 실제 총 커밋 수 계산 (원본 커밋 수 합계)
    const actualTotalCommits = actualBranchStats.reduce((sum, branch) => sum + branch.commitCount, 0);
    
    res.json({
      totalCommits: uniqueCommits.length,
      totalCommitsAcrossBranches: actualTotalCommits, // 실제 총 커밋 수 사용
      totalBranches: branches.length,
      processedBranches: Math.min(branches.length, 50),
      commits: limitedCommits, // 제한된 커밋 수 반환
      branchStats: actualBranchStats, // 실제 브랜치 통계 사용
      analysisLimit: {
        maxCommits: maxCommitsForAnalysis,
        isLimited: uniqueCommits.length > maxCommitsForAnalysis,
        originalCount: uniqueCommits.length
      }
    });
    
  } catch (error) {
    console.error('모든 브랜치 커밋 가져오기 실패:', error.message);
    if (error.response?.status === 403) {
      res.status(403).json({ error: 'API 요청 한도 초과' });
    } else {
      res.status(500).json({ error: '모든 브랜치 커밋을 가져올 수 없습니다' });
    }
  }
});

// 최근 커밋 가져오기 (기존 유지)
router.get('/recent-commits/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitLog-Analyzer'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    // 더 많은 커밋을 가져와서 분석 정확도 향상
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, { headers });
    
    res.json(response.data);
  } catch (error) {
    console.error('최근 커밋 가져오기 실패:', error.message);
    if (error.response?.status === 403) {
      res.status(403).json({ error: 'API 요청 한도 초과' });
    } else {
      res.status(500).json({ error: '최근 커밋을 가져올 수 없습니다' });
    }
  }
});

// 코드 품질 분석 (AI 기반)
router.post('/analyze', async (req, res) => {
  try {
    const { owner, repo, commits, contributors } = req.body;
    
    console.log('분석 요청:', { owner, repo, commitsCount: commits?.length, contributorsCount: contributors?.length });
    
    // 커밋 수가 많으면 샘플링하여 처리
    const commitsToProcess = commits && commits.length > 2000 ? 
      commits.slice(0, 2000) : commits || [];
    
    console.log(`처리할 커밋 수: ${commitsToProcess.length}개 (원본: ${commits?.length || 0}개)`);
    
    // 모든 브랜치의 커밋에서 기여자 통계 계산
    const allBranchContributors = calculateContributorsFromAllCommits(commitsToProcess);
    
    console.log('모든 브랜치 기여자 통계:', allBranchContributors);
    
    // GitHub 사용자 정보로 기여자 데이터 보강
    const enrichedContributors = await enrichContributorsWithGitHubData(allBranchContributors, owner, repo);
    
    console.log('보강된 기여자 통계:', enrichedContributors.length, '명');
    
    // 간단한 AI 분석 로직 (실제로는 OpenAI API 등을 사용)
    console.log('AI 분석 시작...');
    
    let codeQuality, contributionPattern, activityLevel, recommendations;
    
    try {
      codeQuality = analyzeCodeQuality(commitsToProcess, enrichedContributors);
      console.log('코드 품질 분석 완료');
    } catch (error) {
      console.error('코드 품질 분석 실패:', error);
      codeQuality = { score: 0, description: '분석 실패', metrics: {} };
    }
    
    try {
      contributionPattern = analyzeContributionPattern(enrichedContributors);
      console.log('기여 패턴 분석 완료');
    } catch (error) {
      console.error('기여 패턴 분석 실패:', error);
      contributionPattern = { pattern: 'unknown', description: '분석 실패', metrics: { distribution: [] } };
    }
    
    try {
      activityLevel = analyzeActivityLevel(commitsToProcess);
      console.log('활동 수준 분석 완료');
    } catch (error) {
      console.error('활동 수준 분석 실패:', error);
      activityLevel = { level: 'unknown', description: '분석 실패', metrics: {} };
    }
    
    try {
      recommendations = generateRecommendations(commitsToProcess, enrichedContributors);
      console.log('추천사항 생성 완료');
    } catch (error) {
      console.error('추천사항 생성 실패:', error);
      recommendations = [];
    }
    
    const analysis = {
      repository: `${owner}/${repo}`,
      analysis: {
        codeQuality,
        contributionPattern,
        activityLevel,
        recommendations
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('전체 분석 완료');
    
    res.json(analysis);
  } catch (error) {
    console.error('분석 실패:', error.message, error.stack);
    res.status(500).json({ error: '분석을 수행할 수 없습니다', details: error.message });
  }
});

// 모든 브랜치의 커밋에서 기여자 통계 계산
function calculateContributorsFromAllCommits(commits) {
  const contributorMap = new Map();
  
  commits.forEach(commit => {
    const author = commit.commit?.author;
    if (!author) return;
    
    const authorKey = author.email || author.name || 'unknown';
    
    if (!contributorMap.has(authorKey)) {
      contributorMap.set(authorKey, {
        author: {
          login: author.name || author.email || 'unknown',
          name: author.name || author.email || 'unknown',
          email: author.email || '',
          avatar_url: null
        },
        total: 0,
        weeks: []
      });
    }
    
    contributorMap.get(authorKey).total += 1;
  });
  
  // Map을 배열로 변환하고 커밋 수로 정렬
  const contributors = Array.from(contributorMap.values())
    .sort((a, b) => b.total - a.total);
  
  console.log(`총 ${contributors.length}명의 기여자 발견`);
  
  return contributors;
}

// GitHub 사용자 정보 가져오기 (아바타 등)
async function enrichContributorsWithGitHubData(contributors, owner, repo) {
  if (!GITHUB_TOKEN) {
    console.log('GitHub 토큰이 없어 기본 기여자 정보 사용');
    return contributors;
  }
  
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitLog-Analyzer',
    'Authorization': `token ${GITHUB_TOKEN}`
  };
  
  const enrichedContributors = [];
  
  console.log(`기여자 ${contributors.length}명의 GitHub 정보 가져오기 시작`);
  
  for (const contributor of contributors.slice(0, 20)) { // 상위 20명만 처리
    try {
      // GitHub API로 사용자 정보 가져오기
      const userResponse = await axios.get(`https://api.github.com/users/${contributor.author.login}`, { headers });
      const userData = userResponse.data;
      
      enrichedContributors.push({
        ...contributor,
        author: {
          ...contributor.author,
          login: userData.login,
          name: userData.name || userData.login,
          email: userData.email || contributor.author.email,
          avatar_url: userData.avatar_url
        }
      });
      
      console.log(`사용자 ${contributor.author.login} 정보 성공적으로 가져옴`);
    } catch (error) {
      console.warn(`사용자 ${contributor.author.login} 정보 가져오기 실패:`, error.message);
      console.warn(`상태 코드: ${error.response?.status}, 응답: ${JSON.stringify(error.response?.data)}`);
      
      // 실패한 경우 기본 정보 사용
      enrichedContributors.push({
        ...contributor,
        author: {
          ...contributor.author,
          avatar_url: null
        }
      });
    }
  }
  
  return enrichedContributors;
}

// 코드 품질 분석 함수
function analyzeCodeQuality(commits, contributors) {
  const totalCommits = commits ? commits.length : 0;
  const contributorsCount = contributors ? contributors.length : 0;
  
  let qualityScore = 0;
  let qualityLevel = 'Low';
  
  // 커밋 빈도 기반 점수 (더 세밀한 분석)
  if (totalCommits > 500) qualityScore += 35;
  else if (totalCommits > 200) qualityScore += 30;
  else if (totalCommits > 100) qualityScore += 25;
  else if (totalCommits > 50) qualityScore += 20;
  else if (totalCommits > 20) qualityScore += 15;
  else if (totalCommits > 10) qualityScore += 10;
  
  // 기여자 수 기반 점수
  if (contributorsCount > 10) qualityScore += 30;
  else if (contributorsCount > 5) qualityScore += 25;
  else if (contributorsCount > 2) qualityScore += 20;
  else if (contributorsCount > 1) qualityScore += 15;
  else if (contributorsCount > 0) qualityScore += 10;
  
  // 최근 활동 기반 점수 (더 정확한 분석)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  const recentCommits = commits ? commits.filter(commit => {
    const commitDate = new Date(commit.commit?.author?.date);
    return commitDate > thirtyDaysAgo;
  }) : [];
  
  const veryRecentCommits = commits ? commits.filter(commit => {
    const commitDate = new Date(commit.commit?.author?.date);
    return commitDate > sevenDaysAgo;
  }) : [];
  
  // 최근 활동 점수
  if (veryRecentCommits.length > 5) qualityScore += 25;
  else if (veryRecentCommits.length > 2) qualityScore += 20;
  else if (veryRecentCommits.length > 0) qualityScore += 15;
  else if (recentCommits.length > 10) qualityScore += 10;
  else if (recentCommits.length > 5) qualityScore += 5;
  
  // 커밋 메시지 품질 기반 점수 (더 정교한 분석)
  const goodCommitMessages = commits ? commits.filter(commit => {
    const message = commit.commit?.message?.toLowerCase() || '';
    return message.length > 15 && 
           (message.includes('fix') || message.includes('add') || message.includes('update') || 
            message.includes('refactor') || message.includes('improve') || message.includes('optimize') ||
            message.includes('feature') || message.includes('bug') || message.includes('enhance'));
  }) : [];
  
  const commitMessageQuality = totalCommits > 0 ? Math.round((goodCommitMessages.length / totalCommits) * 100) : 0;
  
  if (commitMessageQuality > 80) qualityScore += 25;
  else if (commitMessageQuality > 60) qualityScore += 20;
  else if (commitMessageQuality > 40) qualityScore += 15;
  else if (commitMessageQuality > 20) qualityScore += 10;
  
  // 품질 레벨 결정
  if (qualityScore >= 90) qualityLevel = 'Excellent';
  else if (qualityScore >= 70) qualityLevel = 'Good';
  else if (qualityScore >= 50) qualityLevel = 'Fair';
  else if (qualityScore >= 30) qualityLevel = 'Poor';
  else qualityLevel = 'Very Poor';
  
  return {
    score: Math.min(qualityScore, 100), // 최대 100점으로 제한
    level: qualityLevel,
    metrics: {
      totalCommits,
      contributorsCount,
      recentActivity: recentCommits.length,
      veryRecentActivity: veryRecentCommits.length,
      commitMessageQuality,
      lastCommitDate: commits && commits.length > 0 ? commits[0].commit?.author?.date : null
    }
  };
}

// 기여 패턴 분석 함수
function analyzeContributionPattern(contributors) {
  try {
    if (!contributors || contributors.length === 0) {
      return { pattern: 'No contributions', description: '기여 기록이 없습니다', metrics: { totalContributors: 0, topContributorPercentage: 0, distribution: [] } };
    }
  
    const totalCommits = contributors.reduce((sum, contributor) => sum + (contributor.total || 0), 0);
    const sortedContributors = contributors.sort((a, b) => (b.total || 0) - (a.total || 0));
    const topContributor = sortedContributors[0];
    const topContributorPercentage = totalCommits > 0 ? (topContributor.total / totalCommits) * 100 : 0;
    
    let pattern = 'Distributed';
    let description = '기여가 여러 개발자에게 분산되어 있습니다';
    
    if (topContributorPercentage > 80) {
      pattern = 'Single Contributor';
      description = `주요 기여자: ${topContributor.author?.login || 'Unknown'} (${Math.round(topContributorPercentage)}%)`;
    } else if (topContributorPercentage > 60) {
      pattern = 'Lead Developer';
      description = `주요 개발자: ${topContributor.author?.login || 'Unknown'} (${Math.round(topContributorPercentage)}%), 다른 개발자들도 기여`;
    } else if (contributors.length === 1) {
      pattern = 'Solo Project';
      description = `개인 프로젝트: ${topContributor.author?.login || 'Unknown'}`;
    } else if (topContributorPercentage < 30) {
      pattern = 'Highly Distributed';
      description = '기여가 매우 고르게 분산되어 있습니다';
    }
    
    // 기여자 정보를 더 명확하게 표시
    const distribution = contributors.map(c => ({
      author: c.author?.login || 'Unknown',
      authorName: c.author?.name || c.author?.login || 'Unknown',
      avatar: c.author?.avatar_url || null,
      commits: c.total || 0,
      percentage: totalCommits > 0 ? Math.round(((c.total || 0) / totalCommits) * 100) : 0,
      weeks: c.weeks || []
    }));
    
    return {
      pattern,
      description,
      metrics: {
        totalContributors: contributors.length,
        topContributorPercentage: Math.round(topContributorPercentage),
        topContributor: {
          name: topContributor.author?.login || 'Unknown',
          commits: topContributor.total || 0,
          percentage: Math.round(topContributorPercentage)
        },
        distribution
      }
    };
  } catch (error) {
    console.error('기여 패턴 분석 오류:', error);
    return { pattern: 'Error', description: '분석 중 오류가 발생했습니다', metrics: { totalContributors: 0, topContributorPercentage: 0, distribution: [] } };
  }
}

// 활동 수준 분석 함수
function analyzeActivityLevel(commits) {
  try {
    if (!commits || commits.length === 0) {
      return { level: 'Inactive', description: '활동이 없습니다', metrics: { recentCommits: 0, oldCommits: 0, totalCommits: 0, lastCommitDate: null } };
    }
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  const recentCommits = commits.filter(commit => {
    const commitDate = new Date(commit.commit.author.date);
    return commitDate > thirtyDaysAgo;
  });
  
  const oldCommits = commits.filter(commit => {
    const commitDate = new Date(commit.commit.author.date);
    return commitDate > ninetyDaysAgo && commitDate <= thirtyDaysAgo;
  });
  
  let level = 'Low';
  let description = '활동 수준이 낮습니다';
  
  if (recentCommits.length > 20) {
    level = 'Very High';
    description = '매우 활발한 프로젝트입니다';
  } else if (recentCommits.length > 10) {
    level = 'High';
    description = '활발한 프로젝트입니다';
  } else if (recentCommits.length > 5) {
    level = 'Medium';
    description = '적당한 활동 수준입니다';
  } else if (oldCommits.length > 0) {
    level = 'Low';
    description = '최근 활동이 적습니다';
  } else {
    level = 'Inactive';
    description = '오랫동안 활동이 없습니다';
  }
  
    return {
      level,
      description,
      metrics: {
        recentCommits: recentCommits.length,
        oldCommits: oldCommits.length,
        totalCommits: commits.length,
        lastCommitDate: commits[0]?.commit?.author?.date || null
      }
    };
  } catch (error) {
    console.error('활동 수준 분석 오류:', error);
    return { level: 'Error', description: '분석 중 오류가 발생했습니다', metrics: { recentCommits: 0, oldCommits: 0, totalCommits: 0, lastCommitDate: null } };
  }
}

// 추천사항 생성 함수
function generateRecommendations(commits, contributors) {
  try {
    const recommendations = [];
  
  // 커밋 메시지 품질 개선
  const shortMessages = commits.filter(commit => commit.commit.message.length < 10);
  if (shortMessages.length > commits.length * 0.3) {
    recommendations.push({
      type: 'commit-message',
      title: '커밋 메시지 개선',
      description: '더 명확하고 설명적인 커밋 메시지를 작성하세요',
      priority: 'Medium'
    });
  }
  
  // 기여자 다양성
  if (contributors.length === 1) {
    recommendations.push({
      type: 'collaboration',
      title: '협업 활성화',
      description: '다른 개발자들과의 협업을 고려해보세요',
      priority: 'Low'
    });
  }
  
  // 활동 빈도
  const recentCommits = commits.filter(commit => {
    const commitDate = new Date(commit.commit.author.date);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return commitDate > thirtyDaysAgo;
  });
  
  if (recentCommits.length < 3) {
    recommendations.push({
      type: 'activity',
      title: '활동 빈도 증가',
      description: '더 정기적인 커밋을 통해 프로젝트를 활성화하세요',
      priority: 'High'
    });
  }
  
    return recommendations;
  } catch (error) {
    console.error('추천사항 생성 오류:', error);
    return [{ type: 'error', title: '오류', description: '추천사항을 생성할 수 없습니다', priority: 'Low' }];
  }
}

module.exports = router;
