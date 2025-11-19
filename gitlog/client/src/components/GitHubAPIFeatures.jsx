import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { apiGet } from '../api/client';

const GitHubAPIContainer = styled.div`
  margin: 2rem 0;
`;

const SectionTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '🔐';
    font-size: 1.5rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const FeatureIcon = styled.div`
  font-size: 1.5rem;
`;

const FeatureTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  color: #24292e;
  margin: 0;
`;

const FeatureDescription = styled.p`
  color: #586069;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
`;

const DataItem = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: #f6f8fa;
  border-radius: 6px;
  border: 1px solid #e1e5e9;
`;

const DataValue = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #24292e;
  margin-bottom: 0.25rem;
`;

const DataLabel = styled.div`
  font-size: 0.8rem;
  color: #586069;
  font-weight: 500;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #586069;
  font-style: italic;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #d73a49;
  background: #ffeef0;
  border-radius: 8px;
  border: 1px solid #f97583;
`;

const GitHubAPIFeatures = ({ repoInfo, isLoggedIn }) => {
  const [pullRequests, setPullRequests] = useState(null);
  const [issues, setIssues] = useState(null);
  const [workflows, setWorkflows] = useState(null);
  const [releases, setReleases] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRepoRef = useRef(null);
  const { t } = useTranslation();

  const owner = repoInfo?.owner;
  const repo = repoInfo?.repo;

  useEffect(() => {
    if (!isLoggedIn || !owner || !repo) {
      setLoading(false);
      return;
    }

    const currentRepoKey = `${owner}/${repo}`;
    
    // 이미 같은 저장소의 데이터를 불러왔으면 다시 불러오지 않음
    if (fetchedRepoRef.current === currentRepoKey) {
      return;
    }

    const fetchGitHubAPIData = async () => {
      try {
        setLoading(true);
        setError(null);
        fetchedRepoRef.current = currentRepoKey; // 현재 저장소 키 저장

        console.log('🔄 [GitHubAPIFeatures] GitHub API 데이터 가져오기 시작:', currentRepoKey);

        const [prs, issuesData, workflowsData, releasesData] = await Promise.allSettled([
          apiGet(`/api/github/repos/${owner}/${repo}/pulls`),
          apiGet(`/api/github/repos/${owner}/${repo}/issues`),
          apiGet(`/api/github/repos/${owner}/${repo}/actions/workflows`),
          apiGet(`/api/github/repos/${owner}/${repo}/releases`)
        ]);

        if (prs.status === 'fulfilled') setPullRequests(prs.value);
        if (issuesData.status === 'fulfilled') setIssues(issuesData.value);
        if (workflowsData.status === 'fulfilled') setWorkflows(workflowsData.value);
        if (releasesData.status === 'fulfilled') setReleases(releasesData.value);

      } catch (err) {
        console.error('GitHub API 데이터 가져오기 실패:', err);
        setError('GitHub API 데이터를 가져오는 중 오류가 발생했습니다.');
        fetchedRepoRef.current = null; // 에러 발생 시 다시 시도할 수 있도록
      } finally {
        setLoading(false);
      }
    };

    // 저장소가 변경되면 데이터 초기화
    if (fetchedRepoRef.current !== currentRepoKey) {
      setPullRequests(null);
      setIssues(null);
      setWorkflows(null);
      setReleases(null);
    }

    fetchGitHubAPIData();
  }, [isLoggedIn, owner, repo]);

  if (!isLoggedIn) {
    return null; // 로그인하지 않은 경우 표시하지 않음
  }

  if (loading) {
    return (
      <GitHubAPIContainer>
        <SectionTitle>{t('analysis.githubFeatures.githubAPIIntegration')}</SectionTitle>
        <LoadingState>
          {t('analysis.githubFeatures.loadingGitHubData')}
        </LoadingState>
      </GitHubAPIContainer>
    );
  }

  if (error) {
    return (
      <GitHubAPIContainer>
        <SectionTitle>{t('analysis.githubFeatures.githubAPIIntegration')}</SectionTitle>
        <ErrorState>{error}</ErrorState>
      </GitHubAPIContainer>
    );
  }

  return (
    <GitHubAPIContainer>
      <SectionTitle>GitHub API 연동 기능</SectionTitle>
      
      <FeaturesGrid>
        {/* Pull Requests 분석 */}
        <FeatureCard>
          <FeatureHeader>
            <FeatureTitle>Pull Requests</FeatureTitle>
          </FeatureHeader>
          <FeatureDescription>
{t('analysis.githubFeatures.pullRequestsDescription')}
          </FeatureDescription>
          {pullRequests ? (
            <DataGrid>
              <DataItem>
                <DataValue>{pullRequests.open || 0}</DataValue>
                <DataLabel>Open PRs</DataLabel>
              </DataItem>
              <DataItem>
                <DataValue>{pullRequests.merged || 0}</DataValue>
                <DataLabel>Merged</DataLabel>
              </DataItem>
              <DataItem>
                <DataValue>{pullRequests.closed || 0}</DataValue>
                <DataLabel>Closed</DataLabel>
              </DataItem>
              <DataItem>
                <DataValue>{pullRequests.avgReviewTime || 'N/A'}</DataValue>
                <DataLabel>Avg Review</DataLabel>
              </DataItem>
            </DataGrid>
          ) : (
            <LoadingState>PR 데이터 로딩 중...</LoadingState>
          )}
        </FeatureCard>

        {/* Issues 분석 */}
        <FeatureCard>
          <FeatureHeader>
            <FeatureTitle>Issues & Bugs</FeatureTitle>
          </FeatureHeader>
          <FeatureDescription>
{t('analysis.githubFeatures.issuesDescription')}
          </FeatureDescription>
          {issues ? (
            <DataGrid>
              <DataItem>
                <DataValue>{issues.open || 0}</DataValue>
                <DataLabel>Open Issues</DataLabel>
              </DataItem>
              <DataItem>
                <DataValue>{issues.bugs || 0}</DataValue>
                <DataLabel>Bug Reports</DataLabel>
              </DataItem>
              <DataItem>
                <DataValue>{issues.features || 0}</DataValue>
                <DataLabel>Feature Reqs</DataLabel>
              </DataItem>
              <DataItem>
                <DataValue>{issues.avgResolutionTime || 'N/A'}</DataValue>
                <DataLabel>Avg Resolution</DataLabel>
              </DataItem>
            </DataGrid>
          ) : (
            <LoadingState>Issues 데이터 로딩 중...</LoadingState>
          )}
        </FeatureCard>

        {/* CI/CD 워크플로우 */}
        <FeatureCard>
          <FeatureHeader>
            <FeatureTitle>CI/CD Pipeline</FeatureTitle>
          </FeatureHeader>
          <FeatureDescription>
{t('analysis.githubFeatures.workflowsDescription')}
          </FeatureDescription>
          {workflows ? (
            <DataGrid>
              <DataItem>
                <DataValue>{workflows.total || 0}</DataValue>
                <DataLabel>Workflows</DataLabel>
              </DataItem>
              <DataItem>
                <DataValue>{workflows.active || 0}</DataValue>
                <DataLabel>Active</DataLabel>
              </DataItem>
              <DataItem>
                <DataValue>{workflows.successRate ? `${workflows.successRate}%` : 'N/A'}</DataValue>
                <DataLabel>Success Rate</DataLabel>
              </DataItem>
              <DataItem>
                <DataValue>{workflows.avgDuration || 'N/A'}</DataValue>
                <DataLabel>Avg Duration</DataLabel>
              </DataItem>
            </DataGrid>
          ) : (
            <LoadingState>워크플로우 데이터 로딩 중...</LoadingState>
          )}
        </FeatureCard>

        {/* Releases & Tags */}
        <FeatureCard>
          <FeatureHeader>
            <FeatureTitle>Releases & Tags</FeatureTitle>
          </FeatureHeader>
          <FeatureDescription>
{t('analysis.githubFeatures.releasesDescription')}
          </FeatureDescription>
          {releases ? (
            <DataGrid>
              <DataItem>
                <DataValue>{releases.total || 0}</DataValue>
                <DataLabel>Total Releases</DataLabel>
              </DataItem>
              <DataItem>
                <DataValue>{releases.latest || 'N/A'}</DataValue>
                <DataLabel>Latest</DataLabel>
              </DataItem>
              <DataItem>
                <DataValue>{releases.avgInterval || 'N/A'}</DataValue>
                <DataLabel>Avg Interval</DataLabel>
              </DataItem>
              <DataItem>
                <DataValue>{releases.preRelease || 0}</DataValue>
                <DataLabel>Pre-releases</DataLabel>
              </DataItem>
            </DataGrid>
          ) : (
            <LoadingState>릴리즈 데이터 로딩 중...</LoadingState>
          )}
        </FeatureCard>

        {/* 보안 분석 */}
        <FeatureCard>
          <FeatureHeader>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>Security Analysis</FeatureTitle>
          </FeatureHeader>
          <FeatureDescription>
            보안 취약점과 의존성 분석을 제공합니다.
          </FeatureDescription>
          <DataGrid>
            <DataItem>
              <DataValue>GitHub API</DataValue>
              <DataLabel>Dependabot</DataLabel>
            </DataItem>
            <DataItem>
              <DataValue>GitHub API</DataValue>
              <DataLabel>Code Scanning</DataLabel>
            </DataItem>
            <DataItem>
              <DataValue>GitHub API</DataValue>
              <DataLabel>Secret Scanning</DataLabel>
            </DataItem>
            <DataItem>
              <DataValue>GitHub API</DataValue>
              <DataLabel>Vulnerabilities</DataLabel>
            </DataItem>
          </DataGrid>
        </FeatureCard>

        {/* 브랜치 보호 규칙 */}
        <FeatureCard>
          <FeatureHeader>
            <FeatureIcon>🛡️</FeatureIcon>
            <FeatureTitle>Branch Protection</FeatureTitle>
          </FeatureHeader>
          <FeatureDescription>
            브랜치 보호 규칙과 권한 설정을 확인합니다.
          </FeatureDescription>
          <DataGrid>
            <DataItem>
              <DataValue>GitHub API</DataValue>
              <DataLabel>Protected Branches</DataLabel>
            </DataItem>
            <DataItem>
              <DataValue>GitHub API</DataValue>
              <DataLabel>Required Reviews</DataLabel>
            </DataItem>
            <DataItem>
              <DataValue>GitHub API</DataValue>
              <DataLabel>Status Checks</DataLabel>
            </DataItem>
            <DataItem>
              <DataValue>GitHub API</DataValue>
              <DataLabel>Admin Override</DataLabel>
            </DataItem>
          </DataGrid>
        </FeatureCard>
      </FeaturesGrid>
    </GitHubAPIContainer>
  );
};

export default GitHubAPIFeatures;
