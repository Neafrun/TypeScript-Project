import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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

const PullRequestsAnalysis = ({ repoInfo }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (repoInfo) {
      fetchPullRequestsData();
    }
  }, [repoInfo]);

  const fetchPullRequestsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet(`/api/github/repos/${repoInfo.owner}/${repoInfo.repo}/pulls`);
      setData(response);
    } catch (err) {
      console.error('Pull Requests 데이터 가져오기 실패:', err);
      setError('Pull Requests 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Icon>🔄</Icon>
          <Title>Pull Requests</Title>
        </Header>
        <Description>최근 PR 활동과 리뷰 패턴을 분석합니다.</Description>
        <LoadingState>PR 데이터 로딩 중...</LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Icon>🔄</Icon>
          <Title>Pull Requests</Title>
        </Header>
        <Description>최근 PR 활동과 리뷰 패턴을 분석합니다.</Description>
        <ErrorState>{error}</ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Icon>🔄</Icon>
        <Title>Pull Requests</Title>
      </Header>
      <Description>최근 PR 활동과 리뷰 패턴을 분석합니다.</Description>
      
      {data && (
        <DataGrid>
          <DataItem>
            <DataValue>{data.open || 0}</DataValue>
            <DataLabel>Open</DataLabel>
          </DataItem>
          <DataItem>
            <DataValue>{data.merged || 0}</DataValue>
            <DataLabel>Merged</DataLabel>
          </DataItem>
          <DataItem>
            <DataValue>{data.closed || 0}</DataValue>
            <DataLabel>Closed</DataLabel>
          </DataItem>
          <DataItem>
            <DataValue>{data.avgReviewTime || 'N/A'}</DataValue>
            <DataLabel>Avg Review</DataLabel>
          </DataItem>
        </DataGrid>
      )}
    </Container>
  );
};

export default PullRequestsAnalysis;
