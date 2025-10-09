import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../api/client';

const DashboardContainer = styled.div`
  background-color: #f6f8fa;
  min-height: calc(100vh - 200px);
  padding: 2rem;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
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
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRepos = async () => {
      if (!user) return;
      try {
        setLoadingRepos(true);
        const response = await apiGet('/api/github/repos');
        setRepos(response.repos || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingRepos(false);
      }
    };
    loadRepos();
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <DashboardContainer>
          <MainContent>
            <p>대시보드에 접근하려면 로그인해주세요.</p>
          </MainContent>
        </DashboardContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <DashboardContainer>
        <MainContent>
          <WelcomeSection>
            <Title>대시보드</Title>
            <UserInfo>
              <Avatar src={user.avatar_url} alt={user.login} />
              <UserDetails>
                <h3>{user.name || user.login}</h3>
                <p>@{user.login}</p>
              </UserDetails>
            </UserInfo>
          </WelcomeSection>

          <RepositoriesSection>
            <h2>저장소 목록</h2>
            {loadingRepos && <p>불러오는 중...</p>}
            {error && <p style={{ color: '#d73a49' }}>오류: {error}</p>}
            {!loadingRepos && !error && (
              <RepoList>
                {repos.map((r) => (
                  <RepoItem key={r.id}>
                    <RepoName>{r.full_name || r.name}</RepoName>
                    <RepoDescription>{r.description || '설명이 없습니다'}</RepoDescription>
                  </RepoItem>
                ))}
              </RepoList>
            )}
          </RepositoriesSection>
        </MainContent>
      </DashboardContainer>
    </Layout>
  );
};

export default Dashboard;