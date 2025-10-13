import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
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
  background: white;
  padding: 1.5rem;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #ff8c42;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff8c42, #ff6b35);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover::before {
    transform: scaleX(1);
  }
`;

const RepoName = styled.h4`
  margin: 0 0 0.5rem;
  color: #0366d6;
  font-size: 1.1rem;
  font-weight: 600;
  transition: color 0.2s ease;
  
  ${RepoItem}:hover & {
    color: #ff8c42;
  }
`;

const RepoDescription = styled.p`
  margin: 0 0 1rem;
  color: #586069;
  font-size: 0.95rem;
  line-height: 1.4;
`;

const RepoStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #6a737d;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const AnalyzeButton = styled.button`
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(255, 140, 66, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(255, 140, 66, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
`;

const FilterLabel = styled.span`
  font-weight: 600;
  color: #24292e;
  margin-right: 1rem;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)' : 'white'};
  color: ${props => props.active ? 'white' : '#24292e'};
  border: 2px solid ${props => props.active ? 'transparent' : '#e1e4e8'};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    border-color: ${props => props.disabled ? '#e1e4e8' : '#ff8c42'};
    background: ${props => props.active ? 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)' : props.disabled ? 'white' : '#fff8f4'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(1px)'};
  }
`;

const RepoCount = styled.span`
  font-size: 0.9rem;
  color: #586069;
  margin-left: auto;
`;

const SortSection = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  align-items: center;
`;

const SortLabel = styled.span`
  font-weight: 600;
  color: #24292e;
  margin-right: 1rem;
`;

const SortButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)' : 'white'};
  color: ${props => props.active ? 'white' : '#24292e'};
  border: 2px solid ${props => props.active ? 'transparent' : '#e1e4e8'};
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    border-color: ${props => props.disabled ? '#e1e4e8' : '#ff8c42'};
    background: ${props => props.active ? 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)' : props.disabled ? 'white' : '#fff8f4'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(1px)'};
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [repos, setRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [error, setError] = useState(null);
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnalyzeRepo = (repo) => {
    // Repository Analysis 페이지로 이동하면서 레포지토리 URL을 전달
    navigate(`/repository-analysis?repo=${encodeURIComponent(repo.full_name)}`);
  };

  // 필터링 로직
  const filterRepos = (repos, filter) => {
    if (filter === 'all') return repos;
    return repos.filter(repo => repo.private === (filter === 'private'));
  };

  // 정렬 로직
  const sortRepos = (repos, sortOrder) => {
    const sortedRepos = [...repos];
    sortedRepos.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      
      if (sortOrder === 'newest') {
        return dateB - dateA; // 내림차순 (최신순)
      } else {
        return dateA - dateB; // 오름차순 (오래된 순)
      }
    });
    return sortedRepos;
  };

  // 필터 변경 핸들러
  const handleFilterChange = async (filter) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // 작은 지연으로 안정성 개선
      setVisibilityFilter(filter);
      const filtered = filterRepos(repos, filter);
      setFilteredRepos(sortRepos(filtered, sortOrder));
    } finally {
      setIsProcessing(false);
    }
  };

  // 정렬 변경 핸들러
  const handleSortChange = async (order) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // 작은 지연으로 안정성 개선
      setSortOrder(order);
      setFilteredRepos(sortRepos(filteredRepos, order));
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const loadRepos = async () => {
      if (!user) return;
      try {
        setLoadingRepos(true);
        const response = await apiGet('/api/github/repos');
        const reposData = response.repos || [];
        setRepos(reposData);
        const filtered = filterRepos(reposData, visibilityFilter);
        setFilteredRepos(sortRepos(filtered, sortOrder));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingRepos(false);
      }
    };
    loadRepos();
  }, [user, visibilityFilter, sortOrder]);

  if (!user) {
    return (
      <Layout>
        <DashboardContainer>
          <MainContent>
            <p>{t('dashboard.pleaseLogin')}</p>
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
            <Title>{t('dashboard.title')}</Title>
            <UserInfo>
              <Avatar src={user.avatar_url} alt={user.login} />
              <UserDetails>
                <h3>{user.name || user.login}</h3>
                <p>@{user.login}</p>
              </UserDetails>
            </UserInfo>
          </WelcomeSection>

          <RepositoriesSection>
            <h2>{t('dashboard.repositoryList')}</h2>
            {loadingRepos && <p>{t('dashboard.loading')}</p>}
            {error && <p style={{ color: '#d73a49' }}>{t('dashboard.error')}: {error}</p>}
            {!loadingRepos && !error && (
              <>
                <FilterSection>
                  <FilterLabel>{t('dashboard.filterByVisibility')}</FilterLabel>
                  <FilterButton 
                    active={visibilityFilter === 'all'} 
                    disabled={isProcessing}
                    onClick={() => handleFilterChange('all')}
                  >
                    {t('dashboard.all')}
                  </FilterButton>
                  <FilterButton 
                    active={visibilityFilter === 'public'} 
                    disabled={isProcessing}
                    onClick={() => handleFilterChange('public')}
                  >
                    {t('dashboard.public')}
                  </FilterButton>
                  <FilterButton 
                    active={visibilityFilter === 'private'} 
                    disabled={isProcessing}
                    onClick={() => handleFilterChange('private')}
                  >
                    {t('dashboard.private')}
                  </FilterButton>
                  <RepoCount>
                    {t('dashboard.showing')} {filteredRepos.length} {t('dashboard.of')} {repos.length} {t('dashboard.repositories')}
                  </RepoCount>
                </FilterSection>
                
                <SortSection>
                  <SortLabel>{t('dashboard.sortByCreationDate')}</SortLabel>
                  <SortButton 
                    active={sortOrder === 'newest'} 
                    disabled={isProcessing}
                    onClick={() => handleSortChange('newest')}
                  >
                    {t('dashboard.newestFirst')}
                  </SortButton>
                  <SortButton 
                    active={sortOrder === 'oldest'} 
                    disabled={isProcessing}
                    onClick={() => handleSortChange('oldest')}
                  >
                    {t('dashboard.oldestFirst')}
                  </SortButton>
                </SortSection>
                <RepoList>
                  {filteredRepos.map((r) => (
                  <RepoItem key={r.id} onClick={() => handleAnalyzeRepo(r)}>
                    <RepoName>{r.full_name || r.name}</RepoName>
                    <RepoDescription>{r.description || t('dashboard.noDescription')}</RepoDescription>
                    <RepoStats>
                      <StatItem>
                        {r.private ? `🔒 ${t('dashboard.private')}` : `🌐 ${t('dashboard.public')}`}
                      </StatItem>
                      <StatItem>
                        {t('dashboard.stars')}: {r.stargazers_count || 0}
                      </StatItem>
                      <StatItem>
                        {t('dashboard.forks')}: {r.forks_count || 0}
                      </StatItem>
                      <StatItem>
                        {t('dashboard.language')}: {r.language || t('dashboard.unknown')}
                      </StatItem>
                      <StatItem>
                        {t('dashboard.created')}: {new Date(r.created_at).toLocaleDateString()}
                      </StatItem>
                    </RepoStats>
                    <AnalyzeButton onClick={(e) => {
                      e.stopPropagation();
                      handleAnalyzeRepo(r);
                    }}>
                      {t('dashboard.analyze')}
                    </AnalyzeButton>
                  </RepoItem>
                ))}
                </RepoList>
              </>
            )}
          </RepositoriesSection>
        </MainContent>
      </DashboardContainer>
    </Layout>
  );
};

export default Dashboard;