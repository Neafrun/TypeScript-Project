const axios = require('axios');

// OpenAI API를 사용한 분석
const analyzeWithOpenAI = async (repoData, commits, contributors, analysisType = 'general', branches = []) => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  // 저장소 정보 요약
  const repoSummary = {
    name: repoData.full_name || `${repoData.owner}/${repoData.repo}`,
    description: repoData.description || 'No description',
    language: repoData.language || 'Unknown',
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    issues: repoData.open_issues_count || 0,
    createdAt: repoData.created_at || new Date().toISOString(),
    updatedAt: repoData.updated_at || new Date().toISOString(),
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
    // 일반 분석 (기본값)
    systemPrompt = 'You are an expert software development consultant. Analyze the GitHub repository and provide comprehensive insights including code quality, contribution patterns, activity level, and recommendations in a structured format that can be used to enhance the repository analysis results.';
    userPrompt = `Analyze this GitHub repository and provide comprehensive insights in JSON format:

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

Please provide a JSON response that includes:
1. Code quality analysis (score 0-100, level, description)
2. Contribution pattern analysis (distribution, metrics)
3. Activity level analysis (level, description, metrics)
4. Recommendations (array of recommendation objects with priority, title, description)

Format your response in JSON with the following structure:
{
  "codeQuality": {
    "score": number (0-100),
    "level": "string (Excellent/Good/Fair/Poor/Very Poor)",
    "description": "string",
    "metrics": {
      "totalCommits": number,
      "contributorsCount": number,
      "uniqueAuthors": number,
      "recentCommits": number
    }
  },
  "contributionPattern": {
    "distribution": [{"author": "string", "commits": number, "percentage": number, "avatar": "string"}],
    "metrics": {
      "totalContributors": number,
      "topContributor": {"author": "string", "commits": number, "percentage": number},
      "distribution": [{"author": "string", "commits": number, "percentage": number}]
    }
  },
  "activityLevel": {
    "level": "string (Very Active/Active/Moderate/Low/Inactive)",
    "description": "string (translation key)",
    "metrics": {
      "recentCommits": number,
      "lastCommitDate": "string (ISO date)"
    }
  },
  "recommendations": [
    {
      "priority": "string (High/Medium/Low)",
      "title": "string (translation key)",
      "description": "string (translation key)"
    }
  ]
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
    name: repoData.full_name || `${repoData.owner}/${repoData.repo}`,
    description: repoData.description || 'No description',
    language: repoData.language || 'Unknown',
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    issues: repoData.open_issues_count || 0,
    createdAt: repoData.created_at || new Date().toISOString(),
    updatedAt: repoData.updated_at || new Date().toISOString(),
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
    // 일반 분석
    prompt = `Analyze this GitHub repository and provide comprehensive insights in JSON format:

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

Please provide a JSON response that includes:
1. Code quality analysis (score 0-100, level, description)
2. Contribution pattern analysis (distribution, metrics)
3. Activity level analysis (level, description, metrics)
4. Recommendations (array of recommendation objects with priority, title, description)

Format your response in JSON with the following structure:
{
  "codeQuality": {
    "score": number (0-100),
    "level": "string (Excellent/Good/Fair/Poor/Very Poor)",
    "description": "string",
    "metrics": {
      "totalCommits": number,
      "contributorsCount": number,
      "uniqueAuthors": number,
      "recentCommits": number
    }
  },
  "contributionPattern": {
    "distribution": [{"author": "string", "commits": number, "percentage": number, "avatar": "string"}],
    "metrics": {
      "totalContributors": number,
      "topContributor": {"author": "string", "commits": number, "percentage": number},
      "distribution": [{"author": "string", "commits": number, "percentage": number}]
    }
  },
  "activityLevel": {
    "level": "string (Very Active/Active/Moderate/Low/Inactive)",
    "description": "string (translation key)",
    "metrics": {
      "recentCommits": number,
      "lastCommitDate": "string (ISO date)"
    }
  },
  "recommendations": [
    {
      "priority": "string (High/Medium/Low)",
      "title": "string (translation key)",
      "description": "string (translation key)"
    }
  ]
}`;
  }

  // v1 API만 사용 (v1beta는 최신 모델을 지원하지 않음)
  // 여러 모델을 순차적으로 시도 (가장 기본적인 모델부터)
  const models = [
    'gemini-pro', // 가장 기본적인 모델 (우선 시도)
    'gemini-1.0-pro', // v1.0 버전
    'gemini-1.5-flash', // 빠른 모델
    'gemini-1.5-pro', // 강력한 모델
  ];

  let lastError = null;

  for (const model of models) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
      
      console.log(`🔄 [Gemini API] v1/${model} 모델 시도 중...`);
      
      const response = await axios.post(
        apiUrl,
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
          },
          timeout: 30000 // 30초 타임아웃
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      
      console.log(`✅ [Gemini API] v1/${model} 모델로 성공적으로 분석 완료`);
      
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
        model: `v1/${model}`,
        analysisType: analysisType
      };
    } catch (error) {
      lastError = error;
      const errorMsg = error.response?.data?.error?.message || error.message;
      const errorStatus = error.response?.status;
      console.warn(`⚠️ [Gemini API] v1/${model} 모델 실패 (${errorStatus}): ${errorMsg}`);
      
      // 모델을 찾을 수 없는 에러(404, 400, "not found" 메시지)면 다음 모델 시도
      const isModelNotFound = errorStatus === 404 || 
                              errorStatus === 400 || 
                              (errorMsg && errorMsg.toLowerCase().includes('not found')) ||
                              (errorMsg && errorMsg.toLowerCase().includes('not supported'));
      
      if (!isModelNotFound) {
        // 다른 에러면 즉시 중단 (인증 오류, 할당량 초과 등)
        console.error('Gemini API 오류:', error.response?.data || error.message);
        if (error.response?.data?.error) {
          throw new Error(`Gemini API error: ${error.response.data.error.message || error.message}`);
        }
        throw new Error(`Gemini API error: ${error.message}`);
      }
      
      // 모델을 찾을 수 없으면 다음 모델 시도
      continue;
    }
  }

  // 모든 모델 시도 실패
  console.error('Gemini API 오류: 모든 모델 시도 실패', lastError?.response?.data || lastError?.message);
  if (lastError?.response?.data?.error) {
    throw new Error(`Gemini API error: 모든 모델 시도 실패 - ${lastError.response.data.error.message || lastError.message}`);
  }
  throw new Error(`Gemini API error: 모든 모델 시도 실패 - ${lastError?.message || 'Unknown error'}`);
};

module.exports = {
  analyzeWithOpenAI,
  analyzeWithGemini
};

