import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const CallbackContainer = styled.div`
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f6f8fa;
  padding: 2rem;
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
  const [status, setStatus] = useState('인증을 완료하는 중...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        setStatus('GitHub에서 인증 정보를 가져오는 중...');
        
        // OAuth 콜백 처리
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code && state) {
          setStatus('로그인을 처리하는 중...');
          await handleCallback(code, state);
        } else {
          setStatus('인증 코드를 찾을 수 없습니다. 홈으로 이동합니다...');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } catch (error) {
        console.error('콜백 처리 오류:', error);
        setStatus('인증에 실패했습니다. 홈으로 이동합니다...');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    };

    processCallback();
  }, [handleCallback]);

  return (
    <Layout>
      <CallbackContainer>
        <LoadingCard>
          <Spinner />
          <p>{status}</p>
        </LoadingCard>
      </CallbackContainer>
    </Layout>
  );
};

export default Callback;