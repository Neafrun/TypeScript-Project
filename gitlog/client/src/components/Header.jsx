import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import LanguageToggle from './LanguageToggle';

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
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const LogoImage = styled.img`
  width: 32px;
  height: 32px;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #000;
`;

const Nav = styled.nav`
  display: flex;
  gap: 3rem;
  align-items: center;
  flex: 2;
  justify-content: center;
`;

const NavLink = styled.a`
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
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: flex-end;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #d1d5da;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.2);
  min-width: 200px;
  z-index: 1000;
  margin-top: 8px;
  overflow: hidden;
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


const Separator = styled.div`
  height: 1px;
  background-color: #e0e0e0;
  width: 100%;
`;

const Header = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <LogoSection>
            <a href="/"><LogoImage src="/gitlog.png" alt="GitLog Logo" /></a>
            <a href="/"><Logo>GitLog</Logo></a>
          </LogoSection>
          <Nav>
            {user && <NavLink href="/dashboard">{t('navigation.dashboard')}</NavLink>}
            <NavLink href="/repository-analysis">{t('navigation.analysis')}</NavLink>
            {user && <NavLink href="/ai-analysis">{t('navigation.aiAnalysis')}</NavLink>}
            {loading ? (
              <StartButton href="#" style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                {t('common.loading')}
              </StartButton>
            ) : user ? (
              <ProfileSection ref={dropdownRef}>
                <Avatar 
                  src={user.avatar_url} 
                  alt={user.login}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
                {isDropdownOpen && (
                  <DropdownMenu>
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
                      {t('navigation.dashboard')}
                    </DropdownItem>
                    <DropdownItem href="#" onClick={(e) => { e.preventDefault(); navigate('/repository-analysis'); }}>
                      {t('navigation.analysis')}
                    </DropdownItem>
                    <DropdownItem href="#" onClick={(e) => { e.preventDefault(); navigate('/ai-analysis'); }}>
                      {t('navigation.aiAnalysis')}
                    </DropdownItem>
                    <DropdownItem href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
                      {t('navigation.logout')}
                    </DropdownItem>
                  </DropdownMenu>
                )}
              </ProfileSection>
            ) : (
              <StartButton 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  navigate('/login');
                }}
              >
                {t('navigation.login')}
              </StartButton>
            )}
          </Nav>
          <RightSection>
            <LanguageToggle />
          </RightSection>
        </HeaderContent>
      </HeaderContainer>
      <Separator />
    </>
  );
};

export default Header;