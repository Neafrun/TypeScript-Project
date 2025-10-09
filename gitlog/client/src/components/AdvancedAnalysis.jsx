import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
          text: `개발 활동이 업무 시간(${commitPatterns.peakHour}시)에 집중되어 있어 팀 협업에 유리합니다.`
        });
      } else {
        insights.push({
          type: 'warning',
          text: `개발 활동이 비업무 시간(${commitPatterns.peakHour}시)에 집중되어 있습니다. 팀 협업 일정을 검토해보세요.`
        });
      }
    }
    
    if (complexity) {
      if (complexity.level === 'High') {
        insights.push({
          type: 'warning',
          text: `프로젝트 복잡도가 높습니다. 코드 리팩토링이나 모듈화를 고려해보세요.`
        });
      } else if (complexity.level === 'Low') {
        insights.push({
          type: 'positive',
          text: `프로젝트 복잡도가 적절하게 관리되고 있습니다.`
        });
      }
    }
    
    if (collaboration) {
      if (collaboration.collaborationIndex > 70) {
        insights.push({
          type: 'positive',
          text: `팀원 간 균등한 기여도 분산으로 건강한 협업 환경을 유지하고 있습니다.`
        });
      } else if (collaboration.collaborationIndex < 40) {
        insights.push({
          type: 'warning',
          text: `특정 개발자에게 기여도가 집중되어 있습니다. 지식 공유를 늘려보세요.`
        });
      }
    }
    
    if (healthScore > 80) {
      insights.push({
        type: 'positive',
        text: `전체적인 프로젝트 건강도가 우수합니다!`
      });
    } else if (healthScore < 50) {
      insights.push({
        type: 'info',
        text: `프로젝트 개선 여지가 있습니다. 커밋 활동과 협업 패턴을 개선해보세요.`
      });
    }
    
    return insights;
  };

  if (loading || !advancedMetrics || !analysisData) {
    return (
      <AdvancedAnalysisContainer>
        <SectionTitle>고급 분석 중...</SectionTitle>
      </AdvancedAnalysisContainer>
    );
  }

  return (
    <AdvancedAnalysisContainer>
      <SectionTitle>고급 분석 & 인사이트</SectionTitle>
      
      <AnalysisGrid>
        {/* 프로젝트 건강도 */}
        <AnalysisCard>
          <CardTitle>
            <span>💚</span>
            프로젝트 건강도
          </CardTitle>
          <MetricGrid>
            <MetricCard color="#d4edda">
              <MetricValue>{advancedMetrics.healthScore}/100</MetricValue>
              <MetricLabel>종합 점수</MetricLabel>
            </MetricCard>
            <MetricCard color={advancedMetrics.complexityMetrics?.level === 'Low' ? '#d4edda' : 
                             advancedMetrics.complexityMetrics?.level === 'Medium' ? '#fff3cd' : '#f8d7da'}>
              <MetricValue>{advancedMetrics.complexityMetrics?.level || 'N/A'}</MetricValue>
              <MetricLabel>복잡도</MetricLabel>
            </MetricCard>
            <MetricCard color={advancedMetrics.collaborationMetrics?.level === 'High' ? '#d4edda' : 
                             advancedMetrics.collaborationMetrics?.level === 'Medium' ? '#fff3cd' : '#f8d7da'}>
              <MetricValue>{advancedMetrics.collaborationMetrics?.level || 'N/A'}</MetricValue>
              <MetricLabel>협업 수준</MetricLabel>
            </MetricCard>
          </MetricGrid>
        </AnalysisCard>

        {/* 커밋 패턴 분석 */}
        {advancedMetrics.commitPatterns && (
          <AnalysisCard>
            <CardTitle>
              <span>📊</span>
              커밋 패턴 분석
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
                <MetricLabel>최대 활동 시간</MetricLabel>
              </MetricCard>
            </MetricGrid>
          </AnalysisCard>
        )}

        {/* 협업 메트릭 */}
        {advancedMetrics.collaborationMetrics && (
          <AnalysisCard>
            <CardTitle>
              <span>👥</span>
              팀 협업 분석
            </CardTitle>
            <MetricGrid>
              <MetricCard>
                <MetricValue>{advancedMetrics.collaborationMetrics.contributorCount}</MetricValue>
                <MetricLabel>기여자 수</MetricLabel>
              </MetricCard>
              <MetricCard>
                <MetricValue>{advancedMetrics.collaborationMetrics.avgCommitsPerContributor}</MetricValue>
                <MetricLabel>평균 커밋/인</MetricLabel>
              </MetricCard>
              <MetricCard>
                <MetricValue>{advancedMetrics.collaborationMetrics.collaborationIndex}/100</MetricValue>
                <MetricLabel>협업 지수</MetricLabel>
              </MetricCard>
            </MetricGrid>
          </AnalysisCard>
        )}

        {/* 복잡도 분석 */}
        {advancedMetrics.complexityMetrics && (
          <AnalysisCard>
            <CardTitle>
              <span>🧩</span>
              프로젝트 복잡도
            </CardTitle>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: '파일 수', value: advancedMetrics.complexityMetrics.factors.fileCount },
                      { name: '커밋 수', value: Math.min(advancedMetrics.complexityMetrics.factors.commitCount, 100) },
                      { name: '브랜치 수', value: advancedMetrics.complexityMetrics.factors.branchCount * 5 }
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
          AI 인사이트 & 추천사항
        </CardTitle>
        <InsightsList>
          {advancedMetrics.insights?.map((insight, index) => (
            <InsightItem key={index} type={insight.type}>
              {insight.text}
            </InsightItem>
          )) || (
            <InsightItem type="info">
              분석 데이터가 부족하여 인사이트를 생성할 수 없습니다.
            </InsightItem>
          )}
        </InsightsList>
      </AnalysisCard>
    </AdvancedAnalysisContainer>
  );
};

export default AdvancedAnalysis;
