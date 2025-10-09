const express = require('express');
const authenticate = require('../middleware/auth');
const GitHubAPI = require('../config/github');

const router = express.Router();

// Get current user's repositories
router.get('/repos', authenticate, async (req, res, next) => {
  try {
    const { access_token, login } = req.user;
    const gh = new GitHubAPI(access_token);
    const repos = await gh.getUserRepositories(login);
    res.json(repos);
  } catch (err) {
    next(err);
  }
});

// Get repository stats summary
router.get('/repos/:owner/:repo/stats', authenticate, async (req, res, next) => {
  try {
    const { access_token } = req.user;
    const { owner, repo } = req.params;
    const gh = new GitHubAPI(access_token);
    const stats = await gh.getRepositoryStats(owner, repo);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Get commits for a repo (paginated)
router.get('/repos/:owner/:repo/commits', authenticate, async (req, res, next) => {
  try {
    const { access_token } = req.user;
    const { owner, repo } = req.params;
    const { sha, per_page, page, since, until } = req.query;
    const gh = new GitHubAPI(access_token);
    const commits = await gh.getRepositoryCommits(owner, repo, { sha, per_page, page, since, until });
    res.json(commits);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


