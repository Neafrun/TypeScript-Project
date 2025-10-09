import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const HomeContainer = styled.div`
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  width: 100%;
`;

const LeftContent = styled.div`
  flex: 1;
  color: white;
  max-width: 600px;
`;

const MainTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 2.5rem;
  line-height: 1.5;
  opacity: 0.95;
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
  width: 200px;
  height: 200px;
  margin-bottom: 1rem;
`;


const ArrowIcon = styled.span`
  font-size: 1.2rem;
`;

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
              GitLog: Your Project's Story, Beautifully Documented
            </MainTitle>
            <Subtitle>
              Effortlessly track changes, collaborate with your team, and celebrate every milestone.
            </Subtitle>
            <StartButton onClick={handleStartClick}>
              {user ? '대시보드로 이동' : '시작하기'} <ArrowIcon>→</ArrowIcon>
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