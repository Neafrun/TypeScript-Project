const getApiBaseUrl = () => {
  const fromEnv = process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && window.location) {
    // 개발환경(3000)에서는 CRA proxy를 통해 same-site 쿠키를 사용하기 위해 상대경로를 사용
    if (window.location.port === '3000') return '';
    if (window.location.origin) return window.location.origin.replace(':3000', ':5000');
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

export async function apiGet(path, options = {}) {
  // JWT 토큰 가져오기
  const token = localStorage.getItem('token');
  
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function apiPost(path, data, options = {}) {
  // JWT 토큰 가져오기
  const token = localStorage.getItem('token');
  
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(options.headers || {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}



