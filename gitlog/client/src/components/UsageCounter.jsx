import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../api/client';
import { useTranslation } from '../hooks/useTranslation';

const UsageCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
`;

const UsageContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const UsageInfo = styled.div`
  flex: 1;
  min-width: 200px;
`;

const UsageTitle = styled.div`
  font-size: 14px;
  color: #8b95a1;
  margin-bottom: 8px;
  font-weight: 500;
`;

const UsageText = styled.div`
  font-size: 16px;
  color: #191f28;
  font-weight: 600;
  letter-spacing: -0.01em;
`;

const Badge = styled.div`
  background: ${props => props.premium ? 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)' : '#f7f8fa'};
  color: ${props => props.premium ? 'white' : '#191f28'};
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.01em;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  margin-top: 12px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #ff8c42 0%, #ff6b35 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
  width: ${props => props.percentage}%;
`;

const UsageCounter = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsage();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/user/usage');
      setUsage(response);
    } catch (error) {
      console.error('❌ [사용 횟수] 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  if (!usage) {
    return null;
  }

  const isPremium = usage.isPremium && usage.isPremiumActive;
  const freePercentage = usage.freeAnalysisLimit > 0 
    ? (usage.freeAnalysisUsed / usage.freeAnalysisLimit) * 100 
    : 0;

  return (
    <UsageCard>
      <UsageContent>
        <UsageInfo>
          <UsageTitle>사용 현황</UsageTitle>
          {isPremium ? (
            <>
              <UsageText>
                프리미엄 구독 중
              </UsageText>
              {usage.premiumExpiresAt && (
                <div style={{ fontSize: '13px', color: '#8b95a1', marginTop: '4px' }}>
                  만료일: {new Date(usage.premiumExpiresAt).toLocaleDateString('ko-KR')}
                </div>
              )}
            </>
          ) : (
            <>
              <UsageText>
                무료 분석 {usage.freeAnalysisRemaining}회 남음
              </UsageText>
              <ProgressBar>
                <ProgressFill percentage={freePercentage} />
              </ProgressBar>
              <div style={{ fontSize: '13px', color: '#8b95a1', marginTop: '8px' }}>
                {usage.freeAnalysisUsed}/{usage.freeAnalysisLimit}회 사용
              </div>
            </>
          )}
        </UsageInfo>
        <Badge premium={isPremium}>
          {isPremium ? '✨ 프리미엄' : `무료 ${usage.freeAnalysisRemaining}회`}
        </Badge>
      </UsageContent>
    </UsageCard>
  );
};

export default UsageCounter;
