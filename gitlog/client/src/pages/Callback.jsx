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
  max-width: 600px;
  width: 100%;
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
  const { handleCallback, setUser, setToken } = useAuth();
  const [status, setStatus] = useState('인증을 완료하는 중...');
  useEffect(() => {
    const processCallback = async () => {
      try {
        setStatus('GitHub에서 인증 정보를 가져오는 중...');
        
        // URL에서 token과 user 파라미터 추출 (백엔드에서 리다이렉트된 경우)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const user = urlParams.get('user');
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // GitHub에서 오류가 발생한 경우
        if (error) {
          console.error('❌ GitHub OAuth 오류:', error, errorDescription);
          setStatus(`GitHub 인증 오류: ${error} - ${errorDescription || '알 수 없는 오류'}`);
          setTimeout(() => {
            window.location.href = '/';
          }, 5000);
          return;
        }

        // 백엔드에서 리다이렉트된 경우 (토큰이 있는 경우)
        if (token && user) {
          setStatus('로그인을 완료하는 중...');
          
          try {
            const userData = JSON.parse(decodeURIComponent(user));
            
            // localStorage에 토큰 저장
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // AuthContext 상태 업데이트
            setToken(token);
            setUser(userData);
            
            setStatus('로그인 완료! 홈페이지로 이동합니다...');
            
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
            
          } catch (parseError) {
            console.error('❌ 사용자 데이터 파싱 오류:', parseError);
            setStatus('로그인 처리 중 오류가 발생했습니다.');
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          }
        } else if (code) {
          setStatus('인증 코드를 찾을 수 없습니다. 홈으로 이동합니다...');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      } catch (error) {
        console.error('❌ 콜백 처리 오류:', error);
        setStatus(`인증 실패: ${error.message || '알 수 없는 오류'}`);
        setTimeout(() => {
          window.location.href = '/';
        }, 5000);
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