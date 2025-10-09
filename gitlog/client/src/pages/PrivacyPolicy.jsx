import React from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';

const PrivacyContainer = styled.div`
  background-color: #f6f8fa;
  min-height: calc(100vh - 200px);
  padding: 2rem;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #24292e;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const LastUpdated = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 3rem;
  font-style: italic;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h2`
  color: #ff6b35;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #ff6b35;
  padding-bottom: 0.5rem;
`;

const Paragraph = styled.p`
  color: #333;
  line-height: 1.8;
  margin-bottom: 1rem;
`;

const List = styled.ul`
  color: #333;
  line-height: 1.8;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
`;

const Highlight = styled.span`
  color: #ff6b35;
  font-weight: 600;
`;

const ContactInfo = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
`;

const PrivacyPolicy = () => {
  return (
    <Layout>
      <PrivacyContainer>
        <ContentWrapper>
          <Title>개인정보처리방침</Title>
          <LastUpdated>최종 업데이트: 2024년 10월 9일</LastUpdated>

          <Section>
            <SectionTitle>1. 개인정보 수집 및 이용 목적</SectionTitle>
            <Paragraph>
              GitLog는 GitHub OAuth를 통한 로그인 서비스를 제공하며, 다음과 같은 목적으로 개인정보를 수집 및 이용합니다:
            </Paragraph>
            <List>
              <ListItem>GitHub 계정을 통한 사용자 인증 및 서비스 제공</ListItem>
              <ListItem>프로젝트 분석 및 통계 데이터 생성</ListItem>
              <ListItem>서비스 개선 및 사용자 경험 향상</ListItem>
              <ListItem>고객 지원 및 문의 응답</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>2. 수집하는 개인정보 항목</SectionTitle>
            <Paragraph>
              GitLog는 GitHub OAuth 인증을 통해 다음과 같은 정보를 수집합니다:
            </Paragraph>
            <List>
              <ListItem><Highlight>필수 정보:</Highlight> GitHub 사용자 ID, 사용자명, 이메일 주소, 프로필 이미지 URL</ListItem>
              <ListItem><Highlight>선택 정보:</Highlight> GitHub 저장소 정보, 커밋 히스토리, 기여도 데이터</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>3. 개인정보 보유 및 이용 기간</SectionTitle>
            <Paragraph>
              수집된 개인정보는 다음의 기간 동안 보유 및 이용됩니다:
            </Paragraph>
            <List>
              <ListItem><Highlight>서비스 이용 기간:</Highlight> 회원 탈퇴 시까지</ListItem>
              <ListItem><Highlight>법정 보유 기간:</Highlight> 관련 법령에 따라 필요한 경우 해당 기간까지 보유</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>4. 개인정보 제3자 제공</SectionTitle>
            <Paragraph>
              GitLog는 원칙적으로 사용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
            </Paragraph>
            <List>
              <ListItem>사용자가 사전에 동의한 경우</ListItem>
              <ListItem>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>5. 개인정보 처리의 위탁</SectionTitle>
            <Paragraph>
              GitLog는 현재 개인정보 처리 업무를 외부에 위탁하지 않습니다. 향후 위탁이 필요한 경우, 
              위탁받는 자와 위탁하는 업무의 내용을 사전에 공지하고 동의를 받겠습니다.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>6. 개인정보의 안전성 확보 조치</SectionTitle>
            <Paragraph>
              GitLog는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
            </Paragraph>
            <List>
              <ListItem>개인정보 암호화 및 안전한 전송</ListItem>
              <ListItem>접근 권한의 제한 및 관리</ListItem>
              <ListItem>정기적인 보안 점검 및 업데이트</ListItem>
              <ListItem>개인정보 처리시스템의 접근 기록 보관 및 위변조 방지</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>7. 개인정보 보호책임자</SectionTitle>
            <ContactInfo>
              <Paragraph>
                <strong>개인정보 보호책임자:</strong> GitLog 개발팀<br/>
                <strong>연락처:</strong> privacy@gitlog.com<br/>
                <strong>주소:</strong> 대한민국 서울특별시
              </Paragraph>
            </ContactInfo>
          </Section>

          <Section>
            <SectionTitle>8. 개인정보처리방침의 변경</SectionTitle>
            <Paragraph>
              이 개인정보처리방침은 관련 법령 및 지침의 변경 또는 서비스의 변경에 따라 개정될 수 있습니다. 
              개정 시에는 시행일자와 주요 변경사항을 사전에 공지하겠습니다.
            </Paragraph>
          </Section>
        </ContentWrapper>
      </PrivacyContainer>
    </Layout>
  );
};

export default PrivacyPolicy;

