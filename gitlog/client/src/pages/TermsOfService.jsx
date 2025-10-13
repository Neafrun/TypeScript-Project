import React from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useTranslation } from '../hooks/useTranslation';

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
  const { t } = useTranslation();
  return (
    <Layout>
      <TermsContainer>
        <ContentWrapper>
          <Title>{t('terms.title')}</Title>
          <LastUpdated>{t('terms.lastUpdated')}: 2025년 10월 14일</LastUpdated>

          <Section>
            <SectionTitle>{t('terms.article1Title')}</SectionTitle>
            <Paragraph>
              {t('terms.article1Content')}
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>{t('terms.article2Title')}</SectionTitle>
            <Paragraph>{t('terms.article2Content')}</Paragraph>
            <List>
              <ListItem><Highlight>"{t('terms.service')}"</Highlight>{t('terms.serviceDefinition')}</ListItem>
              <ListItem><Highlight>"{t('terms.user')}"</Highlight>{t('terms.userDefinition')}</ListItem>
              <ListItem><Highlight>"{t('terms.member')}"</Highlight>{t('terms.memberDefinition')}</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>{t('terms.article3Title')}</SectionTitle>
            <Paragraph>
              {t('terms.article3Content')}
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>{t('terms.article4Title')}</SectionTitle>
            <Paragraph>{t('terms.article4Content')}</Paragraph>
            <List>
              <ListItem>{t('terms.service1')}</ListItem>
              <ListItem>{t('terms.service2')}</ListItem>
              <ListItem>{t('terms.service3')}</ListItem>
              <ListItem>{t('terms.service4')}</ListItem>
              <ListItem>{t('terms.service5')}</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>{t('terms.article5Title')}</SectionTitle>
            <Paragraph>
              {t('terms.article5Content')}
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>{t('terms.article6Title')}</SectionTitle>
            <Paragraph>
              {t('terms.article6Content')}
            </Paragraph>
            <List>
              <ListItem>{t('terms.registrationCondition1')}</ListItem>
              <ListItem>{t('terms.registrationCondition2')}</ListItem>
              <ListItem>{t('terms.registrationCondition3')}</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>{t('terms.article7Title')}</SectionTitle>
            <Paragraph>
              {t('terms.article7Content')}
            </Paragraph>
            <List>
              <ListItem>{t('terms.membershipRestriction1')}</ListItem>
              <ListItem>{t('terms.membershipRestriction2')}</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>{t('terms.article8Title')}</SectionTitle>
            <Paragraph>
              {t('terms.article8Content')}
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>{t('terms.article9Title')}</SectionTitle>
            <Paragraph>{t('terms.article9Content')}</Paragraph>
            <List>
              <ListItem>{t('terms.companyObligation1')}</ListItem>
              <ListItem>{t('terms.companyObligation2')}</ListItem>
              <ListItem>{t('terms.companyObligation3')}</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>{t('terms.article10Title')}</SectionTitle>
            <Paragraph>{t('terms.article10Content')}</Paragraph>
            <List>
              <ListItem>{t('terms.userProhibition1')}</ListItem>
              <ListItem>{t('terms.userProhibition2')}</ListItem>
              <ListItem>{t('terms.userProhibition3')}</ListItem>
              <ListItem>{t('terms.userProhibition4')}</ListItem>
              <ListItem>{t('terms.userProhibition5')}</ListItem>
              <ListItem>{t('terms.userProhibition6')}</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>{t('terms.article11Title')}</SectionTitle>
            <Paragraph>
              {t('terms.article11Content')}
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>{t('terms.article12Title')}</SectionTitle>
            <WarningBox>
              <Paragraph>
                {t('terms.article12Content')}
              </Paragraph>
            </WarningBox>
          </Section>

          <Section>
            <SectionTitle>{t('terms.article13Title')}</SectionTitle>
            <Paragraph>
              {t('terms.article13Content')}
            </Paragraph>
          </Section>
        </ContentWrapper>
      </TermsContainer>
    </Layout>
  );
};

export default TermsOfService;

