// API 기본 URL - 직접 하드코딩 (프록시 문제 해결)
// 제거하려면: 프록시를 사용하도록 원래 코드로 복원하세요
const API_BASE_URL = 'http://localhost:5000';

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
      throw new Error(`GET ${path} failed: ${res.status} ${text}`);
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
      throw new Error(`POST ${path} failed: ${res.status} ${text}`);
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



