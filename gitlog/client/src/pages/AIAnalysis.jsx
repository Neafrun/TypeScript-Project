import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { apiPost } from '../api/client';
import { useTranslation } from '../hooks/useTranslation';

const AnalysisContainer = styled.div`
  min-height: calc(100vh - 200px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

const AnalysisContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 3rem;
`;

const RepoInputSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const InputTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const InputForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
`;


const AnalysisTypeSelection = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const AnalysisTypeOption = styled.label`
  flex: 1;
  min-width: 150px;
  padding: 0.75rem;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e1e4e8'};
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.selected ? '#f0f4ff' : 'white'};
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    border-color: #667eea;
  }

  input {
    margin-right: 0.5rem;
  }
`;

const RepoInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 1rem;
  border: 2px solid #e1e4e8;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const AnalyzeButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  color: #667eea;
  font-size: 1.1rem;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AnalysisResults = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ResultsHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const ResultsTitle = styled.h2`
  color: #111827;
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ModelBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: linear-gradient(135deg, #10a37f 0%, #1abc9c 100%);
  color: white;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.01em;
`;

const RepoInfo = styled.div`
  width: 100%;
  background: linear-gradient(135deg, #eff6ff 0%, #ede9fe 100%);
  border-radius: 12px;
  padding: 1.8rem;
  margin-bottom: 2.5rem;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(102, 126, 234, 0.15);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
`;

const RepoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const RepoName = styled.h3`
  color: #1f2937;
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
`;

const RepoDescription = styled.p`
  color: #374151;
  margin: 0 0 1.5rem;
  line-height: 1.6;
  max-width: 820px;
`;

const RepoStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.2rem;
`;

const StatItem = styled.div`
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.12);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  letter-spacing: 0.01em;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 1.5rem;
`;

const SectionCard = styled.div`
  position: relative;
  background: ${props => props.highlight ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)' : 'rgba(249, 250, 251, 0.95)'};
  border-radius: 14px;
  padding: 1.8rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: ${props => props.highlight ? '0 18px 35px rgba(102, 126, 234, 0.15)' : '0 12px 25px rgba(15, 23, 42, 0.08)'};
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.highlight ? '0 22px 40px rgba(102, 126, 234, 0.22)' : '0 16px 35px rgba(15, 23, 42, 0.12)'};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
`;

const SectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: ${props => props.variant === 'success' ? 'rgba(34, 197, 94, 0.15)' : props.variant === 'warning' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(99, 102, 241, 0.15)'};
  color: ${props => props.variant === 'success' ? '#15803d' : props.variant === 'warning' ? '#b45309' : '#4338ca'};
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const SectionBody = styled.div`
  color: #374151;
  line-height: 1.7;
  font-size: 0.98rem;
`;

const HighlightContent = styled.div`
  font-size: 1.05rem;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.8;
  white-space: pre-line;
`;

const PillList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(31, 41, 55, 0.06);
  color: #1f2937;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.01em;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ScoreValue = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: ${props => {
    if (props.score >= 80) return '#28a745';
    if (props.score >= 60) return '#ffc107';
    return '#dc3545';
  }};
`;

const ScoreLabel = styled.div`
  font-size: 1.2rem;
  color: #6a737d;
`;

const RecommendationsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.8rem;
`;

const RecommendationItem = styled.li`
  position: relative;
  padding: 1.1rem 1.25rem 1.1rem 1.6rem;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 20px rgba(148, 163, 184, 0.15);
  line-height: 1.6;
  color: #1f2937;

  &::before {
    content: '';
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 70%;
    border-radius: 12px;
    background: ${props => props.bordercolor || '#6366f1'};
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const AIAnalysis = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [repoUrl, setRepoUrl] = useState('');
  const [analysisType, setAnalysisType] = useState('repository-insights');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const parseRepoUrl = (url) => {
    // GitHub URL에서 owner/repo 추출
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)/,
      /^([^\/]+)\/([^\/]+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, '')
        };
      }
    }
    return null;
  };

  const analyzeRepository = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError(t('aiAnalysis.errorInvalidUrl'));
      return;
    }

    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) {
      setError(t('aiAnalysis.errorInvalidUrl'));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // 로그인 여부에 따라 다른 API 엔드포인트 사용
      const isAuthenticated = user && user.login;
      const endpoint = isAuthenticated ? '/api/ai/analyze' : '/api/ai/public/analyze';

      console.log(`🤖 [AI 분석] ${repoInfo.owner}/${repoInfo.repo} 분석 시작 (ChatGPT, 유형: ${analysisType})`);

      if (analysisType === 'repository-insights') {
        const [generalResponse, aiFeedbackResponse] = await Promise.all([
          apiPost(endpoint, {
            owner: repoInfo.owner,
            repo: repoInfo.repo,
            model: 'openai',
            analysisType: 'general'
          }),
          apiPost(endpoint, {
            owner: repoInfo.owner,
            repo: repoInfo.repo,
            model: 'openai',
            analysisType: 'ai-feedback'
          })
        ]);

        console.log('✅ [AI 분석] 일반/AI 피드백 분석 완료:', {
          generalResponse,
          aiFeedbackResponse
        });

        setAnalysisResult({
          type: 'repository-insights',
          general: generalResponse,
          aiFeedback: aiFeedbackResponse
        });
      } else {
        const response = await apiPost(endpoint, {
          owner: repoInfo.owner,
          repo: repoInfo.repo,
          model: 'openai',
          analysisType
        });

        console.log('✅ [AI 분석] 분석 완료:', response);

        setAnalysisResult({
          type: analysisType,
          data: response
        });
      }
    } catch (err) {
      console.error('❌ [AI 분석] 오류:', err);
      console.error('❌ [AI 분석] 오류 상세:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      // 더 자세한 에러 메시지 표시
      let errorMessage = err.message || t('aiAnalysis.errorAnalysisFailed');
      if (err.message && err.message.includes('Failed to fetch')) {
        errorMessage = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요. (http://localhost:5000)';
      }
      
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAnalysisResults = () => {
    if (!analysisResult) {
      return null;
    }

    if (analysisResult.type === 'code-quality') {
      const response = analysisResult.data;
      if (!response || !response.analysis) {
        return null;
      }

      const { analysis, repository: repo, metadata } = response;
      const analysisTypeLabel = t('aiAnalysis.analysisTypeCodeQuality');
      const analyzedAt = metadata?.analyzedAt ? new Date(metadata.analyzedAt).toLocaleString() : null;

      const metadataPills = [
        { label: t('aiAnalysis.analysisType'), value: analysisTypeLabel },
        repo?.language ? { label: t('common.language'), value: repo.language } : null,
        metadata?.totalCommits !== undefined ? { label: t('aiAnalysis.totalCommits'), value: metadata.totalCommits } : null,
        metadata?.totalContributors !== undefined ? { label: t('aiAnalysis.totalContributors'), value: metadata.totalContributors } : null,
        analyzedAt ? { label: t('aiAnalysis.analyzedAt'), value: analyzedAt } : null
      ].filter(Boolean);

      return (
        <AnalysisResults>
          <ResultsHeader>
            <ResultsTitle>
              {t('aiAnalysis.resultsTitle')}
              <ModelBadge>{t('aiAnalysis.modelBadge')}</ModelBadge>
            </ResultsTitle>
            {metadataPills.length > 0 && (
              <PillList>
                {metadataPills.map(({ label, value }) => (
                  <Pill key={`${label}-${value}`}>
                    <strong style={{ fontWeight: 700 }}>{label}:</strong> {value}
                  </Pill>
                ))}
              </PillList>
            )}
          </ResultsHeader>

          {repo && (
            <RepoInfo>
              <RepoHeader>
                <RepoName>{repo.name}</RepoName>
                {repo.language && <SectionBadge>{repo.language}</SectionBadge>}
              </RepoHeader>
              <RepoDescription>{repo.description || t('aiAnalysis.noDescription')}</RepoDescription>
              <RepoStats>
                <StatItem>
                  <StatLabel>{t('aiAnalysis.stars')}</StatLabel>
                  <StatValue>{repo.stars}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>{t('aiAnalysis.forks')}</StatLabel>
                  <StatValue>{repo.forks}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>{t('aiAnalysis.totalCommits')}</StatLabel>
                  <StatValue>{metadata?.totalCommits || 0}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>{t('aiAnalysis.totalContributors')}</StatLabel>
                  <StatValue>{metadata?.totalContributors || 0}</StatValue>
                </StatItem>
              </RepoStats>
            </RepoInfo>
          )}

          {analysis.overallScore !== undefined && (
            <>
              <SectionGrid style={{ marginBottom: '2rem' }}>
                <SectionCard highlight>
                  <SectionHeader>
                    <SectionTitle>{t('aiAnalysis.codeQualityAssessment')}</SectionTitle>
                    <SectionBadge variant={analysis.overallScore >= 80 ? 'success' : analysis.overallScore >= 60 ? 'warning' : undefined}>
                      {t('aiAnalysis.overallScore')}
                    </SectionBadge>
                  </SectionHeader>
                  <ScoreDisplay>
                    <ScoreValue score={analysis.overallScore}>{analysis.overallScore}</ScoreValue>
                    <ScoreLabel>/ 100</ScoreLabel>
                  </ScoreDisplay>
                  <SectionBody>
                    <p><strong>{t('aiAnalysis.maintainability')}:</strong> {analysis.maintainability}</p>
                    <p><strong>{t('aiAnalysis.complexity')}:</strong> {analysis.complexity}</p>
                    <p><strong>{t('aiAnalysis.bestPractices')}:</strong> {analysis.bestPractices}</p>
                  </SectionBody>
                </SectionCard>
              </SectionGrid>

              <SectionGrid>
                {analysis.improvements && analysis.improvements.length > 0 && (
                  <SectionCard>
                    <SectionHeader>
                      <SectionTitle>{t('aiAnalysis.areasForImprovement')}</SectionTitle>
                      <SectionBadge variant="warning">{analysis.improvements.length}</SectionBadge>
                    </SectionHeader>
                    <RecommendationsList>
                      {analysis.improvements.map((improvement, index) => (
                        <RecommendationItem key={index} bordercolor="#fbbf24">
                          {improvement}
                        </RecommendationItem>
                      ))}
                    </RecommendationsList>
                  </SectionCard>
                )}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <SectionCard>
                    <SectionHeader>
                      <SectionTitle>{t('aiAnalysis.recommendations')}</SectionTitle>
                      <SectionBadge>{analysis.recommendations.length}</SectionBadge>
                    </SectionHeader>
                    <RecommendationsList>
                      {analysis.recommendations.map((rec, index) => (
                        <RecommendationItem key={index} bordercolor="#6366f1">
                          {rec}
                        </RecommendationItem>
                      ))}
                    </RecommendationsList>
                  </SectionCard>
                )}
                {analysis.summary && (
                  <SectionCard>
                    <SectionHeader>
                      <SectionTitle>{t('aiAnalysis.summary')}</SectionTitle>
                    </SectionHeader>
                    <SectionBody>{analysis.summary}</SectionBody>
                  </SectionCard>
                )}
              </SectionGrid>
            </>
          )}

          {analysis.rawResponse && (
            <SectionCard style={{ marginTop: '2rem' }}>
              <SectionHeader>
                <SectionTitle>{t('aiAnalysis.rawResponse')}</SectionTitle>
              </SectionHeader>
              <SectionBody style={{ whiteSpace: 'pre-wrap' }}>{analysis.rawResponse}</SectionBody>
            </SectionCard>
          )}
        </AnalysisResults>
      );
    }

    if (analysisResult.type === 'repository-insights') {
      const generalResponse = analysisResult.general;
      const aiFeedbackResponse = analysisResult.aiFeedback;
      const repo = generalResponse?.repository || aiFeedbackResponse?.repository;

      if (!repo) {
        return null;
      }

      const generalAnalysis = generalResponse?.analysis;
      const aiFeedbackAnalysis = aiFeedbackResponse?.analysis;
      const metadata = generalResponse?.metadata || aiFeedbackResponse?.metadata;
      const analysisTypeLabel = t('aiAnalysis.analysisTypeRepositoryInsights');
      const analyzedAt = metadata?.analyzedAt ? new Date(metadata.analyzedAt).toLocaleString() : null;

      const metadataPills = [
        { label: t('aiAnalysis.analysisType'), value: analysisTypeLabel },
        repo.language ? { label: t('common.language'), value: repo.language } : null,
        metadata?.totalCommits !== undefined ? { label: t('aiAnalysis.totalCommits'), value: metadata.totalCommits } : null,
        metadata?.totalContributors !== undefined ? { label: t('aiAnalysis.totalContributors'), value: metadata.totalContributors } : null,
        analyzedAt ? { label: t('aiAnalysis.analyzedAt'), value: analyzedAt } : null
      ].filter(Boolean);

      return (
        <AnalysisResults>
          <ResultsHeader>
            <ResultsTitle>
              {t('aiAnalysis.resultsTitle')}
              <ModelBadge>{t('aiAnalysis.modelBadge')}</ModelBadge>
            </ResultsTitle>
            {metadataPills.length > 0 && (
              <PillList>
                {metadataPills.map(({ label, value }) => (
                  <Pill key={`${label}-${value}`}>
                    <strong style={{ fontWeight: 700 }}>{label}:</strong> {value}
                  </Pill>
                ))}
              </PillList>
            )}
          </ResultsHeader>

          <RepoInfo>
            <RepoHeader>
              <RepoName>{repo.name}</RepoName>
              {repo.language && <SectionBadge>{repo.language}</SectionBadge>}
            </RepoHeader>
            <RepoDescription>{repo.description || t('aiAnalysis.noDescription')}</RepoDescription>
            <RepoStats>
              <StatItem>
                <StatLabel>{t('aiAnalysis.stars')}</StatLabel>
                <StatValue>{repo.stars}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>{t('aiAnalysis.forks')}</StatLabel>
                <StatValue>{repo.forks}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>{t('aiAnalysis.totalCommits')}</StatLabel>
                <StatValue>{metadata?.totalCommits || 0}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>{t('aiAnalysis.totalContributors')}</StatLabel>
                <StatValue>{metadata?.totalContributors || 0}</StatValue>
              </StatItem>
            </RepoStats>
          </RepoInfo>

          {generalAnalysis && (
            <>
              <SectionGrid>
                {[{ title: t('aiAnalysis.projectOverview'), body: generalAnalysis.overview, highlight: true },
                  { title: t('aiAnalysis.projectHealth'), body: generalAnalysis.health },
                  { title: t('aiAnalysis.activityAnalysis'), body: generalAnalysis.activity },
                  { title: t('aiAnalysis.collaborationAssessment'), body: generalAnalysis.collaboration },
                  { title: t('aiAnalysis.codeQualityInsights'), body: generalAnalysis.quality },
                  { title: t('aiAnalysis.growthPotential'), body: generalAnalysis.growth }
                ].map((section, index) => (
                  <SectionCard key={section.title} highlight={section.highlight && index === 0}>
                    <SectionHeader>
                      <SectionTitle>{section.title}</SectionTitle>
                    </SectionHeader>
                    <SectionBody>{section.body || t('aiAnalysis.noDescription')}</SectionBody>
                  </SectionCard>
                ))}
              </SectionGrid>

              {generalAnalysis.recommendations && generalAnalysis.recommendations.length > 0 && (
                <SectionCard style={{ marginTop: '2rem' }}>
                  <SectionHeader>
                    <SectionTitle>{t('aiAnalysis.recommendations')}</SectionTitle>
                    <SectionBadge>{generalAnalysis.recommendations.length}</SectionBadge>
                  </SectionHeader>
                  <RecommendationsList>
                    {generalAnalysis.recommendations.map((rec, index) => (
                      <RecommendationItem key={index} bordercolor="#6366f1">
                        {rec}
                      </RecommendationItem>
                    ))}
                  </RecommendationsList>
                </SectionCard>
              )}

              {generalAnalysis.summary && (
                <SectionCard style={{ marginTop: '1.5rem' }}>
                  <SectionHeader>
                    <SectionTitle>{t('aiAnalysis.summary')}</SectionTitle>
                  </SectionHeader>
                  <SectionBody>{generalAnalysis.summary}</SectionBody>
                </SectionCard>
              )}
            </>
          )}

          {aiFeedbackAnalysis && (
            <>
              {aiFeedbackAnalysis.feedback && (
                <SectionCard highlight style={{ marginTop: '2.5rem' }}>
                  <SectionHeader>
                    <SectionTitle>{t('aiAnalysis.feedback')}</SectionTitle>
                    <SectionBadge>{t('aiAnalysis.aiFeedbackAnalysis')}</SectionBadge>
                  </SectionHeader>
                  <HighlightContent>{aiFeedbackAnalysis.feedback}</HighlightContent>
                </SectionCard>
              )}

              <SectionGrid>
                {aiFeedbackAnalysis.positiveAspects && aiFeedbackAnalysis.positiveAspects.length > 0 && (
                  <SectionCard>
                    <SectionHeader>
                      <SectionTitle>{t('aiAnalysis.positiveAspects')}</SectionTitle>
                      <SectionBadge variant="success">{aiFeedbackAnalysis.positiveAspects.length}</SectionBadge>
                    </SectionHeader>
                    <RecommendationsList>
                      {aiFeedbackAnalysis.positiveAspects.map((aspect, index) => (
                        <RecommendationItem key={index} bordercolor="#22c55e">
                          {aspect}
                        </RecommendationItem>
                      ))}
                    </RecommendationsList>
                  </SectionCard>
                )}
                {aiFeedbackAnalysis.areasForImprovement && aiFeedbackAnalysis.areasForImprovement.length > 0 && (
                  <SectionCard>
                    <SectionHeader>
                      <SectionTitle>{t('aiAnalysis.areasForImprovement')}</SectionTitle>
                      <SectionBadge variant="warning">{aiFeedbackAnalysis.areasForImprovement.length}</SectionBadge>
                    </SectionHeader>
                    <RecommendationsList>
                      {aiFeedbackAnalysis.areasForImprovement.map((area, index) => (
                        <RecommendationItem key={index} bordercolor="#f59e0b">
                          {area}
                        </RecommendationItem>
                      ))}
                    </RecommendationsList>
                  </SectionCard>
                )}
                {aiFeedbackAnalysis.recommendations && aiFeedbackAnalysis.recommendations.length > 0 && (
                  <SectionCard>
                    <SectionHeader>
                      <SectionTitle>{t('aiAnalysis.recommendations')}</SectionTitle>
                      <SectionBadge>{aiFeedbackAnalysis.recommendations.length}</SectionBadge>
                    </SectionHeader>
                    <RecommendationsList>
                      {aiFeedbackAnalysis.recommendations.map((recommendation, index) => (
                        <RecommendationItem key={index} bordercolor="#6366f1">
                          {recommendation}
                        </RecommendationItem>
                      ))}
                    </RecommendationsList>
                  </SectionCard>
                )}
                {aiFeedbackAnalysis.suggestions && aiFeedbackAnalysis.suggestions.length > 0 && (
                  <SectionCard>
                    <SectionHeader>
                      <SectionTitle>{t('aiAnalysis.suggestions')}</SectionTitle>
                      <SectionBadge>{aiFeedbackAnalysis.suggestions.length}</SectionBadge>
                    </SectionHeader>
                    <RecommendationsList>
                      {aiFeedbackAnalysis.suggestions.map((suggestion, index) => (
                        <RecommendationItem key={index} bordercolor="#3b82f6">
                          {suggestion}
                        </RecommendationItem>
                      ))}
                    </RecommendationsList>
                  </SectionCard>
                )}
              </SectionGrid>

              {aiFeedbackAnalysis.summary && (
                <SectionCard style={{ marginTop: '2rem' }}>
                  <SectionHeader>
                    <SectionTitle>{t('aiAnalysis.summary')}</SectionTitle>
                  </SectionHeader>
                  <SectionBody>{aiFeedbackAnalysis.summary}</SectionBody>
                </SectionCard>
              )}
            </>
          )}

          {(generalAnalysis?.rawResponse || aiFeedbackAnalysis?.rawResponse) && (
            <SectionCard style={{ marginTop: '2.5rem' }}>
              <SectionHeader>
                <SectionTitle>{t('aiAnalysis.rawResponse')}</SectionTitle>
              </SectionHeader>
              <SectionBody style={{ whiteSpace: 'pre-wrap' }}>
                {generalAnalysis?.rawResponse && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <strong>{t('aiAnalysis.analysisTypeGeneral')}:</strong>
                    <div style={{ marginTop: '0.75rem' }}>{generalAnalysis.rawResponse}</div>
                  </div>
                )}
                {aiFeedbackAnalysis?.rawResponse && (
                  <div>
                    <strong>{t('aiAnalysis.analysisTypeAIFeedback')}:</strong>
                    <div style={{ marginTop: '0.75rem' }}>{aiFeedbackAnalysis.rawResponse}</div>
                  </div>
                )}
              </SectionBody>
            </SectionCard>
          )}
        </AnalysisResults>
      );
    }

    return null;
  };

  return (
    <Layout>
      <AnalysisContainer>
        <AnalysisContent>
          <Title>{t('aiAnalysis.title')}</Title>
          <Subtitle>{t('aiAnalysis.subtitle')}</Subtitle>
          
          <RepoInputSection>
            <InputTitle>{t('aiAnalysis.enterRepositoryUrl')}</InputTitle>
            <InputForm onSubmit={analyzeRepository}>
              <RepoInput
                type="text"
                placeholder={t('aiAnalysis.repositoryUrlPlaceholder')}
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={isAnalyzing}
              />
              
              <AnalysisTypeSelection>
                <AnalysisTypeOption selected={analysisType === 'repository-insights'}>
                  <input
                    type="radio"
                    name="analysisType"
                    value="repository-insights"
                    checked={analysisType === 'repository-insights'}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    disabled={isAnalyzing}
                  />
                  {t('aiAnalysis.analysisTypeRepositoryInsights')}
                </AnalysisTypeOption>
                <AnalysisTypeOption selected={analysisType === 'code-quality'}>
                  <input
                    type="radio"
                    name="analysisType"
                    value="code-quality"
                    checked={analysisType === 'code-quality'}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    disabled={isAnalyzing}
                  />
                  {t('aiAnalysis.analysisTypeCodeQuality')}
                </AnalysisTypeOption>
              </AnalysisTypeSelection>

              <AnalyzeButton type="submit" disabled={isAnalyzing || !repoUrl.trim()}>
                {isAnalyzing ? t('aiAnalysis.analyzing') : t('aiAnalysis.analyzeWithAI')}
              </AnalyzeButton>
            </InputForm>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {!user && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'rgba(102, 126, 234, 0.1)', 
                borderRadius: '8px',
                fontSize: '0.95rem',
                color: '#333',
                textAlign: 'center'
              }}>
                {t('aiAnalysis.loginTip')}
              </div>
            )}
          </RepoInputSection>

          {isAnalyzing && (
            <LoadingSpinner>
              <Spinner />
              <div>{t('aiAnalysis.analyzingMessage')}</div>
            </LoadingSpinner>
          )}

          {renderAnalysisResults()}
        </AnalysisContent>
      </AnalysisContainer>
    </Layout>
  );
};

export default AIAnalysis;
