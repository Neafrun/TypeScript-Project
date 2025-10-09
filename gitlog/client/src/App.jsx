import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import GlobalStyle from './styles/GlobalStyle';
import theme from './styles/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import Home from './pages/Home';
import Login from './pages/Login';
import Callback from './pages/Callback';
import Dashboard from './pages/Dashboard';
import AIAnalysis from './pages/AIAnalysis';
import RepositoryAnalysis from './pages/RepositoryAnalysis';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';

// API 경로 리다이렉트 컴포넌트
const APIRedirect = () => {
  const location = useLocation();
  
  useEffect(() => {
    // 현재 경로를 백엔드 서버로 리다이렉트
    const backendUrl = `http://localhost:5000${location.pathname}${location.search}`;
    window.location.href = backendUrl;
  }, [location]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>API 경로로 리다이렉트 중...</p>
    </div>
  );
};

const AppContainer = styled.div`
  min-height: 100vh;
`;

// 메인 앱 컴포넌트 (AuthContext 사용)
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="인증 상태를 확인하는 중..." />;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContainer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-analysis" element={<AIAnalysis />} />
          <Route path="/repository-analysis" element={<RepositoryAnalysis />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<Contact />} />
          {/* API 경로는 백엔드로 리다이렉트 */}
          <Route path="/api/*" element={<APIRedirect />} />
        </Routes>
      </AppContainer>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;