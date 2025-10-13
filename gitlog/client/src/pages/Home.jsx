import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

const HomeContainer = styled.div`
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  width: 100%;
  position: relative;
  z-index: 1;
  gap: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 3rem 1.5rem;
    gap: 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
    gap: 1.5rem;
  }
`;

const LeftContent = styled.div`
  flex: 1;
  color: white;
  max-width: 600px;
  padding-right: 2rem;
  
  @media (max-width: 768px) {
    padding-right: 1rem;
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    padding-right: 0;
    text-align: center;
  }
`;

const MainTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  line-height: 1.3;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.02em;
  word-break: keep-all;
  overflow-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: 2.8rem;
    line-height: 1.2;
    margin-bottom: 1.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2.2rem;
    line-height: 1.1;
    margin-bottom: 1rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  opacity: 0.95;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.01em;
  word-break: keep-all;
  overflow-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    line-height: 1.5;
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    line-height: 1.4;
    margin-bottom: 1.5rem;
  }
`;

const LoginPrompt = styled.p`
  font-size: 0.9rem;
  margin-top: 1rem;
  line-height: 1.4;
  opacity: 0.8;
  color: white;
  font-style: italic;
  word-break: keep-all;
  overflow-wrap: break-word;
`;

const StartButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  &:hover {
    background-color: #45a049;
    transform: translateY(-2px);
  }
`;

const RightContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LogoImage = styled.img`
  width: 300px;
  height: 300px;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    width: 250px;
    height: 250px;
  }
  
  @media (max-width: 480px) {
    width: 200px;
    height: 200px;
  }
`;


const ArrowIcon = styled.span`
  font-size: 1.2rem;
`;

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleStartClick = () => {
    if (user) {
      // 로그인된 사용자는 대시보드로
      navigate('/dashboard');
    } else {
      // 로그인되지 않은 사용자는 로그인 페이지로
      navigate('/login');
    }
  };

  return (
    <Layout>
      <HomeContainer>
        <MainContent>
          <LeftContent>
            <MainTitle>
              {user ? t('home.titleLoggedIn') : t('home.title')}
            </MainTitle>
            <Subtitle>
              {user ? t('home.subtitleLoggedIn') : t('home.subtitle')}
            </Subtitle>
            {!user && (
              <LoginPrompt style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                {t('home.loginPrompt')}
              </LoginPrompt>
            )}
            <StartButton onClick={handleStartClick}>
              {user ? t('home.goToDashboard') : t('home.getStarted')} <ArrowIcon>→</ArrowIcon>
            </StartButton>
          </LeftContent>
          <RightContent>
            <LogoImage src="/gitlog.png" alt="GitLog Logo" />
          </RightContent>
        </MainContent>
      </HomeContainer>
    </Layout>
  );
};

export default Home;