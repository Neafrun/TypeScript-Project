import React from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';

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
            {/* 헤더에서 로그인/대시보드 내비게이션을 제공하므로 홈 CTA 제거 */}
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