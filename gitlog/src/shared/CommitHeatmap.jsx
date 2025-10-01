import React from 'react';
import styled from 'styled-components';
import { useRepositoryAnalysis } from '../state/useRepositoryAnalysis';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const Card = styled.section`
  margin-top: 24px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export function CommitHeatmap({ owner, repo, branch }) {
  const { commitByHour, isLoading, error } = useRepositoryAnalysis(owner, repo, branch);

  if (isLoading) return <Card>커밋 시간대 분석 중…</Card>;
  if (error) return <Card>오류: {error}</Card>;
  if (!commitByHour?.length) return <Card>데이터가 없습니다.</Card>;

  return (
    <Card>
      <h3>커밋 시간대</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={commitByHour} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <XAxis dataKey="hour"/>
          <YAxis allowDecimals={false}/>
          <Tooltip />
          <Bar dataKey="count" fill="#c4b5fd" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}


