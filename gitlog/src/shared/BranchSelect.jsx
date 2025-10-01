import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getBranches } from '../services/github';

const Row = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 8px 0 16px;
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid #e2e8f0;
  background: #fff;
`;

export function BranchSelect({ owner, repo, value, onChange }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!owner || !repo) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await getBranches(owner, repo);
        if (!cancelled) setBranches(list);
      } catch (e) {
        if (!cancelled) setError(e?.message || '브랜치 조회 실패');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [owner, repo]);

  if (!owner || !repo) return null;
  if (loading) return <Row>브랜치 불러오는 중…</Row>;
  if (error) return <Row>오류: {error}</Row>;

  return (
    <Row>
      <label>브랜치</label>
      <Select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">기본 브랜치</option>
        {branches.map(b => (
          <option key={b.name} value={b.name}>{b.name}</option>
        ))}
      </Select>
    </Row>
  );
}


