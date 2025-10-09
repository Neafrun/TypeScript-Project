import React from 'react';
import styled from 'styled-components';

const PremiumFeatureContainer = styled.div`
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  }
`;

const PremiumBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #007bff;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: #333;
`;

const FeatureDescription = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  color: #666;
`;

const LoginPrompt = styled.div`
  background: #f1f3f4;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #dee2e6;
`;

const LoginButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }
`;

const PremiumFeature = ({ title, description, isLoggedIn, onLoginClick, children }) => {
  // 디버깅용 로그
  console.log('🔍 [PremiumFeature] 상태 확인:', {
    title: title,
    isLoggedIn: isLoggedIn,
    children: children
  });
  
  return (
    <PremiumFeatureContainer>
      <PremiumBadge>
        <span>✨</span>
        <span>Premium Feature</span>
      </PremiumBadge>
      
      <FeatureTitle>{title}</FeatureTitle>
      <FeatureDescription>{description}</FeatureDescription>
      
      {isLoggedIn ? (
        children
      ) : (
        <LoginPrompt>
          <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
            이 고급 기능을 사용하려면 GitHub 로그인이 필요합니다.
          </p>
          <LoginButton onClick={onLoginClick}>
            GitHub로 로그인하기
          </LoginButton>
        </LoginPrompt>
      )}
    </PremiumFeatureContainer>
  );
};

export default PremiumFeature;
