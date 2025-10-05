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
      console.error(`GitHub API Error (${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }

  // Get user repositories
  async getUserRepositories(username, options = {}) {
    const params = new URLSearchParams({
      sort: 'updated',
      per_page: '100',
      ...options,
    });
    
    return this.makeRequest(`/users/${username}/repos?${params}`);
  }

  // Get repository details
  async getRepository(owner, repo) {
    return this.makeRequest(`/repos/${owner}/${repo}`);
  }

  // Get repository commits
  async getRepositoryCommits(owner, repo, options = {}) {
    const params = new URLSearchParams({
      per_page: '100',
      ...options,
    });
    
    return this.makeRequest(`/repos/${owner}/${repo}/commits?${params}`);
  }

  // Get repository branches
  async getRepositoryBranches(owner, repo) {
    return this.makeRequest(`/repos/${owner}/${repo}/branches`);
  }

  // Get repository languages
  async getRepositoryLanguages(owner, repo) {
    return this.makeRequest(`/repos/${owner}/${repo}/languages`);
  }

  // Get repository contributors
  async getRepositoryContributors(owner, repo) {
    return this.makeRequest(`/repos/${owner}/${repo}/contributors`);
  }

  // Get commit details
  async getCommit(owner, repo, sha) {
    return this.makeRequest(`/repos/${owner}/${repo}/commits/${sha}`);
  }

  // Get repository statistics
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
