import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { apiGet } from '../api/client';

const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Icon = styled.span`
  font-size: 1.2rem;
`;

const Title = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #24292e;
  margin: 0;
`;

const Description = styled.p`
  color: #586069;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
`;

const DataItem = styled.div`
  text-align: center;
  padding: 0.75rem 0.5rem;
  background: #f6f8fa;
  border-radius: 6px;
  border: 1px solid #e1e5e9;
`;

const DataValue = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #24292e;
  margin-bottom: 0.25rem;
`;

const DataLabel = styled.div`
  font-size: 0.75rem;
  color: #586069;
  font-weight: 500;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 1rem;
  color: #586069;
  font-style: italic;
  font-size: 0.9rem;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 1rem;
  color: #d73a49;
  background: #ffeef0;
  border-radius: 6px;
  border: 1px solid #f97583;
  font-size: 0.9rem;
`;

const WorkflowsAnalysis = ({ repoInfo }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRepoRef = useRef(null);
  const { t } = useTranslation();

  const owner = repoInfo?.owner;
  const repo = repoInfo?.repo;

  useEffect(() => {
    if (!owner || !repo) {
      setLoading(false);
      return;
    }

    const repoKey = `${owner}/${repo}`;
    
    // 이미 같은 저장소의 데이터를 불러왔으면 다시 불러오지 않음
    if (fetchedRepoRef.current === repoKey) {
      return;
    }

    const fetchWorkflowsData = async () => {
      try {
        setLoading(true);
        setError(null);
        fetchedRepoRef.current = repoKey;
        
        const response = await apiGet(`/api/github/repos/${owner}/${repo}/actions/workflows`);
        setData(response || {
          total: 0,
          active: 0,
          successRate: 0,
          avgDuration: 'N/A'
        });
      } catch (err) {
        console.error('Workflows 데이터 가져오기 실패:', err);
        // 404 에러는 Actions가 활성화되지 않았거나 워크플로우가 없는 경우이므로 빈 데이터로 처리
        if (err.response?.status === 404) {
          setData({
            total: 0,
            active: 0,
            successRate: 0,
            avgDuration: 'N/A'
          });
        } else {
          setError('Workflows 데이터를 가져오는 중 오류가 발생했습니다.');
          fetchedRepoRef.current = null;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowsData();
  }, [owner, repo]);

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>CI/CD Pipeline</Title>
        </Header>
        <Description>{t('analysis.githubFeatures.workflowsDescription')}</Description>
        <LoadingState>{t('analysis.githubFeatures.loadingWorkflows')}</LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>CI/CD Pipeline</Title>
        </Header>
        <Description>{t('analysis.githubFeatures.workflowsDescription')}</Description>
        <ErrorState>{error}</ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>CI/CD Pipeline</Title>
      </Header>
      <Description>{t('analysis.githubFeatures.workflowsDescription')}</Description>
      
      <DataGrid>
        <DataItem>
          <DataValue>{data?.total || 0}</DataValue>
          <DataLabel>Total</DataLabel>
        </DataItem>
        <DataItem>
          <DataValue>{data?.active || 0}</DataValue>
          <DataLabel>Active</DataLabel>
        </DataItem>
        <DataItem>
          <DataValue>{data?.successRate ? `${data.successRate}%` : 'N/A'}</DataValue>
          <DataLabel>Success Rate</DataLabel>
        </DataItem>
        <DataItem>
          <DataValue>{data?.avgDuration || 'N/A'}</DataValue>
          <DataLabel>Avg Duration</DataLabel>
        </DataItem>
      </DataGrid>
    </Container>
  );
};

export default WorkflowsAnalysis;
