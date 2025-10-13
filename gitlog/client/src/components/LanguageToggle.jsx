import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const ToggleContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ToggleButton = styled.button`
  background: #ff6b35;
  color: #fff;
  border: 1px solid #ff6b35;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  min-width: 100px;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  position: relative;

  &:hover {
    background: #e55a2b;
    border-color: #e55a2b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(255, 107, 53, 0.3);
  }
`;

const LanguageText = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const TranslateIcon = styled.span`
  font-size: 0.8rem;
  opacity: 0.8;
`;

const LanguageIcon = styled.span`
  font-size: 1rem;
`;

const LanguageToggle = () => {
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageToggle = () => {
    const newLanguage = language === 'ko' ? 'en' : 'ko';
    changeLanguage(newLanguage);
  };

  return (
    <ToggleContainer>
      <ToggleButton 
        active={true}
        onClick={handleLanguageToggle}
        title={language === 'ko' ? t('common.switchToEnglish') : t('common.switchToKorean')}
      >
        <TranslateIcon>🌐</TranslateIcon>
        <LanguageText>
          <LanguageIcon>
            {language === 'ko' ? '🇰🇷' : '🇺🇸'}
          </LanguageIcon>
          {language === 'ko' ? '한국어' : 'English'}
        </LanguageText>
      </ToggleButton>
    </ToggleContainer>
  );
};

export default LanguageToggle;
