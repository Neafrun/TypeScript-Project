import React from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useTranslation } from '../hooks/useTranslation';

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
  const { t } = useTranslation();
  return (
    <Layout>
      <PrivacyContainer>
        <ContentWrapper>
          <Title>{t('privacy.title')}</Title>
          <LastUpdated>{t('privacy.lastUpdated')}: 2025년 10월 14일</LastUpdated>

          <Section>
            <SectionTitle>{t('privacy.section1Title')}</SectionTitle>
            <Paragraph>
              {t('privacy.section1Content')}
            </Paragraph>
            <List>
              <ListItem>{t('privacy.section1Item1')}</ListItem>
              <ListItem>{t('privacy.section1Item2')}</ListItem>
              <ListItem>{t('privacy.section1Item3')}</ListItem>
              <ListItem>{t('privacy.section1Item4')}</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>{t('privacy.section2Title')}</SectionTitle>
            <Paragraph>
              {t('privacy.section2Content')}
            </Paragraph>
            <List>
              <ListItem><Highlight>{t('privacy.requiredInfo')}:</Highlight> {t('privacy.requiredInfoDetails')}</ListItem>
              <ListItem><Highlight>{t('privacy.optionalInfo')}:</Highlight> {t('privacy.optionalInfoDetails')}</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>{t('privacy.section3Title')}</SectionTitle>
            <Paragraph>
              {t('privacy.section3Content')}
            </Paragraph>
            <List>
              <ListItem><Highlight>{t('privacy.servicePeriod')}:</Highlight> {t('privacy.servicePeriodDetails')}</ListItem>
              <ListItem><Highlight>{t('privacy.legalRetentionPeriod')}:</Highlight> {t('privacy.legalRetentionPeriodDetails')}</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>{t('privacy.section4Title')}</SectionTitle>
            <Paragraph>
              {t('privacy.section4Content')}
            </Paragraph>
            <List>
              <ListItem>{t('privacy.section4Item1')}</ListItem>
              <ListItem>{t('privacy.section4Item2')}</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>{t('privacy.section5Title')}</SectionTitle>
            <Paragraph>
              {t('privacy.section5Content')}
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>{t('privacy.section6Title')}</SectionTitle>
            <Paragraph>
              {t('privacy.section6Content')}
            </Paragraph>
            <List>
              <ListItem>{t('privacy.section6Item1')}</ListItem>
              <ListItem>{t('privacy.section6Item2')}</ListItem>
              <ListItem>{t('privacy.section6Item3')}</ListItem>
              <ListItem>{t('privacy.section6Item4')}</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>{t('privacy.section7Title')}</SectionTitle>
            <ContactInfo>
              <Paragraph>
                <strong>{t('privacy.privacyOfficer')}:</strong> {t('privacy.privacyOfficerName')}<br/>
                <strong>{t('privacy.contact')}:</strong> privacy@gitlog.com<br/>
                <strong>{t('privacy.address')}:</strong> {t('privacy.addressDetails')}
              </Paragraph>
            </ContactInfo>
          </Section>

          <Section>
            <SectionTitle>{t('privacy.section8Title')}</SectionTitle>
            <Paragraph>
              {t('privacy.section8Content')}
            </Paragraph>
          </Section>
        </ContentWrapper>
      </PrivacyContainer>
    </Layout>
  );
};

export default PrivacyPolicy;

