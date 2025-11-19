const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const path = require('path');

// AI 분석 함수 가져오기 (ai.js에서)
const { analyzeWithOpenAI, analyzeWithGemini } = require('./ai-helpers');

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
    
    // accessToken이 없으면 환경 변수의 GITHUB_TOKEN 사용
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

const buildContributorStats = (contributors) => {
  if (!Array.isArray(contributors)) {
    return [];
  }

  const sanitized = contributors.map((contributor, index) => {
    if (!contributor) return null;

    const totalCommits =
      contributor.total ??
      contributor.commits ??
      contributor.contributions ??
      0;
    const weeks = contributor.weeks || [];
    const totalAdditions = weeks.reduce((sum, week) => sum + (week.a || 0), 0);
    const totalDeletions = weeks.reduce((sum, week) => sum + (week.d || 0), 0);

    return {
      author: contributor.author?.login || contributor.login || `user-${index + 1}`,
      authorName: contributor.author?.login || contributor.login || `user-${index + 1}`,
      avatar: contributor.author?.avatar_url || contributor.avatar || contributor.avatar_url || null,
      commits: totalCommits,
      total: totalCommits,
      additions: totalAdditions,
      deletions: totalDeletions,
      weeks,
      percentage: 0,
    };
  }).filter(Boolean);

  const totalCommits = sanitized.reduce((sum, contributor) => sum + contributor.commits, 0);
  sanitized.forEach((contributor) => {
    contributor.percentage =
      totalCommits > 0
        ? Math.round((contributor.commits / totalCommits) * 100 * 100) / 100
        : 0;
  });

  sanitized.sort((a, b) => b.commits - a.commits);
  return sanitized;
};

// 실제 커밋 데이터에서 작성자 통계 계산
const calculateContributorsFromCommits = async (owner, repo, accessToken) => {
  try {
    console.log(`🔄 [커밋 기반 통계] ${owner}/${repo} 커밋 데이터에서 작성자 통계를 계산합니다`);
    
    const contributorMap = new Map();
    let page = 1;
    let hasMore = true;
    const maxPages = 50; // 최대 50페이지 (5000개 커밋)

    while (hasMore && page <= maxPages) {
      const commitsData = await callGitHubAPI(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=${page}`,
        accessToken
      );

      if (!Array.isArray(commitsData) || commitsData.length === 0) {
        hasMore = false;
        break;
      }

      for (const commit of commitsData) {
        // 작성자 정보 추출
        const author = commit.author || commit.commit?.author;
        const authorLogin = author?.login || null;
        const authorName = commit.commit?.author?.name || null;
        const avatarUrl = author?.avatar_url || null;

        // 로그인이 있으면 로그인을 우선 사용, 없으면 이름 사용
        const contributorKey = authorLogin || authorName;
        
        if (contributorKey) {
          if (!contributorMap.has(contributorKey)) {
            contributorMap.set(contributorKey, {
              author: authorLogin || authorName,
              authorName: authorLogin || authorName,
              login: authorLogin,
              avatar: avatarUrl,
              avatar_url: avatarUrl,
              commits: 0,
              total: 0,
              additions: 0,
              deletions: 0,
              weeks: []
            });
          }
          const contributor = contributorMap.get(contributorKey);
          contributor.commits++;
          contributor.total++;
        }
      }

      // 더 많은 커밋이 있는지 확인
      if (commitsData.length < 100) {
        hasMore = false;
      } else {
        page++;
      }
    }

    // Map을 배열로 변환하고 정렬
    const contributors = Array.from(contributorMap.values());
    const totalCommits = contributors.reduce((sum, c) => sum + c.commits, 0);
    
    contributors.forEach((contributor) => {
      contributor.percentage = totalCommits > 0
        ? Math.round((contributor.commits / totalCommits) * 100 * 100) / 100
        : 0;
    });

    contributors.sort((a, b) => b.commits - a.commits);

    console.log(`✅ [커밋 기반 통계] ${owner}/${repo} ${contributors.length}명의 기여자를 찾았습니다 (총 ${totalCommits}개 커밋)`);
    return contributors;
  } catch (error) {
    console.error(`❌ [커밋 기반 통계] ${owner}/${repo} 커밋 데이터에서 통계 계산 실패:`, error.message);
    return [];
  }
};

const fetchContributorDistribution = async (owner, repo, accessToken) => {
  // 1차 시도: stats/contributors (가장 정확)
  try {
    const statsData = await callGitHubAPI(
      `https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
      accessToken
    );
    if (Array.isArray(statsData) && statsData.length > 0) {
      console.log(`✅ [기여자 통계] ${owner}/${repo} stats/contributors API 성공 (${statsData.length}명)`);
      return buildContributorStats(statsData);
    }
    console.warn(`⚠️ [${owner}/${repo}] stats/contributors 응답이 비어 있습니다. 보조 엔드포인트를 시도합니다.`);
  } catch (error) {
    if (error.response?.status === 202) {
      console.warn(`⚠️ [${owner}/${repo}] stats/contributors가 계산 중입니다 (202). 커밋 데이터에서 직접 계산합니다.`);
    } else {
      console.warn(`⚠️ [${owner}/${repo}] stats/contributors 호출 실패, 보조 엔드포인트 사용:`, error.response?.status || error.message);
    }
  }

  // 2차 시도: 실제 커밋 데이터에서 작성자 통계 계산 (가장 정확함)
  const contributorsFromCommits = await calculateContributorsFromCommits(owner, repo, accessToken);
  if (contributorsFromCommits.length > 0) {
    console.log(`✅ [기여자 통계] ${owner}/${repo} 커밋 데이터에서 계산 성공 (${contributorsFromCommits.length}명)`);
    return contributorsFromCommits;
  }

  // 3차 시도: /contributors (빠르지만 정확도 낮음)
  try {
    const contributorsData = await callGitHubAPI(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`,
      accessToken
    );
    if (Array.isArray(contributorsData) && contributorsData.length > 0) {
      console.log(`✅ [기여자 통계] ${owner}/${repo} contributors API 성공 (${contributorsData.length}명)`);
      return buildContributorStats(contributorsData);
    }
    console.warn(`⚠️ [${owner}/${repo}] contributors 엔드포인트도 데이터가 비어 있습니다.`);
  } catch (error) {
    console.warn(`⚠️ [${owner}/${repo}] contributors 엔드포인트 호출 실패:`, error.response?.status || error.message);
  }

  console.error(`❌ [기여자 통계] ${owner}/${repo} 모든 방법 실패`);
  return [];
};

// 레포지토리 정보 가져오기 (공개)
router.get('/public/info/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;

    console.log(`🔄 [공개 레포지토리 정보] ${owner}/${repo} 정보를 가져옵니다`);

    const repoData = await callGitHubAPI(
      `https://api.github.com/repos/${owner}/${repo}`,
      null // 환경 변수의 GITHUB_TOKEN 자동 사용
    );

    console.log(`📥 [공개 레포지토리 정보] ${owner}/${repo} 정보를 성공적으로 가져왔습니다`);

    res.json({
      id: repoData.id,
      name: repoData.name,
      full_name: repoData.full_name,
      description: repoData.description,
      html_url: repoData.html_url,
      clone_url: repoData.clone_url,
      language: repoData.language,
      stargazers_count: repoData.stargazers_count,
      forks_count: repoData.forks_count,
      open_issues_count: repoData.open_issues_count,
      created_at: repoData.created_at,
      updated_at: repoData.updated_at,
      pushed_at: repoData.pushed_at,
      size: repoData.size,
      default_branch: repoData.default_branch,
      topics: repoData.topics || [],
      license: repoData.license?.name || null,
      owner: {
        login: repoData.owner.login,
        avatar_url: repoData.owner.avatar_url,
        html_url: repoData.owner.html_url
      }
    });
  } catch (error) {
    console.error('공개 레포지토리 정보 가져오기 오류:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'Repository not found',
        message: 'The repository you are trying to access does not exist or is private. Please check the repository URL and try again.'
      });
    } else if (error.response?.status === 403) {
      const errorData = error.response?.data || {};
      if (errorData.message && errorData.message.includes('API rate limit')) {
        return res.status(403).json({ 
          error: 'API rate limit exceeded',
          message: 'GitHub API rate limit has been exceeded. Please try again later.'
        });
      } else {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'This repository is private. Please log in to access private repositories.'
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred while fetching repository information.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 레포지토리 정보 가져오기 (인증 필요)
router.get('/info/:owner/:repo', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const accessToken = req.user.githubAccessToken;

    console.log(`🔄 [레포지토리 정보] ${owner}/${repo} 정보를 가져옵니다`);

    const repoData = await callGitHubAPI(
      `https://api.github.com/repos/${owner}/${repo}`,
      accessToken
    );

    console.log(`📥 [레포지토리 정보] ${owner}/${repo} 정보를 성공적으로 가져왔습니다`);

    res.json({
      id: repoData.id,
      name: repoData.name,
      full_name: repoData.full_name,
      description: repoData.description,
      html_url: repoData.html_url,
      clone_url: repoData.clone_url,
      language: repoData.language,
      stargazers_count: repoData.stargazers_count,
      forks_count: repoData.forks_count,
      open_issues_count: repoData.open_issues_count,
      created_at: repoData.created_at,
      updated_at: repoData.updated_at,
      pushed_at: repoData.pushed_at,
      size: repoData.size,
      default_branch: repoData.default_branch,
      topics: repoData.topics || [],
      license: repoData.license?.name || null,
      owner: {
        login: repoData.owner.login,
        avatar_url: repoData.owner.avatar_url,
        html_url: repoData.owner.html_url
      }
    });
  } catch (error) {
    console.error('레포지토리 정보 가져오기 오류:', error);
    
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || '';
      if (errorMessage.includes('OAuth App access restrictions')) {
        return res.status(403).json({ 
          error: 'Organization access restriction',
          message: '이 저장소는 조직의 OAuth App 접근 제한으로 인해 접근할 수 없습니다. 조직 관리자에게 GitLog 앱 승인을 요청해주세요.',
          details: errorMessage
        });
      } else if (errorMessage.includes('API rate limit')) {
        return res.status(403).json({ 
          error: 'API rate limit exceeded',
          message: 'GitHub API rate limit has been exceeded. Please try again later.'
        });
      }
      return res.status(403).json({ 
        error: 'Access forbidden',
        message: '이 저장소에 접근할 권한이 없습니다.'
      });
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'Repository not found',
        message: 'The repository you are trying to access does not exist or is not accessible.'
      });
    } else if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access private repositories.'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred while fetching repository information.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 공개 레포지토리 커밋 통계 가져오기
router.get('/public/commits/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;

    console.log(`🔄 [공개 커밋 통계] ${owner}/${repo} 커밋 통계를 가져옵니다`);

    const contributors = await fetchContributorDistribution(owner, repo, null);
    console.log(`📥 [공개 커밋 통계] ${owner}/${repo} 최종 정리된 기여자 수: ${contributors.length}명`);
    res.json(contributors);
  } catch (error) {
    console.error('공개 커밋 통계 가져오기 오류:', error);
    
    if (error.response?.status === 202) {
      // GitHub가 통계를 계산 중인 경우
      return res.status(202).json({ error: '커밋 통계를 계산 중입니다. 잠시 후 다시 시도해주세요.' });
    } else if (error.response?.status === 403) {
      return res.status(403).json({ error: 'API 요청 한도 초과' });
    }
    
    res.status(500).json({ error: '커밋 통계를 가져오는 중 오류가 발생했습니다' });
  }
});

// 레포지토리 커밋 통계 가져오기
router.get('/commits/:owner/:repo', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const accessToken = req.user.githubAccessToken;

    console.log(`🔄 [커밋 통계] ${owner}/${repo} 커밋 통계를 가져옵니다`);

    const contributors = await fetchContributorDistribution(owner, repo, accessToken);
    console.log(`📥 [커밋 통계] ${owner}/${repo} 최종 정리된 기여자 수: ${contributors.length}명`);
    res.json(contributors);
  } catch (error) {
    console.error('커밋 통계 가져오기 오류:', error);
    
    if (error.response?.status === 202) {
      // GitHub가 통계를 계산 중인 경우
      return res.status(202).json({ error: '커밋 통계를 계산 중입니다. 잠시 후 다시 시도해주세요.' });
    } else if (error.response?.status === 403) {
      return res.status(403).json({ error: 'API 요청 한도 초과' });
    }
    
    res.status(500).json({ error: '커밋 통계를 가져오는 중 오류가 발생했습니다' });
  }
});

// 공개 최근 커밋 가져오기
router.get('/public/recent-commits/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { per_page = 100, page = 1 } = req.query;

    console.log(`🔄 [공개 최근 커밋] ${owner}/${repo} 최근 커밋을 가져옵니다`);

    const commitsData = await callGitHubAPI(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${per_page}&page=${page}`,
      null // 환경 변수의 GITHUB_TOKEN 자동 사용
    );

    console.log(`📥 [공개 최근 커밋] ${owner}/${repo} 최근 커밋을 성공적으로 가져왔습니다: ${commitsData.length}개`);

    res.json(commitsData);
  } catch (error) {
    console.error('공개 최근 커밋 가져오기 오류:', error);
    
    if (error.response?.status === 403) {
      return res.status(403).json({ error: 'API 요청 한도 초과' });
    }
    
    res.status(500).json({ error: '최근 커밋을 가져오는 중 오류가 발생했습니다' });
  }
});

// 최근 커밋 가져오기
router.get('/recent-commits/:owner/:repo', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { per_page = 100, page = 1 } = req.query;
    const accessToken = req.user.githubAccessToken;

    console.log(`🔄 [최근 커밋] ${owner}/${repo} 최근 커밋을 가져옵니다`);

    const commitsData = await callGitHubAPI(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${per_page}&page=${page}`,
      accessToken
    );

    console.log(`📥 [최근 커밋] ${owner}/${repo} 최근 커밋을 성공적으로 가져왔습니다: ${commitsData.length}개`);

    res.json(commitsData);
  } catch (error) {
    console.error('최근 커밋 가져오기 오류:', error);
    
    if (error.response?.status === 403) {
      return res.status(403).json({ error: 'API 요청 한도 초과' });
    }
    
    res.status(500).json({ error: '최근 커밋을 가져오는 중 오류가 발생했습니다' });
  }
});

// 공개 모든 브랜치의 커밋 가져오기
router.get('/public/all-commits/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;

    console.log(`🔄 [공개 모든 브랜치 커밋] ${owner}/${repo} 모든 브랜치 커밋을 분석합니다`);

    // 1. 모든 브랜치 가져오기
    const branchesData = await callGitHubAPI(
      `https://api.github.com/repos/${owner}/${repo}/branches`,
      null // 환경 변수의 GITHUB_TOKEN 자동 사용
    );

    console.log(`📥 [브랜치 목록] ${branchesData.length}개 브랜치를 찾았습니다`);

    const branchStats = [];
    const allCommits = [];
    const commitSet = new Set(); // 중복 커밋 제거용
    let totalCommitsAcrossBranches = 0;
    const maxCommits = 1000; // 분석 제한 증가
    const maxBranches = 20; // 브랜치 수 제한 증가
    let analysisLimit = null;

    // 2. 각 브랜치별로 커밋 가져오기 (제한된 수만)
    for (let i = 0; i < Math.min(branchesData.length, maxBranches); i++) {
      const branch = branchesData[i];
      
      try {
        // 타임아웃 설정을 위한 Promise.race 사용
        const commitsPromise = callGitHubAPI(
          `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch.name}&per_page=50`, // 페이지 크기 줄임
          null // 환경 변수의 GITHUB_TOKEN 자동 사용
        );

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('브랜치 커밋 가져오기 타임아웃')), 10000) // 10초 타임아웃
        );

        const commitsData = await Promise.race([commitsPromise, timeoutPromise]);

        const branchCommitCount = commitsData.length;
        totalCommitsAcrossBranches += branchCommitCount;

        // 브랜치 보호 여부 확인 (타임아웃 포함)
        let branchProtected = false;
        try {
          const protectionPromise = callGitHubAPI(
            `https://api.github.com/repos/${owner}/${repo}/branches/${branch.name}/protection`,
            null // 환경 변수의 GITHUB_TOKEN 자동 사용
          );
          const protectionTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('보호 상태 확인 타임아웃')), 5000)
          );
          
          await Promise.race([protectionPromise, protectionTimeout]);
          branchProtected = true;
        } catch (protectionError) {
          // 보호되지 않은 브랜치 또는 권한 없음 - 정상적인 상황
          if (protectionError.response?.status === 404) {
            // 404는 브랜치가 보호되지 않았거나 API 권한이 없는 경우
            console.log(`브랜치 ${branch.name}: 보호 설정 없음 (정상)`);
          } else {
            console.log(`브랜치 ${branch.name} 보호 상태 확인 실패:`, protectionError.message);
          }
        }

        branchStats.push({
          branch: branch.name,
          commitCount: branchCommitCount,
          branchProtected: branchProtected
        });

        // 중복 제거하면서 커밋 추가 (메모리 효율적으로)
        for (const commit of commitsData) {
          if (!commitSet.has(commit.sha)) {
            commitSet.add(commit.sha);
            // 필요한 정보만 저장하여 메모리 사용량 줄임
            allCommits.push({
              sha: commit.sha,
              commit: {
                author: commit.commit?.author,
                committer: commit.commit?.committer,
                message: commit.commit?.message?.substring(0, 200) // 메시지 길이 제한
              },
              author: commit.author,
              branch: branch.name
            });
          }
        }

        // 커밋 수 제한 확인
        if (allCommits.length >= maxCommits) {
          analysisLimit = {
            isLimited: true,
            maxCommits: maxCommits,
            originalCount: totalCommitsAcrossBranches
          };
          console.log(`⚠️ [커밋 제한] 최대 ${maxCommits}개 커밋에 도달하여 분석을 중단합니다`);
          break;
        }

        // 메모리 사용량 체크
        if (process.memoryUsage().heapUsed > 100 * 1024 * 1024) { // 100MB 이상
          console.log(`⚠️ [메모리 제한] 메모리 사용량이 높아 분석을 중단합니다`);
          analysisLimit = {
            isLimited: true,
            maxCommits: allCommits.length,
            originalCount: totalCommitsAcrossBranches,
            reason: 'memory_limit'
          };
          break;
        }

      } catch (branchError) {
        console.warn(`브랜치 ${branch.name} 커밋 가져오기 실패:`, branchError.message);
        // 개별 브랜치 실패는 전체를 중단시키지 않음
        continue;
      }
    }

    // 브랜치별 커밋 수로 정렬
    branchStats.sort((a, b) => b.commitCount - a.commitCount);

    console.log(`📊 [분석 완료] 총 ${allCommits.length}개 고유 커밋, ${totalCommitsAcrossBranches}개 브랜치별 커밋, ${branchStats.length}개 브랜치에서 분석`);

    res.json({
      commits: allCommits,
      branchStats: branchStats,
      totalCommits: allCommits.length,
      totalCommitsAcrossBranches: totalCommitsAcrossBranches,
      totalBranches: branchesData.length,
      processedBranches: branchStats.length,
      analysisLimit: analysisLimit
    });

  } catch (error) {
    console.error('공개 모든 브랜치 커밋 가져오기 오류:', error);
    
    if (error.response?.status === 403) {
      return res.status(403).json({ error: 'API 요청 한도 초과' });
    }
    
    // 더 구체적인 오류 메시지 제공
    let errorMessage = '모든 브랜치 커밋을 가져오는 중 오류가 발생했습니다';
    if (error.message.includes('timeout') || error.message.includes('타임아웃')) {
      errorMessage = '요청 시간이 초과되었습니다. 레포지토리가 너무 크거나 네트워크가 느릴 수 있습니다.';
    } else if (error.message.includes('memory') || error.message.includes('메모리')) {
      errorMessage = '메모리 부족으로 인해 분석을 완료할 수 없습니다.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message,
      debug: {
        type: 'all_commits_error',
        message: error.message
      }
    });
  }
});

// 모든 브랜치의 커밋 가져오기
router.get('/all-commits/:owner/:repo', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const accessToken = req.user.githubAccessToken;

    console.log(`🔄 [모든 브랜치 커밋] ${owner}/${repo} 모든 브랜치 커밋을 분석합니다`);

    // 1. 모든 브랜치 가져오기
    const branchesData = await callGitHubAPI(
      `https://api.github.com/repos/${owner}/${repo}/branches`,
      accessToken
    );

    console.log(`📥 [브랜치 목록] ${branchesData.length}개 브랜치를 찾았습니다`);

    const branchStats = [];
    const allCommits = [];
    const commitSet = new Set(); // 중복 커밋 제거용
    let totalCommitsAcrossBranches = 0;
    const maxCommits = 1000; // 분석 제한 증가
    const maxBranches = 20; // 브랜치 수 제한 증가
    let analysisLimit = null;

    // 2. 각 브랜치별로 커밋 가져오기 (제한된 수만)
    for (let i = 0; i < Math.min(branchesData.length, maxBranches); i++) {
      const branch = branchesData[i];
      
      try {
        // 타임아웃 설정을 위한 Promise.race 사용
        const commitsPromise = callGitHubAPI(
          `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch.name}&per_page=50`, // 페이지 크기 줄임
          accessToken
        );

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('브랜치 커밋 가져오기 타임아웃')), 10000) // 10초 타임아웃
        );

        const commitsData = await Promise.race([commitsPromise, timeoutPromise]);

        const branchCommitCount = commitsData.length;
        totalCommitsAcrossBranches += branchCommitCount;

        // 브랜치 보호 여부 확인 (타임아웃 포함)
        let branchProtected = false;
        try {
          const protectionPromise = callGitHubAPI(
            `https://api.github.com/repos/${owner}/${repo}/branches/${branch.name}/protection`,
            accessToken
          );
          const protectionTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('보호 상태 확인 타임아웃')), 5000)
          );
          
          await Promise.race([protectionPromise, protectionTimeout]);
          branchProtected = true;
        } catch (protectionError) {
          // 보호되지 않은 브랜치 또는 권한 없음 - 정상적인 상황
          if (protectionError.response?.status === 404) {
            // 404는 브랜치가 보호되지 않았거나 API 권한이 없는 경우
            console.log(`브랜치 ${branch.name}: 보호 설정 없음 (정상)`);
          } else {
            console.log(`브랜치 ${branch.name} 보호 상태 확인 실패:`, protectionError.message);
          }
        }

        branchStats.push({
          branch: branch.name,
          commitCount: branchCommitCount,
          branchProtected: branchProtected
        });

        // 중복 제거하면서 커밋 추가 (메모리 효율적으로)
        for (const commit of commitsData) {
          if (!commitSet.has(commit.sha)) {
            commitSet.add(commit.sha);
            // 필요한 정보만 저장하여 메모리 사용량 줄임
            allCommits.push({
              sha: commit.sha,
              commit: {
                author: commit.commit?.author,
                committer: commit.commit?.committer,
                message: commit.commit?.message?.substring(0, 200) // 메시지 길이 제한
              },
              author: commit.author,
              branch: branch.name
            });
          }
        }

        // 커밋 수 제한 확인
        if (allCommits.length >= maxCommits) {
          analysisLimit = {
            isLimited: true,
            maxCommits: maxCommits,
            originalCount: totalCommitsAcrossBranches
          };
          console.log(`⚠️ [커밋 제한] 최대 ${maxCommits}개 커밋에 도달하여 분석을 중단합니다`);
          break;
        }

        // 메모리 사용량 체크
        if (process.memoryUsage().heapUsed > 100 * 1024 * 1024) { // 100MB 이상
          console.log(`⚠️ [메모리 제한] 메모리 사용량이 높아 분석을 중단합니다`);
          analysisLimit = {
            isLimited: true,
            maxCommits: allCommits.length,
            originalCount: totalCommitsAcrossBranches,
            reason: 'memory_limit'
          };
          break;
        }

      } catch (branchError) {
        console.warn(`브랜치 ${branch.name} 커밋 가져오기 실패:`, branchError.message);
        // 개별 브랜치 실패는 전체를 중단시키지 않음
        continue;
      }
    }

    // 브랜치별 커밋 수로 정렬
    branchStats.sort((a, b) => b.commitCount - a.commitCount);

    console.log(`📊 [분석 완료] 총 ${allCommits.length}개 고유 커밋, ${totalCommitsAcrossBranches}개 브랜치별 커밋, ${branchStats.length}개 브랜치에서 분석`);

    res.json({
      commits: allCommits,
      branchStats: branchStats,
      totalCommits: allCommits.length,
      totalCommitsAcrossBranches: totalCommitsAcrossBranches,
      totalBranches: branchesData.length,
      processedBranches: branchStats.length,
      analysisLimit: analysisLimit
    });

  } catch (error) {
    console.error('모든 브랜치 커밋 가져오기 오류:', error);
    
    if (error.response?.status === 403) {
      return res.status(403).json({ error: 'API 요청 한도 초과' });
    }
    
    // 더 구체적인 오류 메시지 제공
    let errorMessage = '모든 브랜치 커밋을 가져오는 중 오류가 발생했습니다';
    if (error.message.includes('timeout') || error.message.includes('타임아웃')) {
      errorMessage = '요청 시간이 초과되었습니다. 레포지토리가 너무 크거나 네트워크가 느릴 수 있습니다.';
    } else if (error.message.includes('memory') || error.message.includes('메모리')) {
      errorMessage = '메모리 부족으로 인해 분석을 완료할 수 없습니다.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message,
      debug: {
        type: 'all_commits_error',
        message: error.message
      }
    });
  }
});

// 공개 레포지토리 분석 수행 (AI 기반)
router.post('/public/analyze', async (req, res) => {
  try {
    const { owner, repo, commits, contributors } = req.body;

    console.log(`🔄 [공개 레포지토리 AI 분석] ${owner}/${repo} 분석을 시작합니다`);
    console.log('🔍 [공개 AI 분석 API] 요청 데이터 확인:', {
      commits: commits ? commits.length : 0,
      contributors: contributors ? contributors.length : 0,
      contributorsData: contributors
    });

    if (!commits || commits.length === 0) {
      return res.status(400).json({ error: '분석할 커밋 데이터가 없습니다' });
    }

    // AI API 키 확인
    const useAI = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    const aiModel = process.env.OPENAI_API_KEY ? 'openai' : 'gemini';
    
    if (!useAI) {
      console.warn('⚠️ [AI 분석] API 키가 설정되지 않았습니다. 기본 분석으로 대체합니다.');
      // AI API 키가 없으면 기본 분석 로직 사용
      return await performBasicAnalysis(req, res, owner, repo, commits, contributors, false);
    }

    // 메모리 사용량 체크
    const memUsage = process.memoryUsage();
    console.log(`📊 [메모리 사용량] 분석 시작 시: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);

    // 레포지토리 정보 가져오기 (AI 분석에 필요한 정보 포함)
    let repoData;
    try {
      repoData = await callGitHubAPI(
        `https://api.github.com/repos/${owner}/${repo}`,
        null // 공개 API는 토큰 없이도 가능
      );
      console.log(`✅ [레포지토리 정보] ${owner}/${repo} 정보를 가져왔습니다`);
    } catch (error) {
      console.warn(`⚠️ [레포지토리 정보] ${owner}/${repo} 정보를 가져오지 못했습니다. 기본 정보로 대체합니다.`, error.message);
      // 레포지토리 정보를 가져오지 못하면 기본 정보 사용
      repoData = {
        owner: owner,
        repo: repo,
        full_name: `${owner}/${repo}`,
        description: '',
        language: null,
        stargazers_count: 0,
        forks_count: 0,
        open_issues_count: 0,
        created_at: null,
        updated_at: null
      };
    }

    // 타임아웃 설정 (60초 - AI API 호출 시간 고려)
    const analysisPromise = new Promise(async (resolve, reject) => {
      try {
        console.log(`🤖 [AI 분석] ${aiModel} 모델을 사용하여 분석을 시작합니다...`);
        
        let aiAnalysis;
        if (aiModel === 'openai') {
          aiAnalysis = await analyzeWithOpenAI(repoData, commits, contributors, 'general', []);
        } else {
          aiAnalysis = await analyzeWithGemini(repoData, commits, contributors, 'general', []);
        }

        console.log(`✅ [AI 분석] ${aiModel} 분석 완료`);

        // AI 분석 결과를 기존 형식으로 변환
        let analysis = {};
        
        if (aiAnalysis.codeQuality) {
          // AI가 전체 구조를 반환한 경우
          analysis = aiAnalysis;
        } else {
          // AI 분석 결과가 다른 형식인 경우, 기본 분석으로 병합
          const basicCodeQuality = analyzeCodeQuality(commits, contributors);
          const basicContributionPattern = analyzeContributionPattern(contributors);
          const basicActivityLevel = analyzeActivityLevel(commits);
          const basicRecommendations = generateRecommendations(basicCodeQuality, basicContributionPattern, basicActivityLevel);
          
          // AI 분석 결과와 기본 분석 결과 병합
          analysis = {
            codeQuality: aiAnalysis.codeQuality || basicCodeQuality,
            contributionPattern: aiAnalysis.contributionPattern || basicContributionPattern,
            activityLevel: aiAnalysis.activityLevel || basicActivityLevel,
            recommendations: aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 
              ? aiAnalysis.recommendations 
              : basicRecommendations,
            aiInsights: aiAnalysis.overview || aiAnalysis.summary || aiAnalysis.feedback || null
          };
        }

        resolve(analysis);
      } catch (error) {
        console.error('AI 분석 오류:', error);
        // AI 분석 실패 시 기본 분석으로 폴백
        console.log('⚠️ [AI 분석 실패] 기본 분석으로 대체합니다.');
        const basicCodeQuality = analyzeCodeQuality(commits, contributors);
        const basicContributionPattern = analyzeContributionPattern(contributors);
        const basicActivityLevel = analyzeActivityLevel(commits);
        const basicRecommendations = generateRecommendations(basicCodeQuality, basicContributionPattern, basicActivityLevel);
        
        resolve({
          codeQuality: basicCodeQuality,
          contributionPattern: basicContributionPattern,
          activityLevel: basicActivityLevel,
          recommendations: basicRecommendations,
          aiError: error.message
        });
      }
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('분석 시간 초과')), 60000)
    );

    const analysis = await Promise.race([analysisPromise, timeoutPromise]);

    console.log(`✅ [공개 레포지토리 AI 분석] ${owner}/${repo} 분석이 완료되었습니다`);

    res.json({ analysis });
  } catch (error) {
    console.error('공개 레포지토리 AI 분석 오류:', error);
    
    let errorMessage = '레포지토리 분석 중 오류가 발생했습니다';
    if (error.message.includes('시간 초과') || error.message.includes('timeout')) {
      errorMessage = '분석 시간이 초과되었습니다. 레포지토리가 너무 크거나 복잡할 수 있습니다.';
    } else if (error.message.includes('memory') || error.message.includes('메모리')) {
      errorMessage = '메모리 부족으로 인해 분석을 완료할 수 없습니다.';
    } else if (error.message.includes('API key')) {
      errorMessage = 'AI API 키가 설정되지 않았거나 유효하지 않습니다. 환경 변수를 확인해주세요.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message,
      debug: {
        type: 'ai_analysis_error',
        message: error.message
      }
    });
  }
});

// 레포지토리 분석 수행 (AI 기반)
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { owner, repo, commits, contributors } = req.body;

    console.log(`🔄 [레포지토리 AI 분석] ${owner}/${repo} 분석을 시작합니다`);

    if (!commits || commits.length === 0) {
      return res.status(400).json({ error: '분석할 커밋 데이터가 없습니다' });
    }

    // AI API 키 확인
    const useAI = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    const aiModel = process.env.OPENAI_API_KEY ? 'openai' : 'gemini';
    
    if (!useAI) {
      console.warn('⚠️ [AI 분석] API 키가 설정되지 않았습니다. 기본 분석으로 대체합니다.');
      // AI API 키가 없으면 기본 분석 로직 사용
      return await performBasicAnalysis(req, res, owner, repo, commits, contributors, true);
    }

    // 메모리 사용량 체크
    const memUsage = process.memoryUsage();
    console.log(`📊 [메모리 사용량] 분석 시작 시: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);

    // 레포지토리 정보 가져오기 (AI 분석에 필요한 정보 포함)
    const accessToken = req.user.githubAccessToken;
    let repoData;
    try {
      repoData = await callGitHubAPI(
        `https://api.github.com/repos/${owner}/${repo}`,
        accessToken
      );
      console.log(`✅ [레포지토리 정보] ${owner}/${repo} 정보를 가져왔습니다`);
    } catch (error) {
      console.warn(`⚠️ [레포지토리 정보] ${owner}/${repo} 정보를 가져오지 못했습니다. 기본 정보로 대체합니다.`, error.message);
      // 레포지토리 정보를 가져오지 못하면 기본 정보 사용
      repoData = {
        owner: owner,
        repo: repo,
        full_name: `${owner}/${repo}`,
        description: '',
        language: null,
        stargazers_count: 0,
        forks_count: 0,
        open_issues_count: 0,
        created_at: null,
        updated_at: null
      };
    }

    // 타임아웃 설정 (60초 - AI API 호출 시간 고려)
    const analysisPromise = new Promise(async (resolve, reject) => {
      try {
        console.log(`🤖 [AI 분석] ${aiModel} 모델을 사용하여 분석을 시작합니다...`);
        
        let aiAnalysis;
        if (aiModel === 'openai') {
          aiAnalysis = await analyzeWithOpenAI(repoData, commits, contributors, 'general', []);
        } else {
          aiAnalysis = await analyzeWithGemini(repoData, commits, contributors, 'general', []);
        }

        console.log(`✅ [AI 분석] ${aiModel} 분석 완료`);

        // AI 분석 결과를 기존 형식으로 변환
        let analysis = {};
        
        if (aiAnalysis.codeQuality) {
          // AI가 전체 구조를 반환한 경우
          analysis = aiAnalysis;
        } else {
          // AI 분석 결과가 다른 형식인 경우, 기본 분석으로 병합
          const basicCodeQuality = analyzeCodeQuality(commits, contributors);
          const basicContributionPattern = analyzeContributionPattern(contributors);
          const basicActivityLevel = analyzeActivityLevel(commits);
          const basicRecommendations = generateRecommendations(basicCodeQuality, basicContributionPattern, basicActivityLevel);
          
          // AI 분석 결과와 기본 분석 결과 병합
          analysis = {
            codeQuality: aiAnalysis.codeQuality || basicCodeQuality,
            contributionPattern: aiAnalysis.contributionPattern || basicContributionPattern,
            activityLevel: aiAnalysis.activityLevel || basicActivityLevel,
            recommendations: aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 
              ? aiAnalysis.recommendations 
              : basicRecommendations,
            aiInsights: aiAnalysis.overview || aiAnalysis.summary || aiAnalysis.feedback || null
          };
        }

        resolve(analysis);
      } catch (error) {
        console.error('AI 분석 오류:', error);
        // AI 분석 실패 시 기본 분석으로 폴백
        console.log('⚠️ [AI 분석 실패] 기본 분석으로 대체합니다.');
        const basicCodeQuality = analyzeCodeQuality(commits, contributors);
        const basicContributionPattern = analyzeContributionPattern(contributors);
        const basicActivityLevel = analyzeActivityLevel(commits);
        const basicRecommendations = generateRecommendations(basicCodeQuality, basicContributionPattern, basicActivityLevel);
        
        resolve({
          codeQuality: basicCodeQuality,
          contributionPattern: basicContributionPattern,
          activityLevel: basicActivityLevel,
          recommendations: basicRecommendations,
          aiError: error.message
        });
      }
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('분석 시간 초과')), 60000)
    );

    const analysis = await Promise.race([analysisPromise, timeoutPromise]);

    console.log(`✅ [레포지토리 AI 분석] ${owner}/${repo} 분석이 완료되었습니다`);

    res.json({ analysis });
  } catch (error) {
    console.error('레포지토리 AI 분석 오류:', error);
    
    let errorMessage = '레포지토리 분석 중 오류가 발생했습니다';
    if (error.message.includes('시간 초과') || error.message.includes('timeout')) {
      errorMessage = '분석 시간이 초과되었습니다. 레포지토리가 너무 크거나 복잡할 수 있습니다.';
    } else if (error.message.includes('memory') || error.message.includes('메모리')) {
      errorMessage = '메모리 부족으로 인해 분석을 완료할 수 없습니다.';
    } else if (error.message.includes('API key')) {
      errorMessage = 'AI API 키가 설정되지 않았거나 유효하지 않습니다. 환경 변수를 확인해주세요.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message,
      debug: {
        type: 'ai_analysis_error',
        message: error.message
      }
    });
  }
});

// 기본 분석 수행 함수 (AI API 키가 없을 때 사용)
async function performBasicAnalysis(req, res, owner, repo, commits, contributors, authenticated) {
  try {
    console.log(`🔄 [기본 분석] ${owner}/${repo} 기본 분석을 시작합니다`);
    
    const memUsage = process.memoryUsage();
    console.log(`📊 [메모리 사용량] 분석 시작 시: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);

    // 타임아웃 설정 (30초)
    const analysisPromise = new Promise(async (resolve, reject) => {
      try {
        // 1. 코드 품질 분석
        const codeQuality = analyzeCodeQuality(commits, contributors);
        
        // 2. 기여 패턴 분석
        const contributionPattern = analyzeContributionPattern(contributors);
        
        // 3. 활동 수준 분석
        const activityLevel = analyzeActivityLevel(commits);
        
        // 4. 추천사항 생성
        const recommendations = generateRecommendations(codeQuality, contributionPattern, activityLevel);

        const analysis = {
          codeQuality,
          contributionPattern,
          activityLevel,
          recommendations
        };

        resolve(analysis);
      } catch (error) {
        reject(error);
      }
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('분석 시간 초과')), 30000)
    );

    const analysis = await Promise.race([analysisPromise, timeoutPromise]);

    console.log(`✅ [기본 분석] ${owner}/${repo} 분석이 완료되었습니다`);

    res.json({ analysis });
  } catch (error) {
    console.error('기본 분석 오류:', error);
    
    let errorMessage = '레포지토리 분석 중 오류가 발생했습니다';
    if (error.message.includes('시간 초과') || error.message.includes('timeout')) {
      errorMessage = '분석 시간이 초과되었습니다. 레포지토리가 너무 크거나 복잡할 수 있습니다.';
    } else if (error.message.includes('memory') || error.message.includes('메모리')) {
      errorMessage = '메모리 부족으로 인해 분석을 완료할 수 없습니다.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message,
      debug: {
        type: 'basic_analysis_error',
        message: error.message
      }
    });
  }
}

// 코드 품질 분석 함수
function analyzeCodeQuality(commits, contributors) {
  const totalCommits = commits.length;
  const contributorsCount = contributors ? contributors.length : 0;
  
  // 기본 점수 계산
  let score = 0;
  
  // 커밋 수 기반 점수 (30점 만점)
  if (totalCommits >= 100) score += 30;
  else if (totalCommits >= 50) score += 25;
  else if (totalCommits >= 20) score += 20;
  else if (totalCommits >= 10) score += 15;
  else if (totalCommits >= 5) score += 10;
  else score += 5;
  
  // 기여자 수 기반 점수 (20점 만점)
  if (contributorsCount >= 5) score += 20;
  else if (contributorsCount >= 3) score += 15;
  else if (contributorsCount >= 2) score += 10;
  else if (contributorsCount >= 1) score += 5;
  
  // 커밋 다양성 점수 (25점 만점)
  const uniqueAuthors = new Set(commits.map(commit => commit.commit?.author?.name || commit.author?.login)).size;
  const diversityScore = Math.min(25, uniqueAuthors * 5);
  score += diversityScore;
  
  // 최근 활동 점수 (25점 만점)
  const now = new Date();
  const recentCommits = commits.filter(commit => {
    const commitDate = new Date(commit.commit?.author?.date || commit.commit?.committer?.date);
    const daysDiff = (now - commitDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30; // 최근 30일
  }).length;
  
  const activityScore = Math.min(25, (recentCommits / totalCommits) * 25);
  score += activityScore;
  
  // 레벨 결정
  let level;
  if (score >= 80) level = 'Excellent';
  else if (score >= 60) level = 'Good';
  else if (score >= 40) level = 'Fair';
  else if (score >= 20) level = 'Poor';
  else level = 'Very Poor';
  
  return {
    score: Math.min(100, Math.max(0, score)),
    level: level,
    metrics: {
      totalCommits,
      contributorsCount,
      uniqueAuthors,
      recentCommits
    }
  };
}

// 기여 패턴 분석 함수
function analyzeContributionPattern(contributors) {
  console.log('🔍 [analyzeContributionPattern] 입력 데이터:', {
    contributors: contributors,
    contributorsLength: contributors ? contributors.length : 0,
    contributorsType: typeof contributors
  });
  
  if (!contributors || contributors.length === 0) {
    console.log('⚠️ [analyzeContributionPattern] 기여자 데이터가 없습니다');
    return {
      distribution: [],
      metrics: {
        totalContributors: 0,
        topContributor: null,
        distribution: []
      }
    };
  }
  
  // 기여자별 통계 계산
  const distribution = contributors.map(contributor => {
    const weeks = contributor.weeks || [];
    const totalAdditions = weeks.reduce((sum, week) => sum + (week.a || 0), 0);
    const totalDeletions = weeks.reduce((sum, week) => sum + (week.d || 0), 0);
    
    return {
      author: contributor.author,
      authorName: contributor.authorName,
      avatar: contributor.avatar,
      commits: contributor.commits,
      percentage: contributor.percentage,
      additions: totalAdditions,
      deletions: totalDeletions,
      weeks: weeks
    };
  });
  
  return {
    distribution: distribution,
    metrics: {
      totalContributors: contributors.length,
      topContributor: distribution[0] || null,
      distribution: distribution
    }
  };
}

// 활동 수준 분석 함수
function analyzeActivityLevel(commits) {
  const now = new Date();
  const recentCommits = commits.filter(commit => {
    const commitDate = new Date(commit.commit?.author?.date || commit.commit?.committer?.date);
    const daysDiff = (now - commitDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30; // 최근 30일
  });
  
  const lastCommit = commits[0];
  const lastCommitDate = lastCommit ? new Date(lastCommit.commit?.author?.date || lastCommit.commit?.committer?.date) : null;
  
  let level;
  let description;
  
  if (recentCommits.length >= 20) {
    level = 'Very Active';
    description = 'analysis.activityLevel.veryActiveDesc';
  } else if (recentCommits.length >= 10) {
    level = 'Active';
    description = 'analysis.activityLevel.activeDesc';
  } else if (recentCommits.length >= 5) {
    level = 'Moderate';
    description = 'analysis.activityLevel.moderateDesc';
  } else if (recentCommits.length >= 1) {
    level = 'Low';
    description = 'analysis.activityLevel.lowDesc';
  } else {
    level = 'Inactive';
    description = 'analysis.activityLevel.inactiveDesc';
  }
  
  return {
    level: level,
    description: description,
    metrics: {
      recentCommits: recentCommits.length,
      lastCommitDate: lastCommitDate ? lastCommitDate.toISOString() : null
    }
  };
}

// 추천사항 생성 함수
function generateRecommendations(codeQuality, contributionPattern, activityLevel) {
  const recommendations = [];
  
  // 코드 품질 기반 추천
  if (codeQuality.score < 40) {
    recommendations.push({
      priority: 'High',
      title: 'analysis.githubFeatures.improveCodeQuality',
      description: 'analysis.githubFeatures.improveCodeQualityDesc'
    });
  }
  
  // 기여 패턴 기반 추천
  if (contributionPattern.metrics.totalContributors < 2) {
    recommendations.push({
      priority: 'Medium',
      title: 'analysis.githubFeatures.expandContributors',
      description: 'analysis.githubFeatures.encourageParticipation'
    });
  }
  
  // 활동 수준 기반 추천
  if (activityLevel.level === 'Inactive' || activityLevel.level === 'Low') {
    recommendations.push({
      priority: 'High',
      title: 'analysis.githubFeatures.resumeDevelopment',
      description: 'analysis.githubFeatures.resumeDevelopmentDesc'
    });
  }
  
  // 기여도 불균형 체크
  const topContributor = contributionPattern.metrics.topContributor;
  if (topContributor && topContributor.percentage > 80) {
    recommendations.push({
      priority: 'Medium',
      title: 'analysis.githubFeatures.distributeContributions',
      description: 'analysis.githubFeatures.avoidSingleContributor'
    });
  }
  
  return recommendations;
}

module.exports = router;
