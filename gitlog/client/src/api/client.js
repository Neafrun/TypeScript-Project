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
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}



