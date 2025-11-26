const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

// GitHub 저장소 목록 가져오기
router.get('/repos', async (req, res) => {
  try {
    console.log('🔄 [GitHub API] 사용자 저장소 목록을 요청받았습니다');

    // Authorization 헤더에서 JWT 토큰 추출
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (!jwtToken) {
      console.error('❌ [인증 실패] 요청에 JWT 토큰이 포함되지 않았습니다');
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    // JWT 토큰에서 GitHub Access Token 추출
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const githubAccessToken = decoded.githubAccessToken;

    if (!githubAccessToken) {
      console.error('❌ [토큰 오류] JWT에 GitHub Access Token이 포함되지 않았습니다');
      return res.status(401).json({
        error: 'GitHub access token not found in JWT'
      });
    }

    console.log('🔄 [GitHub API] GitHub API에서 사용자 저장소 목록을 가져옵니다');

    // GitHub API에서 사용자 저장소 목록 가져오기
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        per_page: 30
      }
    });

    console.log('📥 [GitHub API] GitHub에서 저장소 목록을 성공적으로 가져왔습니다:', {
      status: response.status,
      repoCount: response.data.length
    });

    // 필요한 정보만 추출하여 응답
    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      private: repo.private
    }));

    res.json({
      success: true,
      repos: repos,
      total: repos.length
    });

  } catch (error) {
    console.error('❌ [GitHub API 오류] 저장소 목록을 가져오는 중 오류가 발생했습니다:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    res.status(500).json({
      error: 'Failed to fetch repositories',
      message: error.message,
      details: error.response?.data || 'Unknown error'
    });
  }
});

// 특정 저장소의 커밋 히스토리 가져오기
router.get('/repos/:owner/:repo/commits', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    console.log(`🔄 [GitHub API] 저장소 ${owner}/${repo}의 커밋 히스토리를 요청받았습니다`);

    // Authorization 헤더에서 JWT 토큰 추출
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (!jwtToken) {
      console.error('❌ [인증 실패] 요청에 JWT 토큰이 포함되지 않았습니다');
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    // JWT 토큰에서 GitHub Access Token 추출
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const githubAccessToken = decoded.githubAccessToken;

    if (!githubAccessToken) {
      console.error('❌ [토큰 오류] JWT에 GitHub Access Token이 포함되지 않았습니다');
      return res.status(401).json({
        error: 'GitHub access token not found in JWT'
      });
    }

    console.log(`🔄 [GitHub API] GitHub API에서 ${owner}/${repo} 커밋 히스토리를 가져옵니다`);

    // GitHub API에서 커밋 히스토리 가져오기
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        per_page: 100
      }
    });

    console.log(`📥 [GitHub API] ${owner}/${repo} 커밋 히스토리를 성공적으로 가져왔습니다:`, {
      status: response.status,
      commitCount: response.data.length
    });

    // 필요한 정보만 추출하여 응답
    const commits = response.data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date
      },
      committer: {
        name: commit.commit.committer.name,
        email: commit.commit.committer.email,
        date: commit.commit.committer.date
      },
      html_url: commit.html_url
    }));

    res.json({
      success: true,
      commits: commits,
      total: commits.length
    });

  } catch (error) {
    console.error(`❌ [GitHub API 오류] ${owner}/${repo} 커밋 히스토리를 가져오는 중 오류가 발생했습니다:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    res.status(500).json({
      error: 'Failed to fetch commits',
      message: error.message,
      details: error.response?.data || 'Unknown error'
    });
  }
});

// 특정 저장소 정보 가져오기
router.get('/repos/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    console.log(`🔄 [GitHub API] 저장소 ${owner}/${repo} 정보를 요청받았습니다`);

    // Authorization 헤더에서 JWT 토큰 추출
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (!jwtToken) {
      console.error('❌ [인증 실패] 요청에 JWT 토큰이 포함되지 않았습니다');
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    // JWT 토큰에서 GitHub Access Token 추출
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const githubAccessToken = decoded.githubAccessToken;

    if (!githubAccessToken) {
      console.error('❌ [토큰 오류] JWT에 GitHub Access Token이 포함되지 않았습니다');
      return res.status(401).json({
        error: 'GitHub access token not found in JWT'
      });
    }

    console.log(`🔄 [GitHub API] GitHub API에서 ${owner}/${repo} 정보를 가져옵니다`);

    // GitHub API에서 저장소 정보 가져오기
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    console.log(`📥 [GitHub API] ${owner}/${repo} 정보를 성공적으로 가져왔습니다:`, {
      status: response.status,
      name: response.data.name
    });

    res.json(response.data);

  } catch (error) {
    console.error(`❌ [GitHub API 오류] ${owner}/${repo} 정보를 가져오는 중 오류가 발생했습니다:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    res.status(500).json({
      error: 'Failed to fetch repository',
      message: error.message,
      details: error.response?.data || 'Unknown error'
    });
  }
});

// 특정 저장소의 기여자 목록 가져오기
router.get('/repos/:owner/:repo/contributors', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    console.log(`🔄 [GitHub API] 저장소 ${owner}/${repo}의 기여자 목록을 요청받았습니다`);

    // Authorization 헤더에서 JWT 토큰 추출
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (!jwtToken) {
      console.error('❌ [인증 실패] 요청에 JWT 토큰이 포함되지 않았습니다');
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    // JWT 토큰에서 GitHub Access Token 추출
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const githubAccessToken = decoded.githubAccessToken;

    if (!githubAccessToken) {
      console.error('❌ [토큰 오류] JWT에 GitHub Access Token이 포함되지 않았습니다');
      return res.status(401).json({
        error: 'GitHub access token not found in JWT'
      });
    }

    console.log(`🔄 [GitHub API] GitHub API에서 ${owner}/${repo} 기여자 목록을 가져옵니다`);

    // GitHub API에서 기여자 목록 가져오기
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        per_page: 100
      }
    });

    console.log(`📥 [GitHub API] ${owner}/${repo} 기여자 목록을 성공적으로 가져왔습니다:`, {
      status: response.status,
      contributorCount: response.data.length
    });

    res.json(response.data);

  } catch (error) {
    console.error(`❌ [GitHub API 오류] ${owner}/${repo} 기여자 목록을 가져오는 중 오류가 발생했습니다:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    res.status(500).json({
      error: 'Failed to fetch contributors',
      message: error.message,
      details: error.response?.data || 'Unknown error'
    });
  }
});

// Pull Requests 분석
router.get('/repos/:owner/:repo/pulls', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    console.log(`🔄 [GitHub API] 저장소 ${owner}/${repo}의 Pull Requests를 요청받았습니다`);

    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (!jwtToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const githubAccessToken = decoded.githubAccessToken;

    if (!githubAccessToken) {
      return res.status(401).json({ error: 'GitHub access token not found in JWT' });
    }

    // Open PRs 가져오기
    const openPRs = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: { state: 'open', per_page: 100 }
    });

    // Closed PRs 가져오기
    const closedPRs = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: { state: 'closed', per_page: 100 }
    });

    const allPRs = [...openPRs.data, ...closedPRs.data];
    const mergedPRs = allPRs.filter(pr => pr.merged_at);

    // 평균 리뷰 시간 계산
    const avgReviewTime = allPRs.length > 0 ? 
      allPRs.reduce((sum, pr) => {
        if (pr.created_at && pr.merged_at) {
          const created = new Date(pr.created_at);
          const merged = new Date(pr.merged_at);
          return sum + (merged - created);
        }
        return sum;
      }, 0) / allPRs.length : 0;

    res.json({
      open: openPRs.data.length,
      closed: closedPRs.data.length,
      merged: mergedPRs.length,
      avgReviewTime: avgReviewTime > 0 ? Math.round(avgReviewTime / (1000 * 60 * 60 * 24)) : 'N/A'
    });

  } catch (error) {
    console.error(`❌ [GitHub API 오류] ${req.params.owner}/${req.params.repo} Pull Requests를 가져오는 중 오류:`, error.message);
    res.status(500).json({
      error: 'Failed to fetch pull requests',
      message: error.message
    });
  }
});

// Issues 분석
router.get('/repos/:owner/:repo/issues', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    console.log(`🔄 [GitHub API] 저장소 ${owner}/${repo}의 Issues를 요청받았습니다`);

    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (!jwtToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const githubAccessToken = decoded.githubAccessToken;

    if (!githubAccessToken) {
      return res.status(401).json({ error: 'GitHub access token not found in JWT' });
    }

    // Open Issues 가져오기 (Pull Requests 제외)
    const openIssuesResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: { 
        state: 'open', 
        per_page: 100
      }
    });

    // Closed Issues 가져오기 (Pull Requests 제외)
    const closedIssuesResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: { 
        state: 'closed', 
        per_page: 100
      }
    });

    // Pull Requests 필터링 (혹시 모를 경우를 대비)
    const openIssues = openIssuesResponse.data.filter(issue => !issue.pull_request);
    const closedIssues = closedIssuesResponse.data.filter(issue => !issue.pull_request);
    const allIssues = [...openIssues, ...closedIssues];
    
    // 버그와 기능 요청 분류
    const bugs = allIssues.filter(issue => 
      issue.labels && issue.labels.some(label => 
        label.name.toLowerCase().includes('bug') || 
        label.name.toLowerCase().includes('error') ||
        label.name.toLowerCase().includes('fix')
      )
    );

    const features = allIssues.filter(issue => 
      issue.labels && issue.labels.some(label => 
        label.name.toLowerCase().includes('feature') || 
        label.name.toLowerCase().includes('enhancement') ||
        label.name.toLowerCase().includes('improvement')
      )
    );

    // 평균 해결 시간 계산
    const closedWithDates = closedIssues.filter(issue => issue.created_at && issue.closed_at);
    const avgResolutionTime = closedWithDates.length > 0 ? 
      closedWithDates.reduce((sum, issue) => {
        const created = new Date(issue.created_at);
        const closed = new Date(issue.closed_at);
        return sum + (closed - created);
      }, 0) / closedWithDates.length : 0;

    res.json({
      open: openIssues.length,
      closed: closedIssues.length,
      bugs: bugs.length,
      features: features.length,
      avgResolutionTime: avgResolutionTime > 0 ? Math.round(avgResolutionTime / (1000 * 60 * 60 * 24)) : 'N/A'
    });

  } catch (error) {
    console.error(`❌ [GitHub API 오류] ${req.params.owner}/${req.params.repo} Issues를 가져오는 중 오류:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // 404 에러는 Issues가 없는 경우일 수 있으므로 빈 데이터 반환
    if (error.response?.status === 404) {
      return res.json({
        open: 0,
        closed: 0,
        bugs: 0,
        features: 0,
        avgResolutionTime: 'N/A'
      });
    }
    
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch issues',
      message: error.message || 'Issues 데이터를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// GitHub Actions 워크플로우 분석
router.get('/repos/:owner/:repo/actions/workflows', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    console.log(`🔄 [GitHub API] 저장소 ${owner}/${repo}의 Actions 워크플로우를 요청받았습니다`);

    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (!jwtToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const githubAccessToken = decoded.githubAccessToken;

    if (!githubAccessToken) {
      return res.status(401).json({ error: 'GitHub access token not found in JWT' });
    }

    // 워크플로우 목록 가져오기
    const workflows = await axios.get(`https://api.github.com/repos/${owner}/${repo}/actions/workflows`, {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    // 최근 실행 기록 가져오기
    const runs = await axios.get(`https://api.github.com/repos/${owner}/${repo}/actions/runs`, {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: { per_page: 100 }
    });

    const totalWorkflows = workflows.data.total_count || 0;
    const activeWorkflows = workflows.data.workflows ? workflows.data.workflows.filter(w => w.state === 'active').length : 0;
    
    const workflowRuns = runs.data.workflow_runs || [];
    const successfulRuns = workflowRuns.filter(run => run.conclusion === 'success').length;
    const totalRuns = workflowRuns.length;
    const successRate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0;

    const runsWithDates = workflowRuns.filter(run => run.created_at && run.updated_at);
    const avgDuration = runsWithDates.length > 0 ? 
      runsWithDates.reduce((sum, run) => {
        const created = new Date(run.created_at);
        const updated = new Date(run.updated_at);
        return sum + (updated - created);
      }, 0) / runsWithDates.length : 0;

    res.json({
      total: totalWorkflows,
      active: activeWorkflows,
      successRate: successRate,
      avgDuration: avgDuration > 0 ? Math.round(avgDuration / (1000 * 60)) : 'N/A'
    });

  } catch (error) {
    console.error(`❌ [GitHub API 오류] ${req.params.owner}/${req.params.repo} Actions 워크플로우를 가져오는 중 오류:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // 404 에러는 Actions가 활성화되지 않았거나 워크플로우가 없는 경우일 수 있으므로 빈 데이터 반환
    if (error.response?.status === 404) {
      return res.json({
        total: 0,
        active: 0,
        successRate: 0,
        avgDuration: 'N/A'
      });
    }
    
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch workflows',
      message: error.message || 'Workflows 데이터를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// Releases 분석
router.get('/repos/:owner/:repo/releases', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    console.log(`🔄 [GitHub API] 저장소 ${owner}/${repo}의 Releases를 요청받았습니다`);

    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (!jwtToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const githubAccessToken = decoded.githubAccessToken;

    if (!githubAccessToken) {
      return res.status(401).json({ error: 'GitHub access token not found in JWT' });
    }

    // Releases 가져오기
    const releases = await axios.get(`https://api.github.com/repos/${owner}/${repo}/releases`, {
      headers: {
        'Authorization': `Bearer ${githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: { per_page: 100 }
    });

    const totalReleases = releases.data.length;
    const preReleases = releases.data.filter(release => release.prerelease).length;
    const latestRelease = totalReleases > 0 ? releases.data[0].tag_name : 'N/A';

    // 평균 릴리즈 간격 계산
    let avgInterval = 'N/A';
    if (totalReleases > 1) {
      const intervals = [];
      for (let i = 0; i < totalReleases - 1; i++) {
        const current = new Date(releases.data[i].created_at);
        const next = new Date(releases.data[i + 1].created_at);
        intervals.push(current - next);
      }
      avgInterval = Math.round(intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length / (1000 * 60 * 60 * 24));
    }

    res.json({
      total: totalReleases,
      latest: latestRelease,
      avgInterval: avgInterval,
      preRelease: preReleases
    });

  } catch (error) {
    console.error(`❌ [GitHub API 오류] ${req.params.owner}/${req.params.repo} Releases를 가져오는 중 오류:`, error.message);
    res.status(500).json({
      error: 'Failed to fetch releases',
      message: error.message
    });
  }
});

module.exports = router;
