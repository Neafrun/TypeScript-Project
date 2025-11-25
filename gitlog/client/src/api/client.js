// API 기본 URL - 배포 환경에서는 동일 도메인 기준으로 동작하도록 설정
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.REACT_APP_API_URL || '';
  }

  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/$/, '');
  }

  return window.location.origin;
};

const API_BASE_URL = getApiBaseUrl();

// API 기본 URL 확인 로그
console.log('🔧 [API] API 기본 URL 설정:', API_BASE_URL);
console.log('🔧 [API] 현재 window.location:', typeof window !== 'undefined' ? window.location.href : 'N/A');

export { API_BASE_URL };

export async function apiGet(path, options = {}) {
  // JWT 토큰 가져오기
  const token = localStorage.getItem('gitlog_token');
  
  const url = `${API_BASE_URL}${path}`;
  console.log('🔧 [API] GET 요청:', url);
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(options.headers || {}),
      },
    });
    
    console.log('🔧 [API] GET 응답 상태:', res.status, res.statusText);
    
    if (!res.ok) {
      const text = await res.text();
      console.error('❌ [API] GET 응답 에러:', text);
      const error = new Error(`GET ${path} failed: ${res.status} ${text}`);
      error.status = res.status;
      error.response = { status: res.status, statusText: res.statusText };
      try {
        error.data = JSON.parse(text);
      } catch (e) {
        error.data = { message: text };
      }
      throw error;
    }
    
    return res.json();
  } catch (error) {
    console.error('❌ [API] GET 요청 실패:', error);
    console.error('❌ [API] 요청 URL:', url);
    throw error;
  }
}

export async function apiPost(path, data, options = {}) {
  // JWT 토큰 가져오기
  const token = localStorage.getItem('gitlog_token');
  
  const url = `${API_BASE_URL}${path}`;
  console.log('🔧 [API] POST 요청:', url);
  console.log('🔧 [API] 요청 데이터:', data);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
    });
    
    console.log('🔧 [API] 응답 상태:', res.status, res.statusText);
    
    if (!res.ok) {
      const text = await res.text();
      console.error('❌ [API] 응답 에러:', text);
      const error = new Error(`POST ${path} failed: ${res.status} ${text}`);
      error.status = res.status;
      error.response = { status: res.status, statusText: res.statusText };
      try {
        error.data = JSON.parse(text);
      } catch (e) {
        error.data = { message: text };
      }
      throw error;
    }
    
    const result = await res.json();
    console.log('✅ [API] 응답 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ [API] 요청 실패:', error);
    console.error('❌ [API] 요청 URL:', url);
    console.error('❌ [API] 에러 상세:', error.message);
    throw error;
  }
}



