import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from '../hooks/useTranslation';

const AdvancedAnalysisContainer = styled.div`
  margin: 2rem 0;
`;

const SectionTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '🚀';
    font-size: 1.5rem;
  }
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const AnalysisCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
`;

const CardTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  color: #24292e;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const MetricCard = styled.div`
  text-align: center;
  padding: 1rem;
  background: ${props => props.color || '#f6f8fa'};
  border-radius: 8px;
  border: 1px solid #e1e5e9;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #24292e;
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.85rem;
  color: #586069;
  font-weight: 500;
`;

const ChartContainer = styled.div`
  height: 300px;
  margin: 1rem 0;
`;

const InsightsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
`;

const InsightItem = styled.li`
  padding: 0.75rem;
  margin: 0.5rem 0;
  background: ${props => {
    switch(props.type) {
      case 'positive': return '#d4edda';
      case 'warning': return '#fff3cd';
      case 'info': return '#d1ecf1';
      default: return '#f8f9fa';
    }
  }};
  border-left: 4px solid ${props => {
    switch(props.type) {
      case 'positive': return '#28a745';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  }};
  border-radius: 4px;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const AdvancedAnalysis = ({ analysisData, repoInfo }) => {
  const [advancedMetrics, setAdvancedMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (analysisData && analysisData.recentCommitsData) {
      // 고급 메트릭 계산
      const metrics = calculateAdvancedMetrics(analysisData, repoInfo);
      setAdvancedMetrics(metrics);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [analysisData, repoInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateAdvancedMetrics = (data, repo) => {
    if (!data) return null;
    
    const commits = data.recentCommitsData || [];
    const contributors = data.contributionPattern?.metrics?.distribution || [];
    
    // 커밋 패턴 분석
    const commitPatterns = analyzeCommitPatterns(commits);
    
    // 코드 복잡도 추정
    const complexityMetrics = estimateComplexity(data);
    
    // 팀 협업 패턴
    const collaborationMetrics = analyzeCollaboration(contributors);
    
    // 프로젝트 건강도
    const healthScore = calculateHealthScore(data, commitPatterns, complexityMetrics, collaborationMetrics);
    
    return {
      commitPatterns,
      complexityMetrics,
      collaborationMetrics,
      healthScore,
      insights: generateInsights(commitPatterns, complexityMetrics, collaborationMetrics, healthScore)
    };
  };

  const analyzeCommitPatterns = (commits) => {
    if (!commits.length) return null;
    
    const hourlyCommits = new Array(24).fill(0);
    const dailyCommits = new Array(7).fill(0);
    
    commits.forEach(commit => {
      const date = new Date(commit.commit.author.date);
      hourlyCommits[date.getHours()]++;
      dailyCommits[date.getDay()]++;
    });
    
    return {
      hourlyDistribution: hourlyCommits,
      dailyDistribution: dailyCommits,
      peakHour: hourlyCommits.indexOf(Math.max(...hourlyCommits)),
      peakDay: dailyCommits.indexOf(Math.max(...dailyCommits))
    };
  };

  const estimateComplexity = (data) => {
    if (!data) return null;
    
    const fileCount = data.repoInfo?.fileCount || 0;
    const commitCount = data.recentCommitsData?.length || 0;
    const branchCount = data.branchStats?.length || 0;
    
    // 간단한 복잡도 점수 계산
    const complexityScore = Math.min(100, (fileCount * 0.1 + commitCount * 0.05 + branchCount * 2));
    
    return {
      score: Math.round(complexityScore),
      level: complexityScore > 70 ? 'High' : complexityScore > 40 ? 'Medium' : 'Low',
      factors: {
        fileCount,
        commitCount,
        branchCount
      }
    };
  };

  const analyzeCollaboration = (contributors) => {
    if (!contributors.length) return null;
    
    const totalCommits = contributors.reduce((sum, c) => sum + (c.total || 0), 0);
    const contributorCount = contributors.length;
    const avgCommitsPerContributor = totalCommits / contributorCount;
    
    // 기여도 분산 계산
    const contributionVariance = contributors.reduce((sum, c) => {
      const diff = (c.total || 0) - avgCommitsPerContributor;
      return sum + (diff * diff);
    }, 0) / contributorCount;
    
    const collaborationIndex = Math.max(0, 100 - Math.sqrt(contributionVariance) * 10);
    
    return {
      contributorCount,
      totalCommits,
      avgCommitsPerContributor: Math.round(avgCommitsPerContributor),
      collaborationIndex: Math.round(collaborationIndex),
      level: collaborationIndex > 70 ? 'High' : collaborationIndex > 40 ? 'Medium' : 'Low'
    };
  };

  const calculateHealthScore = (data, commitPatterns, complexity, collaboration) => {
    if (!data) return 0;
    
    let score = 0;
    
    // 커밋 활동성 (30%)
    if (commitPatterns) {
      const activityScore = Math.min(30, (data.recentCommitsData?.length || 0) * 2);
      score += activityScore;
    }
    
    // 복잡도 관리 (25%)
    if (complexity) {
      const complexityScore = Math.max(0, 25 - (complexity.score - 50) * 0.5);
      score += complexityScore;
    }
    
    // 협업 수준 (25%)
    if (collaboration) {
      score += (collaboration.collaborationIndex / 100) * 25;
    }
    
    // 브랜치 관리 (20%)
    const branchScore = Math.min(20, (data.branchStats?.length || 0) * 2);
    score += branchScore;
    
    return Math.round(Math.min(100, score));
  };

  const generateInsights = (commitPatterns, complexity, collaboration, healthScore) => {
    const insights = [];
    
    if (commitPatterns && commitPatterns.peakHour !== undefined) {
      if (commitPatterns.peakHour >= 9 && commitPatterns.peakHour <= 17) {
        insights.push({
          type: 'positive',
          text: t('analysis.advancedAnalysis.workTimeActivity', { hour: commitPatterns.peakHour })
        });
      } else {
        insights.push({
          type: 'warning',
          text: t('analysis.advancedAnalysis.nonWorkTimeActivity', { hour: commitPatterns.peakHour })
        });
      }
    }
    
    if (complexity) {
      if (complexity.level === 'High') {
        insights.push({
          type: 'warning',
          text: t('analysis.advancedAnalysis.highComplexity')
        });
      } else if (complexity.level === 'Low') {
        insights.push({
          type: 'positive',
          text: t('analysis.advancedAnalysis.wellManagedComplexity')
        });
      }
    }
    
    if (collaboration) {
      if (collaboration.collaborationIndex > 70) {
        insights.push({
          type: 'positive',
          text: t('analysis.advancedAnalysis.healthyCollaboration')
        });
      } else if (collaboration.collaborationIndex < 40) {
        insights.push({
          type: 'warning',
          text: t('analysis.advancedAnalysis.concentratedContributions')
        });
      }
    }
    
    if (healthScore > 80) {
      insights.push({
        type: 'positive',
        text: t('analysis.advancedAnalysis.excellentProjectHealth')
      });
    } else if (healthScore < 50) {
      insights.push({
        type: 'info',
        text: t('analysis.advancedAnalysis.projectImprovementNeeded')
      });
    }
    
    return insights;
  };

  if (loading || !advancedMetrics || !analysisData) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '8px',
        border: '1px solid #e1e5e9',
        textAlign: 'center',
        color: '#666'
      }}>
        <h4 style={{ color: '#007bff', marginBottom: '1rem' }}>{t('analysis.premiumFeatures.advancedAnalysisAI')}</h4>
        <p>{t('analysis.premiumFeatures.advancedAnalysisDescription')}</p>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '6px', 
          marginTop: '1rem',
          border: '1px solid #dee2e6'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#ff8c42' }}>
            {t('analysis.premiumFeatures.underDevelopment')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdvancedAnalysisContainer>
      <SectionTitle>{t('analysis.advancedAnalysis.title')}</SectionTitle>
      
      <AnalysisGrid>
        {/* 프로젝트 건강도 */}
        <AnalysisCard>
          <CardTitle>
            <span>💚</span>
{t('analysis.advancedAnalysis.projectHealth')}
          </CardTitle>
          <MetricGrid>
            <MetricCard color="#d4edda">
              <MetricValue>{advancedMetrics.healthScore}/100</MetricValue>
              <MetricLabel>{t('analysis.advancedAnalysis.overallScore')}</MetricLabel>
            </MetricCard>
            <MetricCard color={advancedMetrics.complexityMetrics?.level === 'Low' ? '#d4edda' : 
                             advancedMetrics.complexityMetrics?.level === 'Medium' ? '#fff3cd' : '#f8d7da'}>
              <MetricValue>{advancedMetrics.complexityMetrics?.level || 'N/A'}</MetricValue>
              <MetricLabel>{t('analysis.advancedAnalysis.complexity')}</MetricLabel>
            </MetricCard>
            <MetricCard color={advancedMetrics.collaborationMetrics?.level === 'High' ? '#d4edda' : 
                             advancedMetrics.collaborationMetrics?.level === 'Medium' ? '#fff3cd' : '#f8d7da'}>
              <MetricValue>{advancedMetrics.collaborationMetrics?.level || 'N/A'}</MetricValue>
              <MetricLabel>{t('analysis.advancedAnalysis.collaborationLevel')}</MetricLabel>
            </MetricCard>
          </MetricGrid>
        </AnalysisCard>

        {/* 커밋 패턴 분석 */}
        {advancedMetrics.commitPatterns && (
          <AnalysisCard>
            <CardTitle>
              <span>📊</span>
{t('analysis.advancedAnalysis.commitPatternAnalysis')}
            </CardTitle>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={advancedMetrics.commitPatterns.hourlyDistribution.map((value, index) => ({
                  hour: `${index}:00`,
                  commits: value
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="commits" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            <MetricGrid>
              <MetricCard>
                <MetricValue>{advancedMetrics.commitPatterns.peakHour}:00</MetricValue>
                <MetricLabel>{t('analysis.advancedAnalysis.peakActivityTime')}</MetricLabel>
              </MetricCard>
            </MetricGrid>
          </AnalysisCard>
        )}

        {/* 협업 메트릭 */}
        {advancedMetrics.collaborationMetrics && (
          <AnalysisCard>
            <CardTitle>
              <span>👥</span>
{t('analysis.advancedAnalysis.teamCollaborationAnalysis')}
            </CardTitle>
            <MetricGrid>
              <MetricCard>
                <MetricValue>{advancedMetrics.collaborationMetrics.contributorCount}</MetricValue>
                <MetricLabel>{t('analysis.advancedAnalysis.contributorCount')}</MetricLabel>
              </MetricCard>
              <MetricCard>
                <MetricValue>{advancedMetrics.collaborationMetrics.avgCommitsPerContributor}</MetricValue>
                <MetricLabel>{t('analysis.advancedAnalysis.avgCommitsPerContributor')}</MetricLabel>
              </MetricCard>
              <MetricCard>
                <MetricValue>{advancedMetrics.collaborationMetrics.collaborationIndex}/100</MetricValue>
                <MetricLabel>{t('analysis.advancedAnalysis.collaborationIndex')}</MetricLabel>
              </MetricCard>
            </MetricGrid>
          </AnalysisCard>
        )}

        {/* 복잡도 분석 */}
        {advancedMetrics.complexityMetrics && (
          <AnalysisCard>
            <CardTitle>
              <span>🧩</span>
{t('analysis.advancedAnalysis.projectComplexity')}
            </CardTitle>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: t('analysis.advancedAnalysis.fileCount'), value: advancedMetrics.complexityMetrics.factors.fileCount },
                      { name: t('analysis.advancedAnalysis.commitCount'), value: Math.min(advancedMetrics.complexityMetrics.factors.commitCount, 100) },
                      { name: t('analysis.advancedAnalysis.branchCount'), value: advancedMetrics.complexityMetrics.factors.branchCount * 5 }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#667eea" />
                    <Cell fill="#764ba2" />
                    <Cell fill="#f093fb" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </AnalysisCard>
        )}
      </AnalysisGrid>

      {/* 인사이트 */}
      <AnalysisCard>
        <CardTitle>
          <span>💡</span>
{t('analysis.advancedAnalysis.aiInsights')}
        </CardTitle>
        <InsightsList>
          {advancedMetrics.insights?.map((insight, index) => (
            <InsightItem key={index} type={insight.type}>
              {insight.text}
            </InsightItem>
          )) || (
            <InsightItem type="info">
{t('analysis.advancedAnalysis.insufficientData')}
            </InsightItem>
          )}
        </InsightsList>
      </AnalysisCard>
    </AdvancedAnalysisContainer>
  );
};

export default AdvancedAnalysis;
