import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';

const ContactContainer = styled.div`
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  min-height: calc(100vh - 200px);
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  color: white;
  font-size: 3rem;
  margin-bottom: 1rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 3rem;
`;

const ContactCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ContactInfo = styled.div`
  h3 {
    color: #ff6b35;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }
`;

const ContactIcon = styled.div`
  font-size: 1.5rem;
  color: #ff6b35;
  min-width: 30px;
`;

const ContactText = styled.div`
  color: #333;
  
  strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #24292e;
  }
  
  span {
    color: #666;
    font-size: 0.95rem;
  }
`;

const FormSection = styled.div`
  h3 {
    color: #ff6b35;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff6b35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff6b35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border: none;
  padding: 1.2rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(255, 107, 53, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 실제 구현에서는 여기서 서버로 데이터를 전송
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  return (
    <Layout>
      <ContactContainer>
        <ContentWrapper>
          <Title>문의하기</Title>
          <Subtitle>GitLog에 대한 문의사항이나 피드백을 보내주세요</Subtitle>
          
          <ContactCard>
            <ContactGrid>
              <ContactInfo>
                <h3>📞 연락처 정보</h3>
                <ContactItem>
                  <ContactIcon>📧</ContactIcon>
                  <ContactText>
                    <strong>이메일</strong>
                    <span>contact@gitlog.com</span>
                  </ContactText>
                </ContactItem>
                <ContactItem>
                  <ContactIcon>💬</ContactIcon>
                  <ContactText>
                    <strong>카카오톡</strong>
                    <span>@gitlog</span>
                  </ContactText>
                </ContactItem>
                <ContactItem>
                  <ContactIcon>🐙</ContactIcon>
                  <ContactText>
                    <strong>GitHub</strong>
                    <span>github.com/gitlog</span>
                  </ContactText>
                </ContactItem>
                <ContactItem>
                  <ContactIcon>⏰</ContactIcon>
                  <ContactText>
                    <strong>응답 시간</strong>
                    <span>평일 24시간 이내</span>
                  </ContactText>
                </ContactItem>
              </ContactInfo>

              <FormSection>
                <h3>✉️ 문의 양식</h3>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label htmlFor="name">이름 *</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="홍길동"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="example@email.com"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="subject">제목 *</Label>
                    <Input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="문의 제목을 입력해주세요"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="message">메시지 *</Label>
                    <TextArea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="문의 내용을 자세히 입력해주세요"
                    />
                  </FormGroup>
                  
                  <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '전송 중...' : '문의 보내기'}
                  </SubmitButton>
                  
                  {isSubmitted && (
                    <SuccessMessage>
                      문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.
                    </SuccessMessage>
                  )}
                </Form>
              </FormSection>
            </ContactGrid>
          </ContactCard>
        </ContentWrapper>
      </ContactContainer>
    </Layout>
  );
};

export default Contact;
