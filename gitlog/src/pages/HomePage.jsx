import React, { useState } from 'react';
import styled from 'styled-components';
import { RepositoryForm } from '../shared/RepositoryForm';
import { BranchSelect } from '../shared/BranchSelect';
import { CommitHeatmap } from '../shared/CommitHeatmap';
import { QualityGauge } from '../shared/QualityGauge';

const Wrapper = styled.main`
  max-width: 960px;
  margin: 32px auto;
  padding: 24px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Header = styled.header`
  margin-bottom: 16px;
  h1 { margin: 0 0 8px; font-size: 24px; }
  p { margin: 0; color: ${({ theme }) => theme.colors.textSecondary}; }
`;

export default function HomePage() {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('');

  return (
    <Wrapper>
      <Header>
        <h1>GitLog 분석</h1>
        <p>공개 레포지토리 주소를 입력해 커밋 패턴과 품질을 분석하세요.</p>
      </Header>
      <RepositoryForm onSubmit={(o, r) => { setOwner(o); setRepo(r); setBranch(''); }} />
      {!!owner && !!repo && (
        <>
          <BranchSelect owner={owner} repo={repo} value={branch} onChange={setBranch} />
          <CommitHeatmap owner={owner} repo={repo} branch={branch} />
          <QualityGauge owner={owner} repo={repo} branch={branch} />
        </>
      )}
    </Wrapper>
  );
}


