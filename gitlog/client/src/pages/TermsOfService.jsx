import React from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';

const TermsContainer = styled.div`
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

const WarningBox = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
`;

const TermsOfService = () => {
  return (
    <Layout>
      <TermsContainer>
        <ContentWrapper>
          <Title>이용약관</Title>
          <LastUpdated>최종 업데이트: 2024년 10월 9일</LastUpdated>

          <Section>
            <SectionTitle>제1조 (목적)</SectionTitle>
            <Paragraph>
              이 약관은 GitLog 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>제2조 (정의)</SectionTitle>
            <Paragraph>이 약관에서 사용하는 용어의 정의는 다음과 같습니다:</Paragraph>
            <List>
              <ListItem><Highlight>"서비스"</Highlight>란 GitLog가 제공하는 GitHub 프로젝트 분석 및 시각화 서비스를 의미합니다.</ListItem>
              <ListItem><Highlight>"이용자"</Highlight>란 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원을 의미합니다.</ListItem>
              <ListItem><Highlight>"회원"</Highlight>이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>제3조 (약관의 효력 및 변경)</SectionTitle>
            <Paragraph>
              이 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다. 
              회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>제4조 (서비스의 제공)</SectionTitle>
            <Paragraph>GitLog는 다음과 같은 서비스를 제공합니다:</Paragraph>
            <List>
              <ListItem>GitHub 프로젝트 분석 및 통계 제공</ListItem>
              <ListItem>커밋 히트맵 및 트렌드 시각화</ListItem>
              <ListItem>팀 협업 및 기여도 분석</ListItem>
              <ListItem>프로젝트 품질 지표 제공</ListItem>
              <ListItem>기타 GitLog가 정하는 서비스</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>제5조 (서비스의 중단)</SectionTitle>
            <Paragraph>
              회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 
              서비스의 제공을 일시적으로 중단할 수 있습니다. 이 경우 서비스 일시 중단 사실과 그 사유를 사전에 공지합니다.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>제6조 (회원가입)</SectionTitle>
            <Paragraph>
              이용자는 GitHub OAuth를 통해 회원가입을 신청할 수 있으며, 회사는 다음 각 호에 해당하지 않는 한 신청을 승낙합니다:
            </Paragraph>
            <List>
              <ListItem>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</ListItem>
              <ListItem>등록 내용에 허위, 기재누락, 오기가 있는 경우</ListItem>
              <ListItem>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>제7조 (회원 탈퇴 및 자격 상실)</SectionTitle>
            <Paragraph>
              회원은 언제든지 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다. 
              회사는 회원이 다음 각 호에 해당하는 경우 회원자격을 제한 및 정지시킬 수 있습니다:
            </Paragraph>
            <List>
              <ListItem>다른 이용자의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</ListItem>
              <ListItem>서비스를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>제8조 (개인정보보호)</SectionTitle>
            <Paragraph>
              회사는 이용자의 개인정보 수집시 서비스제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다. 
              자세한 내용은 개인정보처리방침을 참조하시기 바랍니다.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>제9조 (회사의 의무)</SectionTitle>
            <Paragraph>회사는 다음과 같은 의무를 가집니다:</Paragraph>
            <List>
              <ListItem>법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.</ListItem>
              <ListItem>이용자가 안전하게 인터넷 서비스를 이용할 수 있도록 개인정보보호를 위한 보안 시스템을 구축하여야 합니다.</ListItem>
              <ListItem>이용자의 개인정보를 본인의 승낙없이 타인에게 누설, 배포하지 않아야 합니다.</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>제10조 (이용자의 의무)</SectionTitle>
            <Paragraph>이용자는 다음 행위를 하여서는 안 됩니다:</Paragraph>
            <List>
              <ListItem>신청 또는 변경시 허위 내용의 등록</ListItem>
              <ListItem>타인의 정보 도용</ListItem>
              <ListItem>회사가 게시한 정보의 변경</ListItem>
              <ListItem>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</ListItem>
              <ListItem>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</ListItem>
              <ListItem>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>제11조 (저작권의 귀속 및 이용제한)</SectionTitle>
            <Paragraph>
              회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다. 
              이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 
              회사의 사전 승낙없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 
              제3자에게 이용하게 하여서는 안됩니다.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>제12조 (면책조항)</SectionTitle>
            <WarningBox>
              <Paragraph>
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 
                서비스 제공에 관한 책임이 면제됩니다. 또한 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
              </Paragraph>
            </WarningBox>
          </Section>

          <Section>
            <SectionTitle>제13조 (준거법 및 관할법원)</SectionTitle>
            <Paragraph>
              이 약관의 해석 및 회사와 이용자 간의 분쟁에 대하여는 대한민국의 법을 적용하며, 
              서울중앙지방법원을 전속적 관할법원으로 합니다.
            </Paragraph>
          </Section>
        </ContentWrapper>
      </TermsContainer>
    </Layout>
  );
};

export default TermsOfService;

