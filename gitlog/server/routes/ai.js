const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { analyzeWithOpenAI, analyzeWithGemini } = require('./ai-helpers');
const checkAnalysisLimit = require('../middleware/checkAnalysisLimit');
const { updateAnalysisUsage } = require('../db/database');

// 더미 데이터 사용 여부 (환경 변수로 제어 가능)
// 제거하려면: USE_DUMMY_DATA=false로 설정하거나 이 부분을 삭제하세요
const USE_DUMMY_DATA = process.env.USE_DUMMY_DATA === 'true'; // 기본값: false (실제 AI 사용)
let dummyDataModule = null;

if (USE_DUMMY_DATA) {
  try {
    const path = require('path');
    const fs = require('fs');
    // routes 디렉토리에서 상위 디렉토리의 data 폴더를 참조
    const dummyDataPath = path.join(__dirname, '..', 'data', 'dummy-analysis-data.js');
    
    if (fs.existsSync(dummyDataPath)) {
      dummyDataModule = require('../data/dummy-analysis-data');
      console.log('📦 [더미 데이터] 더미 데이터 모드가 활성화되었습니다.');
      console.log('   모든 AI 분석 요청은 더미 데이터로 응답합니다.');
      console.log('   제거하려면: USE_DUMMY_DATA=false로 설정하거나 gitlog/server/data/dummy-analysis-data.js 파일을 삭제하세요.');
    } else {
      console.warn('⚠️ [더미 데이터] 더미 데이터 파일을 찾을 수 없습니다:', dummyDataPath);
      console.warn('   현재 디렉토리:', __dirname);
    }
  } catch (error) {
    console.error('❌ [더미 데이터] 더미 데이터 파일을 로드할 수 없습니다:', error.message);
    console.error('   스택:', error.stack);
    console.error('   실제 API를 사용합니다.');
  }
} else {
  console.log('ℹ️ [더미 데이터] 더미 데이터 모드가 비활성화되었습니다. 실제 API를 사용합니다.');
}

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// GitHub API 호출 헬퍼 함수
const callGitHubAPI = async (url, accessToken) => {
  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitLog-App'
    };
    
    const token = accessToken || process.env.GITHUB_TOKEN;
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error('GitHub API 호출 오류:', error.response?.data || error.message);
    throw error;
  }
};

// AI 분석 함수는 ai-helpers.js에서 import하여 사용

// AI 분석 엔드포인트 (인증 필요, 분석 횟수 체크)
router.post('/analyze', authenticateToken, checkAnalysisLimit, async (req, res) => {
  try {
    // 사용 가능한 API 키에 따라 기본 모델 자동 선택
    const defaultModel = process.env.OPENAI_API_KEY ? 'openai' : 
                        process.env.GEMINI_API_KEY ? 'gemini' : 'openai';
    let { owner, repo, model, analysisType = 'general' } = req.body;
    // model이 지정되지 않았으면 기본 모델 사용
    if (!model) {
      model = defaultModel;
    }
    const accessToken = req.user.githubAccessToken;

    console.log(`🤖 [AI 분석] ${owner}/${repo} 분석을 시작합니다 (모델: ${model}, 유형: ${analysisType})`);

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo are required' });
    }

    // 더미 데이터 사용 (환경 변수로 제어)
    if (USE_DUMMY_DATA && dummyDataModule) {
      console.log('📦 [더미 데이터] 더미 데이터를 사용하여 응답합니다.');
      const dummyResponse = dummyDataModule.getDummyAnalysisResponse(analysisType, owner, repo);
      return res.json(dummyResponse);
    }

    // 지원하는 모델 확인
    if (!['openai', 'gemini'].includes(model)) {
      return res.status(400).json({ error: 'Unsupported model. Use "openai" or "gemini"' });
    }

    // API 키 확인
    if (model === 'openai' && !process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }
    if (model === 'gemini' && !process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }

    // 1. 레포지토리 정보 가져오기
    const repoData = await callGitHubAPI(
      `https://api.github.com/repos/${owner}/${repo}`,
      accessToken
    );

    // 2. 커밋 데이터 가져오기
    let commitsData = [];
    try {
      const allCommitsData = await callGitHubAPI(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
        accessToken
      );
      commitsData = allCommitsData;
    } catch (error) {
      console.warn('커밋 데이터 가져오기 실패:', error.message);
    }

    // 3. 기여자 데이터 가져오기
    let contributorsData = [];
    try {
      const statsData = await callGitHubAPI(
        `https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
        accessToken
      );
      
      if (Array.isArray(statsData)) {
        contributorsData = statsData.map(contributor => {
          const totalCommits = contributor.total;
          const weeks = contributor.weeks || [];
          const totalAdditions = weeks.reduce((sum, week) => sum + (week.a || 0), 0);
          const totalDeletions = weeks.reduce((sum, week) => sum + (week.d || 0), 0);
          
          return {
            author: contributor.author.login,
            authorName: contributor.author.login,
            avatar: contributor.author.avatar_url,
            commits: totalCommits,
            total: totalCommits,
            additions: totalAdditions,
            deletions: totalDeletions,
            percentage: 0
          };
        });

        const totalCommits = contributorsData.reduce((sum, c) => sum + c.commits, 0);
        contributorsData.forEach(contributor => {
          contributor.percentage = totalCommits > 0 ? Math.round((contributor.commits / totalCommits) * 100 * 100) / 100 : 0;
        });
        contributorsData.sort((a, b) => b.commits - a.commits);
      }
    } catch (error) {
      console.warn('기여자 데이터 가져오기 실패:', error.message);
    }

    // 4. 브랜치 정보 가져오기 (ai-feedback 분석에서는 필요 없음)
    // AI 피드백 분석은 브랜치 정보 없이도 가능하므로 생략
    let branchesData = [];

    // 5. AI 분석 수행
    let analysisResult;
    if (model === 'openai') {
      analysisResult = await analyzeWithOpenAI(repoData, commitsData, contributorsData, analysisType, branchesData);
    } else if (model === 'gemini') {
      analysisResult = await analyzeWithGemini(repoData, commitsData, contributorsData, analysisType, branchesData);
    }

    console.log(`✅ [AI 분석] ${owner}/${repo} 분석이 완료되었습니다`);

    // 분석 완료 후 사용 기록 업데이트
    try {
      updateAnalysisUsage(req.user.id, req.user.login);
      console.log('✅ [AI 분석] 사용 기록 업데이트 완료');
    } catch (error) {
      console.error('⚠️ [AI 분석] 사용 기록 업데이트 실패:', error);
      // 분석은 성공했으므로 계속 진행
    }

    res.json({
      success: true,
      model: model,
      analysisType: analysisType,
      repository: {
        name: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count
      },
      analysis: analysisResult,
      metadata: {
        totalCommits: commitsData.length,
        totalContributors: contributorsData.length,
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI 분석 오류:', error);
    
    res.status(500).json({
      error: 'AI analysis failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 공개 레포지토리 AI 분석 엔드포인트 (인증 불필요)
router.post('/public/analyze', async (req, res) => {
  try {
    console.log('📥 [공개 AI 분석] 요청 받음:', req.method, req.url);
    console.log('📥 [공개 AI 분석] 요청 본문:', JSON.stringify(req.body, null, 2));
    console.log('📥 [공개 AI 분석] 요청 헤더:', req.headers);
    
    // 사용 가능한 API 키에 따라 기본 모델 자동 선택
    const defaultModel = process.env.OPENAI_API_KEY ? 'openai' : 
                        process.env.GEMINI_API_KEY ? 'gemini' : 'openai';
    let { owner, repo, model, analysisType = 'general' } = req.body;
    // model이 지정되지 않았으면 기본 모델 사용
    if (!model) {
      model = defaultModel;
    }

    console.log(`🤖 [공개 AI 분석] ${owner}/${repo} 분석을 시작합니다 (모델: ${model}, 유형: ${analysisType})`);

    if (!owner || !repo) {
      console.warn('⚠️ [공개 AI 분석] Owner 또는 repo가 없습니다');
      return res.status(400).json({ error: 'Owner and repo are required' });
    }

    // 더미 데이터 사용 (환경 변수로 제어)
    if (USE_DUMMY_DATA && dummyDataModule) {
      console.log('📦 [더미 데이터] 더미 데이터를 사용하여 응답합니다.');
      const dummyResponse = dummyDataModule.getDummyAnalysisResponse(analysisType, owner, repo);
      console.log('✅ [더미 데이터] 응답 생성 완료');
      return res.json(dummyResponse);
    } else {
      console.warn('⚠️ [더미 데이터] 더미 데이터 모듈이 없습니다. USE_DUMMY_DATA:', USE_DUMMY_DATA, 'dummyDataModule:', !!dummyDataModule);
    }

    // 지원하는 모델 확인
    if (!['openai', 'gemini'].includes(model)) {
      return res.status(400).json({ error: 'Unsupported model. Use "openai" or "gemini"' });
    }

    // API 키 확인
    if (model === 'openai' && !process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }
    if (model === 'gemini' && !process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }

    // 1. 레포지토리 정보 가져오기 (공개)
    const repoData = await callGitHubAPI(
      `https://api.github.com/repos/${owner}/${repo}`,
      null
    );

    // 2. 커밋 데이터 가져오기 (공개)
    let commitsData = [];
    try {
      const allCommitsData = await callGitHubAPI(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
        null
      );
      commitsData = allCommitsData;
    } catch (error) {
      console.warn('커밋 데이터 가져오기 실패:', error.message);
    }

    // 3. 기여자 데이터 가져오기 (공개)
    let contributorsData = [];
    try {
      const statsData = await callGitHubAPI(
        `https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
        null
      );
      
      if (Array.isArray(statsData)) {
        contributorsData = statsData.map(contributor => {
          const totalCommits = contributor.total;
          const weeks = contributor.weeks || [];
          const totalAdditions = weeks.reduce((sum, week) => sum + (week.a || 0), 0);
          const totalDeletions = weeks.reduce((sum, week) => sum + (week.d || 0), 0);
          
          return {
            author: contributor.author.login,
            authorName: contributor.author.login,
            avatar: contributor.author.avatar_url,
            commits: totalCommits,
            total: totalCommits,
            additions: totalAdditions,
            deletions: totalDeletions,
            percentage: 0
          };
        });

        const totalCommits = contributorsData.reduce((sum, c) => sum + c.commits, 0);
        contributorsData.forEach(contributor => {
          contributor.percentage = totalCommits > 0 ? Math.round((contributor.commits / totalCommits) * 100 * 100) / 100 : 0;
        });
        contributorsData.sort((a, b) => b.commits - a.commits);
      }
    } catch (error) {
      console.warn('기여자 데이터 가져오기 실패:', error.message);
    }

    // 4. 브랜치 정보 가져오기 (ai-feedback 분석에서는 필요 없음)
    // AI 피드백 분석은 브랜치 정보 없이도 가능하므로 생략
    let branchesData = [];

    // 5. AI 분석 수행
    let analysisResult;
    if (model === 'openai') {
      analysisResult = await analyzeWithOpenAI(repoData, commitsData, contributorsData, analysisType, branchesData);
    } else if (model === 'gemini') {
      analysisResult = await analyzeWithGemini(repoData, commitsData, contributorsData, analysisType, branchesData);
    }

    console.log(`✅ [공개 AI 분석] ${owner}/${repo} 분석이 완료되었습니다`);

    res.json({
      success: true,
      model: model,
      analysisType: analysisType,
      repository: {
        name: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count
      },
      analysis: analysisResult,
      metadata: {
        totalCommits: commitsData.length,
        totalContributors: contributorsData.length,
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('공개 AI 분석 오류:', error);
    
    res.status(500).json({
      error: 'AI analysis failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

