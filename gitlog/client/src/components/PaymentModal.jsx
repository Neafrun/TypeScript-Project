import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiGet, apiPost } from '../api/client';
import { useTranslation } from '../hooks/useTranslation';

const ModalOverlay = styled.div`
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
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 24px 24px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #191f28;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #8b95a1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f7f8fa;
    color: #191f28;
  }
`;

const PlansContainer = styled.div`
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PlanCard = styled.div`
  border: 1.5px solid ${props => props.selected ? '#ff6b35' : '#e5e8eb'};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  background: ${props => props.selected ? '#fff5f2' : 'white'};
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    border-color: ${props => props.selected ? '#ff6b35' : '#d1d6db'};
  }
`;

const PlanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const PlanName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #191f28;
  letter-spacing: -0.01em;
`;

const PlanPrice = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #ff6b35;
  letter-spacing: -0.02em;
`;

const PlanFeatures = styled.div`
  font-size: 14px;
  color: #8b95a1;
  line-height: 1.5;
  margin-top: 8px;
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ff6b35;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
`;

const PaymentButton = styled.button`
  width: calc(100% - 48px);
  margin: 0 24px 24px;
  background: ${props => props.disabled ? '#e5e8eb' : '#ff6b35'};
  color: white;
  border: none;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  
  &:hover:not(:disabled) {
    background: #ff8c42;
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const ErrorMessage = styled.div`
  margin: 0 24px 16px;
  background: #fff1f2;
  color: #d32f2f;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #ffebee;
`;

const SuccessMessage = styled.div`
  margin: 0 24px 16px;
  background: #f0fdf4;
  color: #166534;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #dcfce7;
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const response = await apiGet('/api/payment/plans');
      setPlans(response.plans || []);
      if (response.plans && response.plans.length > 0) {
        setSelectedPlan(response.plans[0].id);
      }
    } catch (error) {
      console.error('❌ [플랜 정보] 조회 실패:', error);
      setError('플랜 정보를 불러올 수 없습니다.');
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // 더미 결제 시뮬레이션 (2초 대기 후 성공)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      console.log('💳 [더미 결제] 결제 처리 시작:', {
        plan: selectedPlan,
        paymentId
      });

      const response = await apiPost('/api/payment/verify', {
        paymentId,
        planType: selectedPlan,
        provider: 'dummy'
      });

      if (response.success) {
        console.log('✅ [더미 결제] 결제 성공:', response);
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError('결제 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ [결제] 오류:', error);
      setError(error.message || '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>구독 플랜 선택</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && (
          <SuccessMessage>
            결제가 완료되었습니다
          </SuccessMessage>
        )}

        <PlansContainer>
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              selected={selectedPlan === plan.id}
              onClick={() => !loading && !success && setSelectedPlan(plan.id)}
            >
              {selectedPlan === plan.id && <SelectedBadge>선택됨</SelectedBadge>}
              <PlanHeader>
                <div>
                  <PlanName>{plan.name}</PlanName>
                  <PlanFeatures style={{ marginTop: '4px' }}>
                    {plan.analysisLimit === -1 ? '무제한 분석' : `${plan.analysisLimit}회 분석`}
                    {plan.duration && ` · ${plan.duration}일간 유효`}
                  </PlanFeatures>
                </div>
                <PlanPrice>{plan.price.toLocaleString()}원</PlanPrice>
              </PlanHeader>
            </PlanCard>
          ))}
        </PlansContainer>

        <PaymentButton onClick={handlePayment} disabled={loading || success}>
          {loading ? (
            <>
              <LoadingSpinner />
              결제 처리 중...
            </>
          ) : success ? (
            '결제 완료'
          ) : (
            '결제하기'
          )}
        </PaymentButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PaymentModal;
