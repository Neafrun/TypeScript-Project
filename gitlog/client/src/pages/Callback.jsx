import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const CallbackContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f6f8fa;
`;

const LoadingCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #28a745;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Callback = () => {
  const { handleCallback } = useAuth();

  useEffect(() => {
    // OAuth 콜백 처리
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      handleCallback(code, state);
    } else {
      // 코드가 없으면 홈으로 리다이렉트
      window.location.href = '/';
    }
  }, [handleCallback]);

  return (
    <CallbackContainer>
      <LoadingCard>
        <Spinner />
        <p>인증을 완료하는 중...</p>
      </LoadingCard>
    </CallbackContainer>
  );
};

export default Callback;