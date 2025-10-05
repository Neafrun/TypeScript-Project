import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';

const LoginContainer = styled.div`
  min-height: 100vh;
  background-color: #f6f8fa;
`;

const MainContent = styled.main`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #24292e;
  margin-bottom: 2rem;
`;

const GitHubButton = styled.button`
  width: 100%;
  background-color: #24292e;
  color: white;
  border: none;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1a1e22;
  }
`;

const Login = () => {
  const handleGitHubLogin = () => {
    // GitHub OAuth로 리다이렉트
    window.location.href = '/api/auth/github';
  };

  return (
    <LoginContainer>
      <Header />
      <MainContent>
        <LoginCard>
          <Title>GitLog 로그인</Title>
          <GitHubButton onClick={handleGitHubLogin}>
            <span>🔗</span>
            GitHub로 계속하기
          </GitHubButton>
        </LoginCard>
      </MainContent>
    </LoginContainer>
  );
};

export default Login;