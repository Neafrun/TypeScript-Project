import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PaymentModal from './PaymentModal';
import { apiGet, apiPost } from '../api/client';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  color: white;
  padding: 1rem 2rem;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  position: relative;
  z-index: 10;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  min-width: 0;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
  min-width: 0;
`;

const LogoImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #000;
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
  flex: 1 1 auto;
  justify-content: center;
  flex-wrap: nowrap;
  min-width: 0;
  overflow: hidden;
`;

const NavLink = styled.a`
  color: #000;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  white-space: nowrap;

  &:hover {
    opacity: 0.7;
    transform: translateY(-1px);
  }
`;

const StartButton = styled.a`
  color: #000;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  &:hover {
    opacity: 0.7;
    transform: translateY(-1px);
  }
`;

const ProfileSection = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 10001;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 0 0 auto;
  justify-content: flex-end;
  min-width: 0;
`;

const AvatarWrapper = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: block;
  pointer-events: none;
  object-fit: cover;
  background-color: rgba(255, 255, 255, 0.2);
`;

const AvatarPlaceholder = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
  pointer-events: none;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #d1d5da;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.2);
  min-width: 200px;
  z-index: 10000;
  overflow: hidden;
  display: block;
  visibility: visible;
  opacity: 1;
`;

const DropdownHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #d1d5da;
  background: #f6f8fa;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #24292e;
  font-size: 14px;
  margin-bottom: 2px;
`;

const UserEmail = styled.div`
  color: #656d76;
  font-size: 12px;
`;

const UserGitHub = styled.div`
  color: #0969da;
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
  word-break: break-all;
  margin-top: 4px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const DropdownItem = styled.a`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  color: #24292e;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  &:hover {
    background-color: #f6f8fa;
  }

  &:last-child {
    border-top: 1px solid #d1d5da;
    color: #d73a49;
    font-weight: 500;
  }
`;

const SubscribeButton = styled.button`
  background: ${props => props.premium ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ff6b35'};
  color: white;
  border: none;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  letter-spacing: -0.01em;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background: ${props => props.premium ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : '#ff8c42'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SubscriptionModal = styled.div`
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

const SubscriptionContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  max-width: 450px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
`;

const SubscriptionHeader = styled.div`
  padding: 24px 24px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SubscriptionTitle = styled.h2`
  margin: 0;
  color: #191f28;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const SubscriptionBody = styled.div`
  padding: 24px;
`;

const SubscriptionInfo = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  margin-bottom: 24px;
`;

const SubscriptionStatus = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const SubscriptionExpiry = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const SubscriptionActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 12px 20px;
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
  
  &.subscribe {
    background: #ff6b35;
    color: white;
    
    &:hover {
      background: #ff8c42;
    }
  }
  
  &.unsubscribe {
    background: #fff;
    color: #ff6b35;
    border: 1.5px solid #ff6b35;
    
    &:hover {
      background: #fff5f2;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmCancelModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 1rem;
`;

const ConfirmCancelContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
`;

const ConfirmCancelTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: #191f28;
`;

const ConfirmCancelMessage = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #8b95a1;
  line-height: 1.6;
`;

const ConfirmCancelButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;


const Separator = styled.div`
  height: 1px;
  background-color: #e0e0e0;
  width: 100%;
`;

const Header = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef(null);

  // 사용자 구독 상태 가져오기
  useEffect(() => {
    if (user) {
      fetchUsage();
      setAvatarError(false); // 사용자가 변경되면 아바타 에러 상태 초기화
    } else {
      setUsage(null);
      setAvatarError(false);
    }
  }, [user]);

  const fetchUsage = async () => {
    try {
      setUsageLoading(true);
      const response = await apiGet('/api/user/usage');
      setUsage(response);
    } catch (error) {
      console.error('❌ [구독 상태] 조회 실패:', error);
      setUsage(null);
    } finally {
      setUsageLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      const response = await apiPost('/api/payment/cancel', {});
      
      if (response.success) {
        console.log('✅ [구독 취소] 구독 취소 완료');
        setShowCancelConfirm(false);
        setShowSubscriptionModal(false);
        await fetchUsage();
        alert('구독이 취소되었습니다.');
        window.location.reload();
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

  const isPremium = usage?.isPremium && usage?.isPremiumActive;

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      // ProfileSection 내부 클릭은 무시 (드롭다운 토글을 위해)
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    // mousedown 이벤트를 사용하여 click 이벤트보다 먼저 처리
    // 이렇게 하면 Avatar 클릭 이벤트가 처리된 후에 외부 클릭을 감지할 수 있음
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <LogoSection>
            <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <LogoImage 
                src="/gitlog.png" 
                alt="GitLog Logo"
                onError={(e) => {
                  console.error('로고 이미지 로드 실패');
                  e.target.style.display = 'none';
                }}
              />
            </a>
            <a href="/" style={{ textDecoration: 'none' }}>
              <Logo>GitLog</Logo>
            </a>
          </LogoSection>
          <Nav>
            {user && <NavLink href="/dashboard">대시보드</NavLink>}
            <NavLink href="/repository-analysis">저장소 분석</NavLink>
            {user && <NavLink href="/ai-analysis">AI 분석</NavLink>}
            {loading ? (
              <StartButton href="#" style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                로딩 중...
              </StartButton>
            ) : user ? (
              <>
                <SubscribeButton 
                  premium={isPremium}
                  onClick={() => isPremium ? setShowSubscriptionModal(true) : setShowPaymentModal(true)}
                  style={{ marginRight: '1rem' }}
                >
                  {isPremium ? '✨ 프리미엄' : '💳 구독하기'}
                </SubscribeButton>
                <ProfileSection ref={dropdownRef}>
                  <AvatarWrapper
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDropdownOpen(prev => !prev);
                    }}
                    onMouseDown={(e) => {
                      // mousedown 이벤트도 전파 중지하여 외부 클릭 핸들러와 충돌 방지
                      e.stopPropagation();
                    }}
                    type="button"
                    aria-label="프로필 메뉴"
                  >
                    {user.avatar_url && !avatarError ? (
                      <Avatar 
                        src={user.avatar_url} 
                        alt={user.login || user.name || 'User'}
                        onError={(e) => {
                          console.error('아바타 이미지 로드 실패:', user.avatar_url);
                          setAvatarError(true);
                        }}
                      />
                    ) : (
                      <AvatarPlaceholder>
                        {(user.login || user.name || 'U').charAt(0).toUpperCase()}
                      </AvatarPlaceholder>
                    )}
                  </AvatarWrapper>
                  {isDropdownOpen && (
                    <DropdownMenu onClick={(e) => e.stopPropagation()}>
                      <DropdownHeader>
                        <UserName>{user.name || user.login}</UserName>
                        <UserGitHub 
                          onClick={() => window.open(user.html_url, '_blank')}
                          title="Open GitHub Profile"
                        >
                          {user.html_url}
                        </UserGitHub>
                      </DropdownHeader>
                      <DropdownItem href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
                        대시보드
                      </DropdownItem>
                      <DropdownItem href="#" onClick={(e) => { e.preventDefault(); navigate('/repository-analysis'); }}>
                        저장소 분석
                      </DropdownItem>
                      <DropdownItem href="#" onClick={(e) => { e.preventDefault(); navigate('/ai-analysis'); }}>
                        AI 분석
                      </DropdownItem>
                      <Separator style={{ margin: '4px 0' }} />
                      <DropdownItem href="#" onClick={(e) => { 
                        e.preventDefault(); 
                        if (isPremium) {
                          setShowSubscriptionModal(true);
                        } else {
                          setShowPaymentModal(true);
                        }
                        setIsDropdownOpen(false); 
                      }}>
                        {isPremium ? '✨ 프리미엄 관리' : '💳 구독하기'}
                      </DropdownItem>
                      <DropdownItem href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
                        로그아웃
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </ProfileSection>
              </>
            ) : (
              <StartButton 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  navigate('/login');
                }}
              >
                로그인
              </StartButton>
            )}
          </Nav>
          <RightSection>
          </RightSection>
        </HeaderContent>
      </HeaderContainer>
      <Separator />
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setShowPaymentModal(false);
          fetchUsage();
          window.location.reload();
        }}
      />

      {/* 구독 관리 모달 */}
      {showSubscriptionModal && usage && isPremium && (
        <SubscriptionModal onClick={() => setShowSubscriptionModal(false)}>
          <SubscriptionContent onClick={(e) => e.stopPropagation()}>
            <SubscriptionHeader>
              <SubscriptionTitle>프리미엄 구독 관리</SubscriptionTitle>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#8b95a1',
                  padding: 0,
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f7f8fa';
                  e.target.style.color = '#191f28';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#8b95a1';
                }}
              >
                ×
              </button>
            </SubscriptionHeader>
            <SubscriptionBody>
              <SubscriptionInfo>
                <SubscriptionStatus>✨ 프리미엄 구독 중</SubscriptionStatus>
                {usage.premiumExpiresAt && (
                  <SubscriptionExpiry>
                    만료일: {new Date(usage.premiumExpiresAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </SubscriptionExpiry>
                )}
              </SubscriptionInfo>
              <SubscriptionActions>
                <ActionButton
                  className="unsubscribe"
                  onClick={() => {
                    setShowSubscriptionModal(false);
                    setShowCancelConfirm(true);
                  }}
                >
                  구독 취소
                </ActionButton>
                <ActionButton
                  className="cancel"
                  onClick={() => setShowSubscriptionModal(false)}
                >
                  닫기
                </ActionButton>
              </SubscriptionActions>
            </SubscriptionBody>
          </SubscriptionContent>
        </SubscriptionModal>
      )}

      {/* 구독 취소 확인 모달 */}
      {showCancelConfirm && (
        <ConfirmCancelModal onClick={() => !cancelling && setShowCancelConfirm(false)}>
          <ConfirmCancelContent onClick={(e) => e.stopPropagation()}>
            <ConfirmCancelTitle>구독 취소 확인</ConfirmCancelTitle>
            <ConfirmCancelMessage>
              정말 구독을 취소하시겠습니까?<br />
              구독을 취소하면 즉시 프리미엄 기능을 사용할 수 없게 됩니다.<br />
              이미 지불한 금액에 대한 환불은 지원되지 않습니다.
            </ConfirmCancelMessage>
            <ConfirmCancelButtons>
              <ActionButton 
                className="cancel" 
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
              >
                취소
              </ActionButton>
              <ActionButton 
                className="subscribe" 
                onClick={handleCancelSubscription}
                disabled={cancelling}
              >
                {cancelling ? '처리 중...' : '구독 취소'}
              </ActionButton>
            </ConfirmCancelButtons>
          </ConfirmCancelContent>
        </ConfirmCancelModal>
      )}
    </>
  );
};

export default Header;