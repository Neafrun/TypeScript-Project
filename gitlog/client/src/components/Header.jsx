import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  color: white;
  padding: 1rem 2rem;
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

  &:hover {
    opacity: 0.7;
    transform: translateY(-1px);
  }
`;

const Avatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
`;

const Separator = styled.div`
  height: 1px;
  background-color: #e0e0e0;
  width: 100%;
`;

const Header = () => {
  const { user, login, logout } = useAuth();
  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <LogoSection>
            <a href="/"><LogoImage src="/gitlog.png" alt="GitLog Logo" /></a>
            <a href="/"><Logo>GitLog</Logo></a>
          </LogoSection>
          <Nav>
            <NavLink href="/">홈</NavLink>
            <NavLink href="/dashboard">대시보드</NavLink>
            {user ? (
              <>
                {user.avatar_url && <Avatar src={user.avatar_url} alt={user.login} />}
                <StartButton href="#" onClick={(e) => { e.preventDefault(); logout(); }}>로그아웃</StartButton>
              </>
            ) : (
              <StartButton href="#" onClick={(e) => { e.preventDefault(); login(); }}>로그인</StartButton>
            )}
          </Nav>
        </HeaderContent>
      </HeaderContainer>
      <Separator />
    </>
  );
};

export default Header;