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
      const cached = localStorage.getItem('gitlog_user');
      return cached ? JSON.parse(cached) : null;
    } catch (_) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim())
    || (typeof window !== 'undefined' && window.location && window.location.origin
      ? window.location.origin.replace(':3000', ':5000')
      : 'http://localhost:5000');

  useEffect(() => {
    // 사용자가 이미 로그인되어 있는지 확인
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          try { localStorage.setItem('gitlog_user', JSON.stringify(userData)); } catch (_) {}
        } else {
          try { localStorage.removeItem('gitlog_user'); } catch (_) {}
        }
      } catch (error) {
        console.error('인증 확인 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = () => {
    const url = `${API_BASE}/api/auth/github`;
    window.location.href = url;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      try { localStorage.removeItem('gitlog_user'); } catch (_) {}
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleCallback = async (code, state) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code, state }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        try { localStorage.setItem('gitlog_user', JSON.stringify(userData)); } catch (_) {}
        try { window.alert('로그인 완료!'); } catch (e) {}
        window.location.href = '/dashboard';
      } else {
        console.error('인증 실패');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('콜백 처리 실패:', error);
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    handleCallback,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};