import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const LoginContainer = styled.div`
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const MainContent = styled.div`
  max-width: 400px;
  width: 100%;
  position: relative;
  z-index: 1;
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  max-width: 400px;
  width: 100%;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const LogoSection = styled.div`
  margin-bottom: 2rem;
`;

const LogoImage = styled.img`
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #24292e;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: nowrap;
`;

const GitHubButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #24292e 0%, #1a1e22 100%);
  color: white;
  border: none;
  padding: 1.2rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(36, 41, 46, 0.3);
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(36, 41, 46, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const GitHubIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
    filter: invert(1);
  }
`;


const Login = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    // 로딩 상태를 2초 후에 해제 (중복 클릭 방지)
    setTimeout(() => setIsLoading(false), 2000);
    
    try {
      // 직접 백엔드 서버로 리다이렉트 (프록시 우회)
      window.location.href = 'http://localhost:5000/api/auth/github';
    } catch (error) {
      console.error('로그인 오류:', error);
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <LoginContainer>
        <MainContent>
          <LoginCard>
            <LogoSection>
              <LogoImage src="/gitlog.png" alt="GitLog Logo" />
              <Title>Welcome to GitLog!</Title>
              <Subtitle>
                Check and improve your projects
              </Subtitle>
            </LogoSection>
            
            <GitHubButton onClick={handleGitHubLogin} disabled={isLoading}>
              <GitHubIcon>
                {isLoading ? (
                  '⏳'
                ) : (
                  <img src="/github.png" alt="GitHub" />
                )}
              </GitHubIcon>
              {isLoading ? 'Redirecting to GitHub...' : 'Continue with GitHub'}
            </GitHubButton>
          </LoginCard>
        </MainContent>
      </LoginContainer>
    </Layout>
  );
};

export default Login;