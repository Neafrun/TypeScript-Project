import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('user');
      return cached ? JSON.parse(cached) : null;
    } catch (_) {
      return null;
    }
  });
  // eslint-disable-next-line no-unused-vars
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch (_) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    // 사용자가 이미 로그인되어 있는지 확인
    const checkAuth = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          try { localStorage.setItem('gitlog_user', JSON.stringify(userData)); } catch (_) {}
        } else {
          setUser(null);
          setToken(null);
          try { 
            localStorage.removeItem('gitlog_user'); 
            localStorage.removeItem('gitlog_token'); 
          } catch (_) {}
        }
      } catch (error) {
        console.error('인증 확인 실패:', error);
        setUser(null);
        setToken(null);
        try { 
          localStorage.removeItem('gitlog_user'); 
          localStorage.removeItem('gitlog_token'); 
        } catch (_) {}
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [API_BASE, token]);

  const login = () => {
    try {
      const url = `${API_BASE}/api/auth/github`;
      window.location.href = url;
    } catch (error) {
      console.error('로그인 리다이렉트 실패:', error);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      try { 
        localStorage.removeItem('user'); 
        localStorage.removeItem('token'); 
      } catch (_) {}
      // 홈페이지로 리다이렉트
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 에러가 발생해도 로컬 상태는 초기화
      setUser(null);
      setToken(null);
      try { 
        localStorage.removeItem('user'); 
        localStorage.removeItem('token'); 
      } catch (_) {}
      window.location.href = '/';
    }
  };

  const handleCallback = async (code, state) => {
    try {
      setLoading(true);
      
      const requestBody = { code, state };

      const response = await fetch(`${API_BASE}/api/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const userData = await response.json();
        
        setUser(userData);
        setToken(userData.token);
        try { 
          localStorage.setItem('gitlog_user', JSON.stringify(userData)); 
          localStorage.setItem('gitlog_token', userData.token);
        } catch (error) {
          console.error('❌ AuthContext: localStorage 저장 실패', error);
        }
        
        // 페이지 새로고침 대신 상태 업데이트 후 리다이렉트
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        const errorData = await response.json().catch(() => ({ error: '응답 파싱 실패' }));
        console.error('❌ AuthContext: 인증 실패', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorData 
        });
        
        setUser(null);
        setToken(null);
        try { 
          localStorage.removeItem('gitlog_user'); 
          localStorage.removeItem('gitlog_token'); 
        } catch (_) {}
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('❌ AuthContext: 콜백 처리 실패', { 
        message: error.message, 
        stack: error.stack,
        name: error.name 
      });
      
      setUser(null);
      setToken(null);
      try { 
        localStorage.removeItem('user'); 
        localStorage.removeItem('token'); 
      } catch (_) {}
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    handleCallback,
    isAuthenticated: !!user,
    setUser,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};