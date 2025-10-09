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

module.exports = router;
