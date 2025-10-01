import React, { useState } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  margin: 16px 0 24px;
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid #e2e8f0;
  background: #fff;
`;

const Button = styled.button`
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 0;
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  cursor: pointer;
`;

export function RepositoryForm({ onSubmit }) {
  const [input, setInput] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim().replace(/^https?:\/\/github.com\//, '');
    const [owner, repo] = trimmed.split('/');
    if (!owner || !repo) return;
    onSubmit(owner, repo);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        placeholder="예: https://github.com/facebook/react"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Input
        placeholder="owner"
        value={input.split('/')[0] || ''}
        onChange={(e) => setInput(`${e.target.value}/${input.split('/')[1] || ''}`)}
      />
      <Button type="submit">분석</Button>
    </Form>
  );
}


