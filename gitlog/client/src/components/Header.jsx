import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const HeaderContainer = styled.header`
  background-color: #24292e;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 1.5rem;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const NavButton = styled.button`
  color: white;
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Avatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
`;

const Header = () => {
  const { user, login, logout } = useAuth();
  return (
    <HeaderContainer>
      <Logo>GitLog</Logo>
      <Nav>
        <NavLink href="/">홈</NavLink>
        <NavLink href="/dashboard">대시보드</NavLink>
        {user ? (
          <>
            {user.avatar_url && <Avatar src={user.avatar_url} alt={user.login} />}
            <NavButton onClick={logout}>로그아웃</NavButton>
          </>
        ) : (
          <NavButton onClick={login}>로그인</NavButton>
        )}
      </Nav>
    </HeaderContainer>
  );
};

export default Header;