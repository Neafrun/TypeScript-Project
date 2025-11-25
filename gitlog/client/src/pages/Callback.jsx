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
  const [status, setStatus] = useState('Completing authentication...');
  
  useEffect(() => {
    console.log('🔄 [Callback] 컴포넌트 마운트됨, URL 파라미터 처리 시작');
    
    const processCallback = async () => {
      try {
        setStatus('Fetching authentication information from GitHub...');
        
        // URL에서 token과 user 파라미터 추출 (백엔드에서 리다이렉트된 경우)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const user = urlParams.get('user');
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        console.log('🔍 [Callback] URL 파라미터 확인:', {
          hasToken: !!token,
          hasUser: !!user,
          hasCode: !!code,
          hasError: !!error,
          tokenLength: token?.length,
          userLength: user?.length
        });

        // GitHub에서 오류가 발생한 경우
        if (error) {
          console.error('❌ GitHub OAuth 오류:', error, errorDescription);
          setStatus(`GitHub authentication error: ${error} - ${errorDescription || 'Unknown error'}`);
          setTimeout(() => {
            window.location.href = '/';
          }, 5000);
          return;
        }

        // 백엔드에서 리다이렉트된 경우 (토큰이 있는 경우)
        if (token && user) {
          console.log('✅ [Callback] 토큰과 사용자 데이터 발견, 로그인 처리 시작');
          setStatus('Completing login...');
          
          try {
            // URL 디코딩 및 JSON 파싱
            let decodedUser = user;
            try {
              decodedUser = decodeURIComponent(user);
              console.log('✅ [Callback] URL 디코딩 성공');
            } catch (e) {
              // 이미 디코딩된 경우
              console.log('⚠️ [Callback] URL 디코딩 불필요 (이미 디코딩됨)');
              decodedUser = user;
            }
            
            console.log('🔍 [Callback] 디코딩된 user 데이터 길이:', decodedUser.length);
            const userData = JSON.parse(decodedUser);
            
            console.log('✅ [Callback] 사용자 데이터 파싱 성공:', {
              id: userData.id,
              login: userData.login,
              name: userData.name
            });
            console.log('✅ [Callback] 토큰 저장:', token.substring(0, 20) + '...');
            
            // localStorage에 토큰 저장
            try {
              localStorage.setItem('gitlog_token', token);
              localStorage.setItem('gitlog_user', JSON.stringify(userData));
              console.log('✅ [Callback] localStorage에 저장 완료');
            } catch (storageError) {
              console.error('❌ [Callback] localStorage 저장 실패:', storageError);
            }
            
            // AuthContext 상태 업데이트
            setToken(token);
            setUser(userData);
            
            console.log('✅ [Callback] AuthContext 상태 업데이트 완료');
            setStatus('Login completed! Redirecting to homepage...');
            
            // URL에서 토큰과 user 파라미터 제거하고 리다이렉트
            setTimeout(() => {
              console.log('🔄 [Callback] 홈페이지로 리다이렉트');
              window.history.replaceState({}, document.title, '/callback');
              window.location.href = '/';
            }, 1000);
            
          } catch (parseError) {
            console.error('❌ [Callback] 사용자 데이터 파싱 오류:', parseError);
            console.error('❌ [Callback] 오류 상세:', {
              message: parseError.message,
              stack: parseError.stack
            });
            console.error('❌ [Callback] 원본 user 데이터 (처음 100자):', user?.substring(0, 100));
            setStatus(`An error occurred: ${parseError.message}`);
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
          }
        } else if (code) {
          // GitHub에서 직접 리다이렉트된 경우 (code가 있는 경우)
          console.log('🔄 [Callback] GitHub 인증 코드 발견, handleCallback 호출');
          setStatus('Processing authentication code...');
          handleCallback(code, state);
        } else {
          console.warn('⚠️ [Callback] 인증 데이터 없음');
          setStatus('No authentication data found. Redirecting to home...');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      } catch (error) {
        console.error('❌ 콜백 처리 오류:', error);
        setStatus(`Authentication failed: ${error.message || 'Unknown error'}`);
        setTimeout(() => {
          window.location.href = '/';
        }, 5000);
      }
    };

    processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 한 번만 실행되도록 빈 배열 사용

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