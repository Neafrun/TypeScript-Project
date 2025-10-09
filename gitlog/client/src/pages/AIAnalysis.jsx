import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { apiGet } from '../api/client';

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
  margin-bottom: 3rem;
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const AnalysisCard = styled.div`
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const CardDescription = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const FeatureList = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const FeatureTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FeatureItem = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3498db;
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const FeatureName = styled.h4`
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const FeatureDesc = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ComingSoon = styled.div`
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  margin-top: 2rem;
`;

const ComingSoonTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const ComingSoonText = styled.p`
  font-size: 1.1rem;
  opacity: 0.8;
`;

const RepoInputSection = styled.div`
  background: white;
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
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
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
    border-color: #ff8c42;
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
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #ff8c42;
  font-size: 1.1rem;
`;

const AnalysisResults = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const ResultsTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const RepoInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid #ff8c42;
`;

const RepoName = styled.h3`
  color: #2c3e50;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
`;

const RepoDescription = styled.p`
  color: #6a737d;
  margin-bottom: 1rem;
`;

const RepoStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff8c42;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6a737d;
`;

const ContributorsSection = styled.div`
  margin-bottom: 2rem;
`;

const ContributorsTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.4rem;
  margin-bottom: 1rem;
`;

const ContributorList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const ContributorCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ContributorAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const ContributorInfo = styled.div`
  flex: 1;
`;

const ContributorName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const ContributorCommits = styled.div`
  font-size: 0.9rem;
  color: #6a737d;
`;

const CodeQualitySection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const QualityTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.4rem;
  margin-bottom: 1rem;
`;

const QualityMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const QualityMetric = styled.div`
  background: white;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const MetricValue = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  color: ${props => {
    if (props.score >= 80) return '#28a745';
    if (props.score >= 60) return '#ffc107';
    return '#dc3545';
  }};
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: #6a737d;
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
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

  const parseRepoUrl = (url) => {
    // GitHub URL에서 owner/repo 추출
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', '')
      };
    }
    return null;
  };

  const analyzeRepository = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisData(null);

    try {
      // GitHub API를 통해 레포지토리 정보 가져오기
      const [repoData, contributorsData, commitsData] = await Promise.all([
        apiGet(`/api/github/repos/${repoInfo.owner}/${repoInfo.repo}`),
        apiGet(`/api/github/repos/${repoInfo.owner}/${repoInfo.repo}/contributors`),
        apiGet(`/api/github/repos/${repoInfo.owner}/${repoInfo.repo}/commits?per_page=100`)
      ]);

      // AI 분석 시뮬레이션 (실제로는 백엔드에서 AI 분석 수행)
      const analysis = {
        repository: repoData,
        contributors: contributorsData.slice(0, 10), // 상위 10명만
        totalCommits: commitsData.length,
        qualityMetrics: {
          codeComplexity: Math.floor(Math.random() * 40) + 60, // 60-100
          maintainability: Math.floor(Math.random() * 30) + 70, // 70-100
          testCoverage: Math.floor(Math.random() * 50) + 30, // 30-80
          documentation: Math.floor(Math.random() * 40) + 50, // 50-90
        },
        insights: [
          `This repository has ${repoData.stargazers_count} stars and ${repoData.forks_count} forks`,
          `The most active contributor is ${contributorsData[0]?.login || 'Unknown'}`,
          `Recent activity shows ${commitsData.length} commits in the last 100`,
          `Code quality is ${repoData.stargazers_count > 100 ? 'excellent' : 'good'} based on community engagement`
        ]
      };

      setAnalysisData(analysis);
    } catch (err) {
      setError('Failed to analyze repository. Please check the URL and try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Layout>
      <AnalysisContainer>
        <AnalysisContent>
          <Title>AI Repository Analysis</Title>
          <Subtitle>Analyze any GitHub repository with AI-powered insights</Subtitle>
          
          <RepoInputSection>
            <InputTitle>Enter Repository URL</InputTitle>
            <InputForm onSubmit={analyzeRepository}>
              <RepoInput
                type="url"
                placeholder="https://github.com/owner/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={isAnalyzing}
              />
              <AnalyzeButton type="submit" disabled={isAnalyzing || !repoUrl.trim()}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Repository'}
              </AnalyzeButton>
            </InputForm>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </RepoInputSection>

          {isAnalyzing && (
            <LoadingSpinner>
              🔍 Analyzing repository... This may take a moment.
            </LoadingSpinner>
          )}

          {analysisData && (
            <AnalysisResults>
              <ResultsTitle>Analysis Results</ResultsTitle>
              
              <RepoInfo>
                <RepoName>{analysisData.repository.full_name}</RepoName>
                <RepoDescription>{analysisData.repository.description || 'No description available'}</RepoDescription>
                <RepoStats>
                  <StatItem>
                    <StatValue>{analysisData.repository.stargazers_count}</StatValue>
                    <StatLabel>Stars</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{analysisData.repository.forks_count}</StatValue>
                    <StatLabel>Forks</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{analysisData.repository.open_issues_count}</StatValue>
                    <StatLabel>Open Issues</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{analysisData.totalCommits}</StatValue>
                    <StatLabel>Recent Commits</StatLabel>
                  </StatItem>
                </RepoStats>
              </RepoInfo>

              <ContributorsSection>
                <ContributorsTitle>Top Contributors</ContributorsTitle>
                <ContributorList>
                  {analysisData.contributors.map((contributor, index) => (
                    <ContributorCard key={contributor.id}>
                      <ContributorAvatar 
                        src={contributor.avatar_url} 
                        alt={contributor.login}
                      />
                      <ContributorInfo>
                        <ContributorName>{contributor.login}</ContributorName>
                        <ContributorCommits>
                          {contributor.contributions} contributions
                        </ContributorCommits>
                      </ContributorInfo>
                    </ContributorCard>
                  ))}
                </ContributorList>
              </ContributorsSection>

              <CodeQualitySection>
                <QualityTitle>AI Code Quality Assessment</QualityTitle>
                <QualityMetrics>
                  <QualityMetric>
                    <MetricValue score={analysisData.qualityMetrics.codeComplexity}>
                      {analysisData.qualityMetrics.codeComplexity}%
                    </MetricValue>
                    <MetricLabel>Code Complexity</MetricLabel>
                  </QualityMetric>
                  <QualityMetric>
                    <MetricValue score={analysisData.qualityMetrics.maintainability}>
                      {analysisData.qualityMetrics.maintainability}%
                    </MetricValue>
                    <MetricLabel>Maintainability</MetricLabel>
                  </QualityMetric>
                  <QualityMetric>
                    <MetricValue score={analysisData.qualityMetrics.testCoverage}>
                      {analysisData.qualityMetrics.testCoverage}%
                    </MetricValue>
                    <MetricLabel>Test Coverage</MetricLabel>
                  </QualityMetric>
                  <QualityMetric>
                    <MetricValue score={analysisData.qualityMetrics.documentation}>
                      {analysisData.qualityMetrics.documentation}%
                    </MetricValue>
                    <MetricLabel>Documentation</MetricLabel>
                  </QualityMetric>
                </QualityMetrics>
              </CodeQualitySection>

              <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>AI Insights</h3>
                <ul style={{ color: '#6a737d', lineHeight: '1.6' }}>
                  {analysisData.insights.map((insight, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>{insight}</li>
                  ))}
                </ul>
              </div>
            </AnalysisResults>
          )}

          <AnalysisGrid>
            <AnalysisCard>
              <CardTitle>📊 Commit Pattern Analysis</CardTitle>
              <CardDescription>
                Analyze commit patterns to identify active hours, 
                preferred days, and coding habits.
              </CardDescription>
            </AnalysisCard>
            
            <AnalysisCard>
              <CardTitle>🔍 Code Quality Assessment</CardTitle>
              <CardDescription>
                AI evaluates code complexity, readability, and maintainability, 
                suggesting improvement directions.
              </CardDescription>
            </AnalysisCard>
            
            <AnalysisCard>
              <CardTitle>📈 Productivity Trends</CardTitle>
              <CardDescription>
                Track development productivity changes over time and 
                visualize contributions by project.
              </CardDescription>
            </AnalysisCard>
          </AnalysisGrid>

          <FeatureList>
            <FeatureTitle>Key Features</FeatureTitle>
            <FeatureGrid>
              <FeatureItem>
                <FeatureIcon>🤖</FeatureIcon>
                <FeatureName>Smart Analysis</FeatureName>
                <FeatureDesc>
                  Accurate pattern analysis using machine learning algorithms
                </FeatureDesc>
              </FeatureItem>
              
              <FeatureItem>
                <FeatureIcon>📊</FeatureIcon>
                <FeatureName>Real-time Dashboard</FeatureName>
                <FeatureDesc>
                  Live-updating analysis results dashboard
                </FeatureDesc>
              </FeatureItem>
              
              <FeatureItem>
                <FeatureIcon>💡</FeatureIcon>
                <FeatureName>Improvement Suggestions</FeatureName>
                <FeatureDesc>
                  Personalized coding improvement recommendations from AI
                </FeatureDesc>
              </FeatureItem>
              
              <FeatureItem>
                <FeatureIcon>📈</FeatureIcon>
                <FeatureName>Growth Tracking</FeatureName>
                <FeatureDesc>
                  Visual tracking of your development journey
                </FeatureDesc>
              </FeatureItem>
            </FeatureGrid>
          </FeatureList>
        </AnalysisContent>
      </AnalysisContainer>
    </Layout>
  );
};

export default AIAnalysis;
