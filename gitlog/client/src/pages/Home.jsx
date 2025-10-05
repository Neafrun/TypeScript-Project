import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';

const HomeContainer = styled.div`
  min-height: 100vh;
  background-color: #f6f8fa;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 4rem 0;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #24292e;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #586069;
  margin-bottom: 2rem;
`;

const CTAButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #218838;
  }
`;

const Home = () => {
  return (
    <HomeContainer>
      <Header />
      <MainContent>
        <HeroSection>
          <Title>Welcome to GitLog</Title>
          <Subtitle>
            Analyze your GitHub repositories with powerful insights and visualizations
          </Subtitle>
          <CTAButton>Get Started</CTAButton>
        </HeroSection>
      </MainContent>
    </HomeContainer>
  );
};

export default Home;
