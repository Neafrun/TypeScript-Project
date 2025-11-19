import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { apiPost } from '../api/client';
import { useTranslation } from '../hooks/useTranslation';
import { useSearchParams } from 'react-router-dom';

const AnalysisContainer = styled.div`
  min-height: calc(100vh - 200px);
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
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
  margin-bottom: 0.01rem;
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
  border: 2px solid ${props => props.selected ? '#ff6b35' : '#e1e4e8'};
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.selected ? '#fff1e0' : 'white'};
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    border-color: #ff6b35;
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
    border-color: #ff6b35;
  }
`;

const AnalyzeButton = styled.button`
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
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
  color: #ff6b35;
  font-size: 1.1rem;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b35;
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
  background: linear-gradient(135deg, #ffb347 0%, #ff6b35 100%);
  color: white;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.01em;
`;

const RepoInfo = styled.div`
  width: 100%;
  background: linear-gradient(135deg, #fff4e6 0%, #ffe0c2 100%);
  border-radius: 12px;
  padding: 1.8rem;
  margin-bottom: 2.5rem;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 140, 66, 0.25);
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
  box-shadow: 0 10px 20px rgba(255, 107, 53, 0.16);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6b35;
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
  background: ${props => props.highlight ? 'linear-gradient(135deg, rgba(255, 140, 66, 0.18) 0%, rgba(255, 107, 53, 0.2) 100%)' : 'rgba(249, 250, 251, 0.95)'};
  border-radius: 14px;
  padding: 1.8rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: ${props => props.highlight ? '0 18px 35px rgba(255, 107, 53, 0.24)' : '0 12px 25px rgba(15, 23, 42, 0.08)'};
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.highlight ? '0 22px 40px rgba(255, 107, 53, 0.32)' : '0 16px 35px rgba(15, 23, 42, 0.12)'};
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
  background: ${props => props.variant === 'success' ? 'rgba(34, 197, 94, 0.15)' : props.variant === 'warning' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 140, 66, 0.2)'};
  color: ${props => props.variant === 'success' ? '#15803d' : props.variant === 'warning' ? '#b45309' : '#9a3412'};
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
  background: rgba(255, 140, 66, 0.15);
  color: #7c2d12;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.01em;
`;

const FeedbackTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const FeedbackTabButton = styled.button`
  flex: 1;
  min-width: 150px;
  padding: 0.75rem 1.2rem;
  border-radius: 999px;
  border: 1px solid ${props => (props.active ? 'rgba(255, 140, 66, 0.85)' : 'rgba(148, 163, 184, 0.5)')};
  background: ${props =>
    props.active
      ? 'linear-gradient(135deg, rgba(255, 140, 66, 0.25) 0%, rgba(255, 107, 53, 0.32) 100%)'
      : 'white'};
  color: ${props => (props.active ? '#7c2d12' : '#475569')};
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props =>
    props.active
      ? '0 12px 25px rgba(255, 107, 53, 0.28)'
      : '0 6px 16px rgba(15, 23, 42, 0.08)'};

  &:hover {
    border-color: rgba(255, 107, 53, 0.85);
    color: #7c2d12;
  }
`;

const NarrativeIntro = styled.div`
  font-size: 0.9rem;
  color: #ff6b35;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.9rem;
`;

const NarrativeDescription = styled.p`
  margin: 0 0 1.1rem;
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.6;
`;

const NarrativeBlock = styled.div`
  background: linear-gradient(135deg, rgba(255, 244, 230, 0.95) 0%, rgba(255, 228, 204, 0.95) 100%);
  border-radius: 16px;
  padding: 1.75rem;
  line-height: 1.85;
  color: #1f2937;
  box-shadow: 0 14px 36px rgba(255, 140, 66, 0.22);
  border: 1px solid rgba(255, 187, 141, 0.55);
  white-space: pre-line;
`;

const NarrativeParagraph = styled.p`
  margin: 0 0 1.1rem;
  font-size: 1.02rem;
  font-weight: 500;
  letter-spacing: 0.01em;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ScoreHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
`;

const ScoreValue = styled.div`
  font-size: 3.2rem;
  font-weight: 800;
  color: ${props => {
    if (props.score >= 80) return '#28a745';
    if (props.score >= 60) return '#f59e0b';
    return '#dc2626';
  }};
  letter-spacing: -0.02em;
`;

const ScoreLabel = styled.div`
  font-size: 1rem;
  color: #475569;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const ScoreMeta = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ScoreNarrativeList = styled.div`
  display: grid;
  gap: 0.9rem;
  flex: 1;
`;

const ScoreNarrativeItem = styled.div`
  background: rgba(255, 140, 66, 0.14);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 140, 66, 0.22);
  display: grid;
  gap: 0.5rem;
`;

const ScoreNarrativeHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
`;

const ScoreNarrativeTitle = styled.div`
  color: #c2410c;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const ScoreNarrativeScore = styled.span`
  color: #7c2d12;
  font-weight: 700;
  font-size: 0.95rem;
`;

const ScoreNarrativeBody = styled.div`
  color: #1f2937;
  font-size: 0.95rem;
  line-height: 1.65;
`;

const TypewriterText = ({ text, speed = 18, delay = 0 }) => {
  const normalizedText =
    text === undefined || text === null
      ? ''
      : typeof text === 'string'
      ? text
      : String(text);

  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let intervalId;
    let delayId;
    let index = 0;

    setDisplayed('');

    if (!normalizedText) {
      return () => {};
    }

    const startTyping = () => {
      intervalId = setInterval(() => {
        index += 1;
        setDisplayed(normalizedText.slice(0, index));
        if (index >= normalizedText.length) {
          clearInterval(intervalId);
        }
      }, speed);
    };

    delayId = setTimeout(() => {
      startTyping();
    }, delay);

    return () => {
      clearInterval(intervalId);
      clearTimeout(delayId);
    };
  }, [normalizedText, speed, delay]);

  return <span style={{ whiteSpace: 'pre-wrap' }}>{displayed}</span>;
};

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
    background: ${props => props.bordercolor || '#ff6b35'};
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

const toNarrativeParagraphs = (content) => {
  if (!content) return [];

  if (Array.isArray(content)) {
    return content
      .map(item => {
        if (typeof item === 'string') return item.trim();
        if (item === null || item === undefined) return '';
        return String(item).trim();
      })
      .filter(Boolean);
  }

  if (typeof content === 'string') {
    return content.trim() ? [content.trim()] : [];
  }

  return [String(content).trim()];
};

const mergeNarrativeParagraphs = (...contents) =>
  contents.reduce((acc, current) => {
    if (!current) return acc;
    const paragraphs = toNarrativeParagraphs(current);
    return paragraphs.length ? acc.concat(paragraphs) : acc;
  }, []);

const AIAnalysis = () => {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [searchParams] = useSearchParams();
  const [repoUrl, setRepoUrl] = useState('');
  const [analysisType, setAnalysisType] = useState('ai-feedback');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeFeedbackTab, setActiveFeedbackTab] = useState('overview');
  const shouldAutoAnalyzeRef = useRef(false);

  useEffect(() => {
    if (analysisResult?.type === 'ai-feedback') {
      setActiveFeedbackTab('overview');
    }
  }, [analysisResult]);

  useEffect(() => {
    const repoParam = searchParams.get('repo');
    if (repoParam) {
      const decodedRepo = decodeURIComponent(repoParam);
      setRepoUrl(decodedRepo);
      shouldAutoAnalyzeRef.current = true;
    }
  }, [searchParams]);

  useEffect(() => {
    if (
      shouldAutoAnalyzeRef.current &&
      !isAnalyzing &&
      repoUrl.trim()
    ) {
      const repoInfo = parseRepoUrl(repoUrl.trim());
      if (repoInfo) {
        shouldAutoAnalyzeRef.current = false;
        performAnalysis(repoInfo);
      }
    }
  }, [repoUrl, isAnalyzing]);

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

  const performAnalysis = async (repoInfo) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // 로그인 여부에 따라 다른 API 엔드포인트 사용
      const isAuthenticated = user && user.login;
      const endpoint = isAuthenticated ? '/api/ai/analyze' : '/api/ai/public/analyze';

      console.log(` [AI 분석] ${repoInfo.owner}/${repoInfo.repo} 분석 시작 (유형: ${analysisType})`);

      const response = await apiPost(endpoint, {
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        // model을 지정하지 않으면 백엔드에서 사용 가능한 API 키에 따라 자동 선택
        analysisType
      });

      console.log('✅ [AI 분석] 분석 완료:', response);

      setAnalysisResult({
        type: analysisType,
        data: response
      });
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

  const analyzeRepository = async (e) => {
    if (e) {
      e.preventDefault();
    }
    if (!repoUrl.trim()) {
      setError(t('aiAnalysis.errorInvalidUrl'));
      return;
    }

    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) {
      setError(t('aiAnalysis.errorInvalidUrl'));
      return;
    }

    await performAnalysis(repoInfo);
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

      const sectionScores = analysis.sectionScores || {};

      const cleanIntroPrefix = (intro) => {
        if (!intro) return intro;
        const delimiterIndex = intro.indexOf('|');
        if (delimiterIndex !== -1) {
          return intro.slice(delimiterIndex + 1).trim();
        }
        return intro;
      };

      const analyzeParagraphs = mergeNarrativeParagraphs(analysis.maintainability);

      const detectParagraphs = mergeNarrativeParagraphs(
        analysis.complexity,
        analysis.improvements
      );

      const feedbackParagraphs = mergeNarrativeParagraphs(
        analysis.bestPractices,
        analysis.recommendations
      );

      const valueParagraphs = mergeNarrativeParagraphs(
        analysis.additionalInsights,
        analysis.summary
      );

      const narrativeSections = [
        {
          id: 'analyze',
          title: t('aiAnalysis.codeQualitySectionAnalyze'),
          subtitle: cleanIntroPrefix(t('aiAnalysis.codeQualitySectionAnalyzeIntro')),
          paragraphs: analyzeParagraphs
        },
        {
          id: 'detect',
          title: t('aiAnalysis.codeQualitySectionDetect'),
          subtitle: cleanIntroPrefix(t('aiAnalysis.codeQualitySectionDetectIntro')),
          paragraphs: detectParagraphs
        },
        {
          id: 'feedback',
          title: t('aiAnalysis.codeQualitySectionFeedback'),
          subtitle: cleanIntroPrefix(t('aiAnalysis.codeQualitySectionFeedbackIntro')),
          paragraphs: feedbackParagraphs
        },
        {
          id: 'value',
          title: t('aiAnalysis.codeQualitySectionValue'),
          subtitle: cleanIntroPrefix(t('aiAnalysis.codeQualitySectionValueIntro')),
          paragraphs: valueParagraphs
        }
      ].filter(section => section.paragraphs.length > 0);

      const scoreSections = [
        {
          id: 'analyze',
          title: t('aiAnalysis.codeQualitySectionAnalyze'),
          body: analysis.maintainability || t('aiAnalysis.noDescription'),
          score: sectionScores.analyze
        },
        {
          id: 'detect',
          title: t('aiAnalysis.codeQualitySectionDetect'),
          body: analysis.complexity || t('aiAnalysis.noDescription'),
          score: sectionScores.detect
        },
        {
          id: 'feedback',
          title: t('aiAnalysis.codeQualitySectionFeedback'),
          body: analysis.bestPractices || t('aiAnalysis.noDescription'),
          score: sectionScores.feedback
        },
        {
          id: 'value',
          title: t('aiAnalysis.codeQualitySectionValue'),
          body: (valueParagraphs.length > 0 ? valueParagraphs[0] : analysis.summary) || t('aiAnalysis.noDescription'),
          score: sectionScores.value
        }
      ];

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

                  <ScoreHeader>
                    <ScoreDisplay>
                      <ScoreValue score={analysis.overallScore}>{analysis.overallScore}</ScoreValue>
                      <ScoreLabel>{t('aiAnalysis.scoreOutOf')}</ScoreLabel>
                    </ScoreDisplay>

                    <ScoreMeta>
                      <ScoreNarrativeList>
                        {scoreSections.map((section, index) => (
                          <ScoreNarrativeItem key={section.id}>
                            <ScoreNarrativeHeader>
                              <ScoreNarrativeTitle>{section.title}</ScoreNarrativeTitle>
                              <ScoreNarrativeScore>
                                {section.score !== undefined && section.score !== null
                                  ? `${section.score} ${t('aiAnalysis.scoreOutOf25')}`
                                  : t('aiAnalysis.scorePending')}
                              </ScoreNarrativeScore>
                            </ScoreNarrativeHeader>
                            <ScoreNarrativeBody>
                              <TypewriterText text={section.body} delay={index * 180} />
                            </ScoreNarrativeBody>
                          </ScoreNarrativeItem>
                        ))}
                      </ScoreNarrativeList>
                    </ScoreMeta>
                  </ScoreHeader>
                </SectionCard>
              </SectionGrid>
            </>
          )}

          {narrativeSections.map(section => (
            <div key={section.id} style={{ marginTop: '2.2rem' }}>
              <NarrativeIntro>{section.title}</NarrativeIntro>
              {section.subtitle && <NarrativeDescription>{section.subtitle}</NarrativeDescription>}
              <NarrativeBlock>
                {section.paragraphs.map((paragraph, index) => (
                  <NarrativeParagraph key={index}>
                    <TypewriterText text={paragraph} delay={index * 220} />
                  </NarrativeParagraph>
                ))}
              </NarrativeBlock>
            </div>
          ))}

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

    if (analysisResult.type === 'ai-feedback') {
      const response = analysisResult.data;
      if (!response || !response.analysis) {
        return null;
      }

      const { analysis, repository: repo, metadata } = response;
      const analysisTypeLabel = t('aiAnalysis.analysisTypeAIFeedback');
      const analyzedAt = metadata?.analyzedAt ? new Date(metadata.analyzedAt).toLocaleString() : null;

      const metadataPills = [
        { label: t('aiAnalysis.analysisType'), value: analysisTypeLabel },
        repo?.language ? { label: t('common.language'), value: repo.language } : null,
        metadata?.totalCommits !== undefined ? { label: t('aiAnalysis.totalCommits'), value: metadata.totalCommits } : null,
        metadata?.totalContributors !== undefined ? { label: t('aiAnalysis.totalContributors'), value: metadata.totalContributors } : null,
        analyzedAt ? { label: t('aiAnalysis.analyzedAt'), value: analyzedAt } : null
      ].filter(Boolean);

      const tabs = [
        {
          id: 'overview',
          label: t('aiAnalysis.feedbackTabOverview'),
          intro: repo?.name
            ? t('aiAnalysis.feedbackTabOverviewIntro', { repo: repo.name })
            : t('aiAnalysis.feedbackTabOverviewIntroFallback'),
          paragraphs: mergeNarrativeParagraphs(analysis.feedback || analysis.summary)
        },
        {
          id: 'strengths',
          label: t('aiAnalysis.feedbackTabStrengths'),
          intro: t('aiAnalysis.feedbackTabStrengthsIntro'),
          paragraphs: toNarrativeParagraphs(analysis.positiveAspects)
        },
        {
          id: 'improvements',
          label: t('aiAnalysis.feedbackTabImprovements'),
          intro: t('aiAnalysis.feedbackTabImprovementsIntro'),
          paragraphs: mergeNarrativeParagraphs(analysis.areasForImprovement, analysis.recommendations)
        },
        {
          id: 'roadmap',
          label: t('aiAnalysis.feedbackTabRoadmap'),
          intro: t('aiAnalysis.feedbackTabRoadmapIntro'),
          paragraphs: mergeNarrativeParagraphs(analysis.suggestions, analysis.nextSteps)
        }
      ].filter(tab => tab.paragraphs.length > 0);

      const availableTabs = tabs.length > 0 ? tabs : [{
        id: 'overview',
        label: t('aiAnalysis.feedbackTabOverview'),
        intro: t('aiAnalysis.feedbackTabOverviewIntroFallback'),
        paragraphs: mergeNarrativeParagraphs(analysis.feedback || analysis.summary || analysis.rawResponse)
      }];

      const currentTab = availableTabs.find(tab => tab.id === activeFeedbackTab) || availableTabs[0];

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

          <SectionCard highlight style={{ marginBottom: '2rem' }}>
            <SectionHeader>
              <SectionTitle>{t('aiAnalysis.feedbackNarrativeTitle')}</SectionTitle>
              <SectionBadge>{t('aiAnalysis.aiFeedbackAnalysis')}</SectionBadge>
            </SectionHeader>
            <SectionBody>{t('aiAnalysis.feedbackNarrativeSubtitle')}</SectionBody>
          </SectionCard>

          <FeedbackTabs>
            {availableTabs.map((tab) => (
              <FeedbackTabButton
                key={tab.id}
                type="button"
                active={currentTab.id === tab.id}
                onClick={() => setActiveFeedbackTab(tab.id)}
              >
                {tab.label}
              </FeedbackTabButton>
            ))}
          </FeedbackTabs>

          <NarrativeIntro>{currentTab.intro}</NarrativeIntro>
          <NarrativeBlock>
            {currentTab.paragraphs.map((paragraph, index) => (
              <NarrativeParagraph key={index}>
                <TypewriterText text={paragraph} delay={index * 220} />
              </NarrativeParagraph>
            ))}
          </NarrativeBlock>

          {analysis.rawResponse && (
            <SectionCard style={{ marginTop: '2.5rem' }}>
              <SectionHeader>
                <SectionTitle>{t('aiAnalysis.rawResponse')}</SectionTitle>
              </SectionHeader>
              <SectionBody style={{ whiteSpace: 'pre-wrap' }}>{analysis.rawResponse}</SectionBody>
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
          <Title>{t('aiAnalysis.titleWithoutEmoji')}</Title>
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
                <AnalysisTypeOption selected={analysisType === 'ai-feedback'}>
                  <input
                    type="radio"
                    name="analysisType"
                    value="ai-feedback"
                    checked={analysisType === 'ai-feedback'}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    disabled={isAnalyzing}
                  />
                  {t('aiAnalysis.analysisTypeAIFeedback')}
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
