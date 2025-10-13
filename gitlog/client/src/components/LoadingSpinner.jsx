import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  flex-direction: column;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 0;
`;

const LoadingSpinner = ({ text }) => {
  const { t } = useTranslation();
  
  return (
    <SpinnerContainer>
      <Spinner />
      <LoadingText>{text || t('common.loading')}</LoadingText>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
