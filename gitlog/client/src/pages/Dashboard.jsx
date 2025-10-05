import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f6f8fa;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const WelcomeSection = styled.section`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #24292e;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Avatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
`;

const UserDetails = styled.div`
  h3 {
    margin: 0;
    color: #24292e;
  }
  p {
    margin: 0.5rem 0 0;
    color: #586069;
  }
`;

const RepositoriesSection = styled.section`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const RepoList = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

const RepoItem = styled.div`
  padding: 1rem;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #0366d6;
  }
`;

const RepoName = styled.h4`
  margin: 0 0 0.5rem;
  color: #0366d6;
`;

const RepoDescription = styled.p`
  margin: 0;
  color: #586069;
  font-size: 0.9rem;
`;

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <DashboardContainer>
        <Header />
        <MainContent>
          <p>Please log in to access the dashboard.</p>
        </MainContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header />
      <MainContent>
        <WelcomeSection>
          <Title>Dashboard</Title>
          <UserInfo>
            <Avatar src={user.avatar_url} alt={user.login} />
            <UserDetails>
              <h3>{user.name || user.login}</h3>
              <p>@{user.login}</p>
            </UserDetails>
          </UserInfo>
        </WelcomeSection>

        <RepositoriesSection>
          <h2>Your Repositories</h2>
          <RepoList>
            <RepoItem>
              <RepoName>sample-repo</RepoName>
              <RepoDescription>A sample repository for demonstration</RepoDescription>
            </RepoItem>
            <RepoItem>
              <RepoName>another-repo</RepoName>
              <RepoDescription>Another sample repository</RepoDescription>
            </RepoItem>
          </RepoList>
        </RepositoriesSection>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
