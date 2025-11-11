const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');

// 더미 데이터 사용 여부 (환경 변수로 제어 가능)
// 제거하려면: USE_DUMMY_DATA=false로 설정하거나 이 부분을 삭제하세요
const USE_DUMMY_DATA = process.env.USE_DUMMY_DATA !== 'false'; // 기본값: true
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

// OpenAI API를 사용한 분석
const analyzeWithOpenAI = async (repoData, commits, contributors, analysisType = 'general', branches = []) => {
  // ai-feedback 분석에서는 branches 파라미터를 사용하지 않지만 호환성을 위해 유지
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  // 저장소 정보 요약
  const repoSummary = {
    name: repoData.full_name,
    description: repoData.description || 'No description',
    language: repoData.language || 'Unknown',
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    issues: repoData.open_issues_count || 0,
    createdAt: repoData.created_at,
    updatedAt: repoData.updated_at,
    totalCommits: commits.length,
    totalContributors: contributors.length,
    branches: branches
  };

  // 최근 커밋 메시지 샘플 (최대 10개)
  const recentCommitMessages = commits.slice(0, 10).map(commit => 
    commit.commit?.message?.substring(0, 100) || commit.message?.substring(0, 100) || 'No message'
  ).join('\n');

  // 기여자 정보
  const topContributors = contributors.slice(0, 5).map(contributor => ({
    name: contributor.author || contributor.authorName || 'Unknown',
    commits: contributor.commits || contributor.total || 0,
    percentage: contributor.percentage || 0
  }));

  // 프롬프트 구성
  let systemPrompt = '';
  let userPrompt = '';

  if (analysisType === 'code-quality') {
    systemPrompt = 'You are an expert software engineer and code reviewer. Analyze the GitHub repository and provide detailed code quality assessment.';
    userPrompt = `Analyze this GitHub repository and provide a comprehensive code quality assessment:

Repository: ${repoSummary.name}
Description: ${repoSummary.description}
Language: ${repoSummary.language}
Stars: ${repoSummary.stars}
Forks: ${repoSummary.forks}
Total Commits: ${repoSummary.totalCommits}
Total Contributors: ${repoSummary.totalContributors}

Recent Commit Messages:
${recentCommitMessages}

Top Contributors:
${topContributors.map(c => `- ${c.name}: ${c.commits} commits (${c.percentage}%)`).join('\n')}

Please provide:
1. Overall code quality score (0-100)
2. Code maintainability assessment
3. Code complexity analysis
4. Best practices adherence
5. Areas for improvement
6. Specific recommendations

Format your response in JSON with the following structure:
{
  "overallScore": number,
  "maintainability": "string",
  "complexity": "string",
  "bestPractices": "string",
  "improvements": ["string"],
  "recommendations": ["string"],
  "summary": "string"
}`;
  } else if (analysisType === 'ai-feedback') {
    systemPrompt = 'You are an expert software development consultant and code reviewer. Analyze the GitHub repository and provide constructive, detailed feedback with actionable insights.';
    
    userPrompt = `Analyze this GitHub repository and provide comprehensive AI feedback:

Repository: ${repoSummary.name}
Description: ${repoSummary.description}
Language: ${repoSummary.language}
Stars: ${repoSummary.stars}
Forks: ${repoSummary.forks}
Issues: ${repoSummary.issues}
Created: ${repoSummary.createdAt}
Updated: ${repoSummary.updatedAt}
Total Commits: ${repoSummary.totalCommits}
Total Contributors: ${repoSummary.totalContributors}

Recent Commit Messages:
${recentCommitMessages}

Top Contributors:
${topContributors.map(c => `- ${c.name}: ${c.commits} commits (${c.percentage}%)`).join('\n')}

Please provide comprehensive feedback including:
1. Overall feedback on the repository (what's good, what could be improved)
2. Positive aspects (things done well)
3. Areas for improvement (specific areas that need work)
4. Actionable recommendations (concrete steps to improve)
5. Suggestions for best practices and enhancements
6. Summary of key insights

Format your response in JSON with the following structure:
{
  "feedback": "string (overall comprehensive feedback about the repository)",
  "positiveAspects": ["string (list of positive aspects and strengths)"],
  "areasForImprovement": ["string (list of areas that need improvement)"],
  "recommendations": ["string (actionable recommendations)"],
  "suggestions": ["string (suggestions for enhancements and best practices)"],
  "summary": "string (summary of key insights and takeaways)"
}`;
  } else {
    // 일반 분석
    systemPrompt = 'You are an expert software development consultant. Analyze the GitHub repository and provide comprehensive insights.';
    userPrompt = `Analyze this GitHub repository and provide comprehensive insights:

Repository: ${repoSummary.name}
Description: ${repoSummary.description}
Language: ${repoSummary.language}
Stars: ${repoSummary.stars}
Forks: ${repoSummary.forks}
Issues: ${repoSummary.issues}
Created: ${repoSummary.createdAt}
Updated: ${repoSummary.updatedAt}
Total Commits: ${repoSummary.totalCommits}
Total Contributors: ${repoSummary.totalContributors}

Recent Commit Messages:
${recentCommitMessages}

Top Contributors:
${topContributors.map(c => `- ${c.name}: ${c.commits} commits (${c.percentage}%)`).join('\n')}

Please provide:
1. Project overview and health
2. Development activity analysis
3. Team collaboration assessment
4. Code quality insights
5. Technical recommendations
6. Growth potential analysis

Format your response in JSON with the following structure:
{
  "overview": "string",
  "health": "string",
  "activity": "string",
  "collaboration": "string",
  "quality": "string",
  "recommendations": ["string"],
  "growth": "string",
  "summary": "string"
}`;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    if (!content) {
      throw new Error('OpenAI API returned empty response');
    }
    
    // JSON 파싱 시도 (여러 방법 시도)
    try {
      // 방법 1: 직접 JSON 파싱 시도
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (parseError1) {
      // 방법 2: 코드 블록에서 JSON 추출
      try {
        const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          const parsed = JSON.parse(codeBlockMatch[1]);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        }
      } catch (parseError2) {
        // 방법 3: 첫 번째 JSON 객체 찾기
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed && typeof parsed === 'object') {
              return parsed;
            }
          }
        } catch (parseError3) {
          console.warn('Failed to parse JSON, returning text response');
        }
      }
    }

    // JSON 파싱 실패 시 텍스트 응답 반환
    return {
      rawResponse: content,
      model: 'gpt-4o-mini',
      analysisType: analysisType
    };
  } catch (error) {
    console.error('OpenAI API 오류:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('OpenAI API key is invalid or expired');
    } else if (error.response?.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 500) {
      throw new Error('OpenAI API server error. Please try again later.');
    }
    throw new Error(`OpenAI API error: ${error.message}`);
  }
};

// Google Gemini API를 사용한 분석
const analyzeWithGemini = async (repoData, commits, contributors, analysisType = 'general', branches = []) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  // 저장소 정보 요약
  const repoSummary = {
    name: repoData.full_name,
    description: repoData.description || 'No description',
    language: repoData.language || 'Unknown',
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    issues: repoData.open_issues_count || 0,
    createdAt: repoData.created_at,
    updatedAt: repoData.updated_at,
    totalCommits: commits.length,
    totalContributors: contributors.length,
    branches: branches
  };

  // 최근 커밋 메시지 샘플
  const recentCommitMessages = commits.slice(0, 10).map(commit => 
    commit.commit?.message?.substring(0, 100) || commit.message?.substring(0, 100) || 'No message'
  ).join('\n');

  // 기여자 정보
  const topContributors = contributors.slice(0, 5).map(contributor => ({
    name: contributor.author || contributor.authorName || 'Unknown',
    commits: contributor.commits || contributor.total || 0,
    percentage: contributor.percentage || 0
  }));

  // 프롬프트 구성
  let prompt = '';

  if (analysisType === 'code-quality') {
    prompt = `Analyze this GitHub repository and provide a comprehensive code quality assessment:

Repository: ${repoSummary.name}
Description: ${repoSummary.description}
Language: ${repoSummary.language}
Stars: ${repoSummary.stars}
Forks: ${repoSummary.forks}
Total Commits: ${repoSummary.totalCommits}
Total Contributors: ${repoSummary.totalContributors}

Recent Commit Messages:
${recentCommitMessages}

Top Contributors:
${topContributors.map(c => `- ${c.name}: ${c.commits} commits (${c.percentage}%)`).join('\n')}

Please provide a JSON response with:
{
  "overallScore": number,
  "maintainability": "string",
  "complexity": "string",
  "bestPractices": "string",
  "improvements": ["string"],
  "recommendations": ["string"],
  "summary": "string"
}`;
  } else if (analysisType === 'ai-feedback') {
    prompt = `Analyze this GitHub repository and provide comprehensive AI feedback:

Repository: ${repoSummary.name}
Description: ${repoSummary.description}
Language: ${repoSummary.language}
Stars: ${repoSummary.stars}
Forks: ${repoSummary.forks}
Issues: ${repoSummary.issues}
Created: ${repoSummary.createdAt}
Updated: ${repoSummary.updatedAt}
Total Commits: ${repoSummary.totalCommits}
Total Contributors: ${repoSummary.totalContributors}

Recent Commit Messages:
${recentCommitMessages}

Top Contributors:
${topContributors.map(c => `- ${c.name}: ${c.commits} commits (${c.percentage}%)`).join('\n')}

Please provide comprehensive feedback including:
1. Overall feedback on the repository (what's good, what could be improved)
2. Positive aspects (things done well)
3. Areas for improvement (specific areas that need work)
4. Actionable recommendations (concrete steps to improve)
5. Suggestions for best practices and enhancements
6. Summary of key insights

Format your response in JSON with the following structure:
{
  "feedback": "string (overall comprehensive feedback about the repository)",
  "positiveAspects": ["string (list of positive aspects and strengths)"],
  "areasForImprovement": ["string (list of areas that need improvement)"],
  "recommendations": ["string (actionable recommendations)"],
  "suggestions": ["string (suggestions for enhancements and best practices)"],
  "summary": "string (summary of key insights and takeaways)"
}`;
  } else {
    prompt = `Analyze this GitHub repository and provide comprehensive insights:

Repository: ${repoSummary.name}
Description: ${repoSummary.description}
Language: ${repoSummary.language}
Stars: ${repoSummary.stars}
Forks: ${repoSummary.forks}
Issues: ${repoSummary.issues}
Created: ${repoSummary.createdAt}
Updated: ${repoSummary.updatedAt}
Total Commits: ${repoSummary.totalCommits}
Total Contributors: ${repoSummary.totalContributors}

Recent Commit Messages:
${recentCommitMessages}

Top Contributors:
${topContributors.map(c => `- ${c.name}: ${c.commits} commits (${c.percentage}%)`).join('\n')}

Please provide a JSON response with:
{
  "overview": "string",
  "health": "string",
  "activity": "string",
  "collaboration": "string",
  "quality": "string",
  "recommendations": ["string"],
  "growth": "string",
  "summary": "string"
}`;
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.candidates[0].content.parts[0].text;
    
    // JSON 파싱 시도
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON, returning text response');
    }

    return {
      rawResponse: content,
      model: 'gemini-pro',
      analysisType: analysisType
    };
  } catch (error) {
    console.error('Gemini API 오류:', error.response?.data || error.message);
    throw new Error(`Gemini API error: ${error.message}`);
  }
};

// AI 분석 엔드포인트 (인증 필요)
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { owner, repo, model = 'openai', analysisType = 'general' } = req.body;
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
    
    const { owner, repo, model = 'openai', analysisType = 'general' } = req.body;

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

