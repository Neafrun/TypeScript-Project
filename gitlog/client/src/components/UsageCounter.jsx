import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost } from '../api/client';
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

const CancelButton = styled.button`
  background: #fff;
  color: #ff6b35;
  border: 1.5px solid #ff6b35;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
  
  &:hover {
    background: #fff5f2;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ConfirmContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
`;

const ConfirmTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: #191f28;
`;

const ConfirmMessage = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #8b95a1;
  line-height: 1.6;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  &.cancel {
    background: #f7f8fa;
    color: #191f28;
    
    &:hover {
      background: #e5e8eb;
    }
  }
  
  &.confirm {
    background: #ff6b35;
    color: white;
    
    &:hover {
      background: #ff8c42;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UsageCounter = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);


  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/user/usage');
      setUsage(response);
    } catch (error) {
      console.error('❌ [사용 횟수] 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUsage();
    } else {
      setLoading(false);
    }
  }, [user, fetchUsage]);

  // AI 분석 완료 시 사용 현황 자동 업데이트
  useEffect(() => {
    if (!user) return;
    
    const handleUsageUpdate = () => {
      fetchUsage();
    };

    window.addEventListener('usageUpdate', handleUsageUpdate);
    return () => {
      window.removeEventListener('usageUpdate', handleUsageUpdate);
    };
  }, [user, fetchUsage]);

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      const response = await apiPost('/api/payment/cancel', {});
      
      if (response.success) {
        console.log('✅ [구독 취소] 구독 취소 완료');
        setShowCancelConfirm(false);
        // 사용 정보 다시 가져오기
        await fetchUsage();
        alert('구독이 취소되었습니다.');
      } else {
        alert(response.error || '구독 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ [구독 취소] 오류:', error);
      alert(error.message || '구독 취소 중 오류가 발생했습니다.');
    } finally {
      setCancelling(false);
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
              <CancelButton onClick={() => setShowCancelConfirm(true)}>
                구독 취소
              </CancelButton>
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
      
      {showCancelConfirm && (
        <ConfirmModal onClick={() => !cancelling && setShowCancelConfirm(false)}>
          <ConfirmContent onClick={(e) => e.stopPropagation()}>
            <ConfirmTitle>구독 취소 확인</ConfirmTitle>
            <ConfirmMessage>
              정말 구독을 취소하시겠습니까?<br />
              구독을 취소하면 즉시 프리미엄 기능을 사용할 수 없게 됩니다.<br />
              이미 지불한 금액에 대한 환불은 지원되지 않습니다.
            </ConfirmMessage>
            <ConfirmButtons>
              <ConfirmButton 
                className="cancel" 
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
              >
                취소
              </ConfirmButton>
              <ConfirmButton 
                className="confirm" 
                onClick={handleCancelSubscription}
                disabled={cancelling}
              >
                {cancelling ? '처리 중...' : '구독 취소'}
              </ConfirmButton>
            </ConfirmButtons>
          </ConfirmContent>
        </ConfirmModal>
      )}
    </UsageCard>
  );
};

export default UsageCounter;
