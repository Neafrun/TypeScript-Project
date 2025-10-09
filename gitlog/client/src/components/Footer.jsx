import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: #f5f5f5;
  padding: 2rem 0;
  margin-top: auto;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LogoImage = styled.img`
  width: 32px;
  height: 32px;
`;

const LogoText = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
`;

const FooterRight = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const FooterLink = styled.a`
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  &:hover {
    color: #333;
  }
`;

const Copyright = styled.p`
  color: #999;
  font-size: 0.8rem;
  margin: 0;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterLeft>
          <FooterLogo>
            <LogoImage src="/gitlog.png" alt="GitLog Logo" />
            <LogoText>GitLog</LogoText>
          </FooterLogo>
          <Copyright>© 2024 GitLog. All rights reserved.</Copyright>
        </FooterLeft>
        <FooterRight>
          <FooterLink href="/privacy">개인정보처리방침</FooterLink>
          <FooterLink href="/terms">이용약관</FooterLink>
          <FooterLink href="/contact">문의하기</FooterLink>
        </FooterRight>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;