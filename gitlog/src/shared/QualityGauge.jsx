import React from 'react';
import styled from 'styled-components';
import { useRepositoryAnalysis } from '../state/useRepositoryAnalysis';

const Card = styled.section`
  margin-top: 24px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Meter = styled.div`
  height: 16px;
  border-radius: 999px;
  background: #ede9fe;
  overflow: hidden;
  > span {
    display: block;
    height: 100%;
    background: ${({ theme }) => theme.colors.accent};
    width: ${({ value }) => `${value}%`};
    transition: width 0.4s ease;
  }
`;

export function QualityGauge({ owner, repo, branch }) {
  const { qualityScore, isLoading, error } = useRepositoryAnalysis(owner, repo, branch);

  if (isLoading) return <Card>품질 지표 계산 중…</Card>;
  if (error) return <Card>오류: {error}</Card>;

  const score = Math.round((qualityScore || 0) * 100);
  const status = score >= 75 ? '좋음' : score >= 50 ? '보통' : '주의';

  return (
    <Card>
      <h3>코드 품질 추정</h3>
      <Meter value={score}>
        <span />
      </Meter>
      <p style={{ color: '#475569' }}>점수: {score}/100 • 상태: {status}</p>
    </Card>
  );
}


