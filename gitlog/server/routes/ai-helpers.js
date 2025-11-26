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

  // 최근 커밋 메시지 샘플 (최대 5개로 축소 - 속도 개선)
  const recentCommitMessages = commits.slice(0, 5).map(commit => 
    commit.commit?.message?.substring(0, 80) || commit.message?.substring(0, 80) || 'No message'
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
        max_tokens: 3000 // 토큰 수 축소 - 속도 개선
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

  // 모델 목록 확인 로직 제거 (속도 개선)
  // 직접 사용할 모델 지정

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

  // 최근 커밋 메시지 샘플 (최대 5개로 축소 - 속도 개선)
  const recentCommitMessages = commits.slice(0, 5).map(commit => 
    commit.commit?.message?.substring(0, 80) || commit.message?.substring(0, 80) || 'No message'
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
    prompt = `다음 GitHub 저장소를 분석하고 종합적인 코드 품질 평가를 제공해주세요. 모든 응답은 한글로 작성해주세요.

저장소: ${repoSummary.name}
설명: ${repoSummary.description}
언어: ${repoSummary.language}
스타: ${repoSummary.stars}
포크: ${repoSummary.forks}
총 커밋 수: ${repoSummary.totalCommits}
총 기여자 수: ${repoSummary.totalContributors}

최근 커밋 메시지:
${recentCommitMessages}

주요 기여자:
${topContributors.map(c => `- ${c.name}: ${c.commits}개 커밋 (${c.percentage}%)`).join('\n')}

다음 형식의 JSON 응답을 제공해주세요:
{
  "overallScore": number,
  "maintainability": "string (한글)",
  "complexity": "string (한글)",
  "bestPractices": "string (한글)",
  "improvements": ["string (한글)"],
  "recommendations": ["string (한글)"],
  "summary": "string (한글)"
}`;
  } else if (analysisType === 'ai-feedback') {
    prompt = `다음 GitHub 저장소를 분석하고 종합적인 AI 피드백을 제공해주세요. 모든 응답은 한글로 작성해주세요.

저장소: ${repoSummary.name}
설명: ${repoSummary.description}
언어: ${repoSummary.language}
스타: ${repoSummary.stars}
포크: ${repoSummary.forks}
이슈: ${repoSummary.issues}
생성일: ${repoSummary.createdAt}
최종 업데이트: ${repoSummary.updatedAt}
총 커밋 수: ${repoSummary.totalCommits}
총 기여자 수: ${repoSummary.totalContributors}

최근 커밋 메시지:
${recentCommitMessages}

주요 기여자:
${topContributors.map(c => `- ${c.name}: ${c.commits}개 커밋 (${c.percentage}%)`).join('\n')}

다음 내용을 포함한 종합적인 피드백을 제공해주세요:
1. 저장소에 대한 전체적인 피드백 (잘된 점, 개선할 점)
2. 긍정적인 측면 (잘 수행된 부분)
3. 개선이 필요한 영역 (구체적으로 작업이 필요한 부분)
4. 실행 가능한 권장사항 (개선을 위한 구체적인 단계)
5. 모범 사례 및 향상 방안에 대한 제안
6. 주요 인사이트 요약

다음 형식의 JSON 응답을 제공해주세요:
{
  "feedback": "string (저장소에 대한 종합적인 피드백, 한글)",
  "positiveAspects": ["string (긍정적인 측면 및 강점 목록, 한글)"],
  "areasForImprovement": ["string (개선이 필요한 영역 목록, 한글)"],
  "recommendations": ["string (실행 가능한 권장사항, 한글)"],
  "suggestions": ["string (향상 방안 및 모범 사례 제안, 한글)"],
  "summary": "string (주요 인사이트 및 요약, 한글)"
}`;
  } else {
    // 일반 분석
    prompt = `다음 GitHub 저장소를 분석하고 종합적인 인사이트를 JSON 형식으로 제공해주세요. 모든 응답은 한글로 작성해주세요.

저장소: ${repoSummary.name}
설명: ${repoSummary.description}
언어: ${repoSummary.language}
스타: ${repoSummary.stars}
포크: ${repoSummary.forks}
이슈: ${repoSummary.issues}
생성일: ${repoSummary.createdAt}
최종 업데이트: ${repoSummary.updatedAt}
총 커밋 수: ${repoSummary.totalCommits}
총 기여자 수: ${repoSummary.totalContributors}

최근 커밋 메시지:
${recentCommitMessages}

주요 기여자:
${topContributors.map(c => `- ${c.name}: ${c.commits}개 커밋 (${c.percentage}%)`).join('\n')}

다음 내용을 포함한 JSON 응답을 제공해주세요:
1. 코드 품질 분석 (점수 0-100, 수준, 설명)
2. 기여 패턴 분석 (분포, 지표)
3. 활동 수준 분석 (수준, 설명, 지표)
4. 권장사항 (우선순위, 제목, 설명이 포함된 권장사항 객체 배열)

다음 형식의 JSON 응답을 제공해주세요:
{
  "codeQuality": {
    "score": number (0-100),
    "level": "string (우수/양호/보통/미흡/매우미흡, 한글)",
    "description": "string (한글)",
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
    "level": "string (매우활발/활발/보통/낮음/비활성, 한글)",
    "description": "string (한글)",
    "metrics": {
      "recentCommits": number,
      "lastCommitDate": "string (ISO date)"
    }
  },
  "recommendations": [
    {
      "priority": "string (높음/보통/낮음, 한글)",
      "title": "string (한글)",
      "description": "string (한글)"
    }
  ]
}`;
  }

  // 직접 사용할 모델 지정 (가장 빠른 성공 가능성이 높은 모델 우선)
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  
  console.log(`📋 [Gemini API] 사용 모델 목록: ${models.join(', ')}`);

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
          timeout: 20000 // 20초 타임아웃 (속도 개선)
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
      
      // 즉시 중단해야 하는 에러: 인증/권한 문제
      const isAuthError = errorStatus === 401 || errorStatus === 403;
      if (isAuthError) {
        console.error('❌ [Gemini API] 인증 오류:', error.response?.data || error.message);
        if (error.response?.data?.error) {
          throw new Error(`Gemini API key authentication failed: ${error.response.data.error.message || error.message}`);
        }
        throw new Error(`Gemini API authentication failed: ${error.message}`);
      }
      
      // 다음 모델을 시도해야 하는 에러:
      // - 모델을 찾을 수 없음 (404, 400 with "not found")
      // - 일시적인 과부하 (503, 429)
      // - 서버 오류 (500, 502, 504) - 다른 모델이 작동할 수 있음
      const shouldTryNextModel = errorStatus === 404 || 
                                  errorStatus === 400 ||
                                  errorStatus === 429 || // Rate limit (다음 모델 시도)
                                  errorStatus === 503 || // Service unavailable (다른 모델 시도)
                                  errorStatus === 500 ||
                                  errorStatus === 502 ||
                                  errorStatus === 504 ||
                                  (errorMsg && errorMsg.toLowerCase().includes('not found')) ||
                                  (errorMsg && errorMsg.toLowerCase().includes('not supported')) ||
                                  (errorMsg && errorMsg.toLowerCase().includes('overloaded')) ||
                                  (errorMsg && errorMsg.toLowerCase().includes('unavailable'));
      
      if (shouldTryNextModel) {
        // 다음 모델 시도
        if (errorStatus === 503 || errorStatus === 429) {
          console.log(`⏳ [Gemini API] ${model} 모델이 과부하 상태입니다. 다음 모델을 시도합니다...`);
        }
        continue;
      }
      
      // 예상치 못한 에러는 중단
      console.error('❌ [Gemini API] 예상치 못한 오류:', error.response?.data || error.message);
      if (error.response?.data?.error) {
        throw new Error(`Gemini API error: ${error.response.data.error.message || error.message}`);
      }
      throw new Error(`Gemini API error: ${error.message}`);
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

