const axios = require('axios');

class GitHubAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://api.github.com';
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const response = await axios({
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `token ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          ...options.headers,
        },
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error(`GitHub API 오류 (${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }

  // 사용자 저장소 가져오기
  async getUserRepositories(username, options = {}) {
    const params = new URLSearchParams({
      sort: 'updated',
      per_page: '100',
      ...options,
    });
    
    return this.makeRequest(`/users/${username}/repos?${params}`);
  }

  // 저장소 세부 정보 가져오기
  async getRepository(owner, repo) {
    return this.makeRequest(`/repos/${owner}/${repo}`);
  }

  // 저장소 커밋 가져오기
  async getRepositoryCommits(owner, repo, options = {}) {
    const params = new URLSearchParams({
      per_page: '100',
      ...options,
    });
    
    return this.makeRequest(`/repos/${owner}/${repo}/commits?${params}`);
  }

  // 저장소 브랜치 가져오기
  async getRepositoryBranches(owner, repo) {
    return this.makeRequest(`/repos/${owner}/${repo}/branches`);
  }

  // 저장소 언어 가져오기
  async getRepositoryLanguages(owner, repo) {
    return this.makeRequest(`/repos/${owner}/${repo}/languages`);
  }

  // 저장소 기여자 가져오기
  async getRepositoryContributors(owner, repo) {
    return this.makeRequest(`/repos/${owner}/${repo}/contributors`);
  }

  // 커밋 세부 정보 가져오기
  async getCommit(owner, repo, sha) {
    return this.makeRequest(`/repos/${owner}/${repo}/commits/${sha}`);
  }

  // 저장소 통계 가져오기
  async getRepositoryStats(owner, repo) {
    const [repoData, commits, branches, languages, contributors] = await Promise.all([
      this.getRepository(owner, repo),
      this.getRepositoryCommits(owner, repo, { per_page: 1 }),
      this.getRepositoryBranches(owner, repo),
      this.getRepositoryLanguages(owner, repo),
      this.getRepositoryContributors(owner, repo),
    ]);

    return {
      ...repoData,
      stats: {
        totalCommits: commits.length > 0 ? commits[0].sha : 0,
        totalBranches: branches.length,
        languages: languages,
        contributors: contributors.length,
        lastCommit: commits.length > 0 ? commits[0].commit.author.date : null,
      },
    };
  }
}

module.exports = GitHubAPI;