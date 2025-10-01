import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json'
  }
});

export async function getCommits(owner, repo, branch) {
  const per_page = 100;
  const res = await api.get(`/repos/${owner}/${repo}/commits`, {
    params: { per_page, sha: branch }
  });
  return res.data || [];
}

export async function getBranches(owner, repo) {
  const per_page = 100;
  const res = await api.get(`/repos/${owner}/${repo}/branches`, {
    params: { per_page }
  });
  return res.data || [];
}


