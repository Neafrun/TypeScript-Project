import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const AnalysisContainer = styled.div`
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const InputCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  margin-bottom: 2rem;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 1rem;
  border: 2px solid #e1e4e8;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #28a745;
  }

  &::placeholder {
    color: #6a737d;
  }
`;

const AnalyzeButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const LoadingCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  text-align: center;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ErrorCard = styled.div`
  background: rgba(255, 235, 238, 0.95);
  border: 2px solid #e57373;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  text-align: center;
  backdrop-filter: blur(15px);
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #28a745;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ResultsCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #24292e;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e1e4e8;
  padding-bottom: 0.5rem;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: #f6f8fa;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid ${props => props.color || '#28a745'};
`;

const MetricTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: #586069;
  margin-bottom: 0.5rem;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #24292e;
`;

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
`;

const RecommendationItem = styled.li`
  background: ${props => {
    if (props.priority === 'High') return '#fff5f5';
    if (props.priority === 'Medium') return '#fffbf0';
    return '#f0f9ff';
  }};
  border-left: 4px solid ${props => {
    if (props.priority === 'High') return '#dc3545';
    if (props.priority === 'Medium') return '#ffc107';
    return '#17a2b8';
  }};
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0 8px 8px 0;
`;

const ContributorList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ContributorItem = styled.div`
  background: #f6f8fa;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #e1e4e8;
`;

const ContributorAvatar = styled.div`
  flex-shrink: 0;
`;

const ContributorInfo = styled.div`
  flex: 1;
`;

const ContributorName = styled.div`
  font-weight: 600;
  color: #24292e;
  margin-bottom: 0.25rem;
`;

const ContributorStats = styled.div`
  font-size: 0.9rem;
  color: #586069;
`;

const ChartContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  margin-bottom: 2rem;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ChartTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const ChartSubtitle = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 2rem;
  font-style: italic;
`;

const PriorityBadge = styled.span`
  background: ${props => {
    if (props.priority === 'High') return '#dc3545';
    if (props.priority === 'Medium') return '#ffc107';
    return '#17a2b8';
  }};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-right: 0.5rem;
`;

const ErrorMessage = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const RepositoryAnalysis = () => {
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 차트 데이터 생성 함수
  const generateChartData = (contributors) => {
    if (!contributors || contributors.length === 0) return [];
    
    return contributors.slice(0, 10).map(contributor => {
      const commits = contributor.commits || contributor.total || 0;
      
      // 코드 품질 점수 계산 (0-100점) - 더 정교한 기준
      let qualityScore = 0;
      
      // 1. 커밋 일관성 점수 (25점 만점)
      // 적절한 커밋 수가 가장 높은 점수 (너무 많거나 적으면 감점)
      if (commits >= 20 && commits <= 100) qualityScore += 25; // 적절한 범위
      else if (commits >= 10 && commits <= 150) qualityScore += 20; // 허용 가능한 범위
      else if (commits >= 5 && commits <= 200) qualityScore += 15; // 보통 범위
      else if (commits > 0) qualityScore += 10; // 최소 점수
      else qualityScore += 0; // 커밋이 없으면 0점
      
      // 2. 기여도 균형 점수 (25점 만점)
      // 너무 높은 기여도는 단일 의존성을 의미하므로 감점
      const contributionRate = contributor.percentage || 0;
      if (contributionRate >= 20 && contributionRate <= 40) qualityScore += 25; // 이상적인 범위
      else if (contributionRate >= 15 && contributionRate <= 50) qualityScore += 20; // 양호한 범위
      else if (contributionRate >= 10 && contributionRate <= 60) qualityScore += 15; // 보통 범위
      else if (contributionRate >= 5 && contributionRate <= 80) qualityScore += 10; // 허용 가능
      else if (contributionRate > 0) qualityScore += 5; // 최소 점수
      
      // 3. 활동 패턴 점수 (25점 만점)
      // 지속적인 기여가 있는지 평가
      const weeks = contributor.weeks || [];
      const activeWeeks = weeks.filter(week => week.c > 0).length;
      const totalWeeks = weeks.length;
      
      if (totalWeeks > 0) {
        const activityRate = activeWeeks / totalWeeks;
        if (activityRate >= 0.3 && activityRate <= 0.7) qualityScore += 25; // 적절한 활동률
        else if (activityRate >= 0.2 && activityRate <= 0.8) qualityScore += 20; // 양호한 활동률
        else if (activityRate >= 0.1 && activityRate <= 0.9) qualityScore += 15; // 보통 활동률
        else if (activityRate > 0) qualityScore += 10; // 최소 활동
      } else {
        qualityScore += 5; // 활동 데이터가 없으면 최소 점수
      }
      
      // 4. 코드 변경 품질 점수 (25점 만점)
      // 추가/삭제 비율을 통해 코드 품질 추정
      const totalAdditions = weeks.reduce((sum, week) => sum + (week.a || 0), 0);
      const totalDeletions = weeks.reduce((sum, week) => sum + (week.d || 0), 0);
      const totalChanges = totalAdditions + totalDeletions;
      
      if (totalChanges > 0) {
        const deletionRatio = totalDeletions / totalChanges;
        // 리팩토링과 개선을 위한 적절한 삭제 비율
        if (deletionRatio >= 0.2 && deletionRatio <= 0.4) qualityScore += 25; // 이상적인 비율
        else if (deletionRatio >= 0.1 && deletionRatio <= 0.5) qualityScore += 20; // 양호한 비율
        else if (deletionRatio >= 0.05 && deletionRatio <= 0.6) qualityScore += 15; // 보통 비율
        else if (deletionRatio > 0) qualityScore += 10; // 최소 점수
        else qualityScore += 5; // 삭제가 없으면 최소 점수
      } else {
        qualityScore += 5; // 변경 데이터가 없으면 최소 점수
      }
      
      // 최대 100점으로 제한
      qualityScore = Math.min(100, Math.max(0, qualityScore));
      
      return {
        name: contributor.author || contributor.authorName || 'Unknown',
        avatar: contributor.avatar || null,
        qualityScore: Math.round(qualityScore),
        commits: commits,
        percentage: contributor.percentage || 0,
        // 디버깅을 위한 상세 정보
        breakdown: {
          consistency: commits >= 20 && commits <= 100 ? 25 : commits >= 10 && commits <= 150 ? 20 : commits >= 5 && commits <= 200 ? 15 : commits > 0 ? 10 : 0,
          balance: contributionRate >= 20 && contributionRate <= 40 ? 25 : contributionRate >= 15 && contributionRate <= 50 ? 20 : contributionRate >= 10 && contributionRate <= 60 ? 15 : contributionRate >= 5 && contributionRate <= 80 ? 10 : contributionRate > 0 ? 5 : 0,
          activity: totalWeeks > 0 ? (() => {
            const activityRate = activeWeeks / totalWeeks;
            return activityRate >= 0.3 && activityRate <= 0.7 ? 25 : activityRate >= 0.2 && activityRate <= 0.8 ? 20 : activityRate >= 0.1 && activityRate <= 0.9 ? 15 : activityRate > 0 ? 10 : 5;
          })() : 5,
          codeQuality: totalChanges > 0 ? (() => {
            const deletionRatio = totalDeletions / totalChanges;
            return deletionRatio >= 0.2 && deletionRatio <= 0.4 ? 25 : deletionRatio >= 0.1 && deletionRatio <= 0.5 ? 20 : deletionRatio >= 0.05 && deletionRatio <= 0.6 ? 15 : deletionRatio > 0 ? 10 : 5;
          })() : 5
        }
      };
    }).sort((a, b) => b.qualityScore - a.qualityScore); // 품질 점수 순으로 정렬
  };

  const parseRepositoryUrl = (url) => {
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
          repo: match[2].replace(/\.git$/, '') // .git 제거
        };
      }
    }
    return null;
  };

  const handleAnalyze = async () => {
    if (!repositoryUrl.trim()) {
      setError('레포지토리 URL을 입력해주세요.');
      return;
    }

    const repoInfo = parseRepositoryUrl(repositoryUrl);
    if (!repoInfo) {
      setError('올바른 GitHub 레포지토리 URL을 입력해주세요. (예: https://github.com/owner/repo 또는 owner/repo)');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);
    setCurrentPage(1); // 새 분석 시작 시 첫 페이지로 리셋

    try {
      // 1. 레포지토리 정보 가져오기
      const repoResponse = await fetch(`http://localhost:5000/api/repository/info/${repoInfo.owner}/${repoInfo.repo}`);
      if (!repoResponse.ok) {
        const errorData = await repoResponse.json();
        throw new Error(errorData.error || '레포지토리를 찾을 수 없습니다.');
      }
      const repoData = await repoResponse.json();

      // 2. 커밋 통계 가져오기
      const commitsResponse = await fetch(`http://localhost:5000/api/repository/commits/${repoInfo.owner}/${repoInfo.repo}`);
      let commitsData = [];
      if (commitsResponse.ok) {
        commitsData = await commitsResponse.json();
      } else if (commitsResponse.status === 403) {
        console.warn('커밋 통계 API 한도 초과');
      }

      // 3. 모든 브랜치의 커밋 가져오기
      const allCommitsResponse = await fetch(`http://localhost:5000/api/repository/all-commits/${repoInfo.owner}/${repoInfo.repo}`);
      let recentCommitsData = [];
      let branchStats = [];
      let totalCommitsAcrossBranches = 0;
      if (allCommitsResponse.ok) {
        const allCommitsData = await allCommitsResponse.json();
        recentCommitsData = allCommitsData.commits || [];
        branchStats = allCommitsData.branchStats || [];
        totalCommitsAcrossBranches = allCommitsData.totalCommitsAcrossBranches || 0;
        console.log(`총 ${allCommitsData.totalCommits}개 고유 커밋, ${totalCommitsAcrossBranches}개 브랜치별 커밋, ${allCommitsData.totalBranches}개 브랜치에서 분석`);
        
        // 커밋 수 제한 정보 표시
        if (allCommitsData.analysisLimit?.isLimited) {
          console.warn(`커밋 수가 많아 분석이 제한되었습니다: ${allCommitsData.analysisLimit.originalCount}개 중 ${allCommitsData.analysisLimit.maxCommits}개만 분석`);
        }
        
        // 분석 가능 여부를 모든 브랜치 커밋 수로 판단
        if (totalCommitsAcrossBranches < 5) {
          const branchesCount = allCommitsData.totalBranches || 0;
          const processedBranches = allCommitsData.processedBranches || 0;
          const uniqueCommits = allCommitsData.totalCommits || 0;
          
          let errorMessage = `분석할 데이터가 부족합니다.\n\n`;
          errorMessage += `📊 현재 레포지토리 상태:\n`;
          errorMessage += `• 총 브랜치 수: ${branchesCount}개\n`;
          errorMessage += `• 분석된 브랜치 수: ${processedBranches}개\n`;
          errorMessage += `• 브랜치별 총 커밋 수: ${totalCommitsAcrossBranches}개\n`;
          errorMessage += `• 고유 커밋 수: ${uniqueCommits}개\n\n`;
          errorMessage += `❌ 분석 실패 이유:\n`;
          
          if (totalCommitsAcrossBranches === 0) {
            errorMessage += `• 레포지토리에 커밋이 전혀 없습니다.\n`;
            errorMessage += `• 빈 레포지토리이거나 브랜치 접근 권한이 없을 수 있습니다.\n`;
          } else if (totalCommitsAcrossBranches < 5) {
            errorMessage += `• 커밋 수가 너무 적습니다 (${totalCommitsAcrossBranches}개).\n`;
            errorMessage += `• 의미있는 분석을 위해서는 최소 5개 이상의 커밋이 필요합니다.\n`;
          }
          
          errorMessage += `\n💡 해결 방법:\n`;
          errorMessage += `• 레포지토리에 더 많은 커밋을 추가해주세요.\n`;
          errorMessage += `• 여러 파일과 폴더를 포함한 프로젝트로 개발해주세요.\n`;
          errorMessage += `• 여러 기여자가 참여하는 프로젝트로 만들어주세요.\n`;
          
          throw new Error(errorMessage);
        }
      } else if (allCommitsResponse.status === 403) {
        console.warn('모든 브랜치 커밋 API 한도 초과, 기본 커밋으로 대체');
        // API 한도 초과 시 기본 커밋 가져오기
        const recentCommitsResponse = await fetch(`http://localhost:5000/api/repository/recent-commits/${repoInfo.owner}/${repoInfo.repo}`);
        if (recentCommitsResponse.ok) {
          recentCommitsData = await recentCommitsResponse.json();
          totalCommitsAcrossBranches = recentCommitsData.length;
          if (totalCommitsAcrossBranches < 5) {
            let errorMessage = `분석할 데이터가 부족합니다.\n\n`;
            errorMessage += `📊 현재 레포지토리 상태:\n`;
            errorMessage += `• 메인 브랜치 커밋 수: ${totalCommitsAcrossBranches}개\n`;
            errorMessage += `• API 한도 초과로 모든 브랜치 분석 불가\n\n`;
            errorMessage += `❌ 분석 실패 이유:\n`;
            errorMessage += `• 커밋 수가 너무 적습니다 (${totalCommitsAcrossBranches}개).\n`;
            errorMessage += `• 의미있는 분석을 위해서는 최소 5개 이상의 커밋이 필요합니다.\n`;
            errorMessage += `• GitHub API 요청 한도 초과로 다른 브랜치 확인 불가\n\n`;
            errorMessage += `💡 해결 방법:\n`;
            errorMessage += `• 레포지토리에 더 많은 커밋을 추가해주세요.\n`;
            errorMessage += `• 1시간 후 다시 시도해주세요 (API 한도 초기화).\n`;
            errorMessage += `• 여러 파일과 폴더를 포함한 프로젝트로 개발해주세요.\n`;
            
            throw new Error(errorMessage);
          }
        }
      }

      // 4. AI 분석 수행
      const analysisResponse = await fetch('http://localhost:5000/api/repository/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: repoInfo.owner,
          repo: repoInfo.repo,
          commits: recentCommitsData,
          contributors: commitsData
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('분석을 수행할 수 없습니다.');
      }

      const analysisData = await analysisResponse.json();
      setAnalysis({
        ...analysisData,
        repository: repoData,
        branchStats: branchStats,
        totalCommitsAcrossBranches: totalCommitsAcrossBranches
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <AnalysisContainer>
        <MainContent>
          <Title>레포지토리 분석</Title>
          
          <InputCard>
            <InputGroup>
              <Input
                type="text"
                placeholder="GitHub 레포지토리 URL을 입력하세요 (예: https://github.com/facebook/react)"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <AnalyzeButton 
                onClick={handleAnalyze} 
                disabled={loading}
              >
                {loading ? '분석 중...' : '분석하기'}
              </AnalyzeButton>
            </InputGroup>
          </InputCard>

          {error && (
            <ErrorMessage style={{ 
              whiteSpace: 'pre-line', 
              textAlign: 'left', 
              lineHeight: '1.6',
              fontSize: '0.9rem'
            }}>
              {error}
            </ErrorMessage>
          )}

          {loading && (
            <LoadingCard>
              <Spinner />
              <p>레포지토리를 분석하고 있습니다...</p>
            </LoadingCard>
          )}

          {analysis && (
            <>
              {/* 코드 품질 차트 */}
              <ChartContainer>
                <ChartTitle>코드 품질 점수</ChartTitle>
                <ChartSubtitle>기여자별 코드 품질 평가</ChartSubtitle>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={generateChartData(analysis.analysis.contributionPattern.metrics.distribution)}
                    margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="name"
                      hide={true}
                    />
                    <YAxis
                      label={{ value: '품질 점수', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '14px', fill: '#666' } }}
                      domain={[0, 100]}
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                      tickCount={6}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value}점`,
                        '코드 품질 점수'
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Bar 
                      dataKey="qualityScore" 
                      name="qualityScore" 
                      radius={[4, 4, 0, 0]}
                    >
                      {generateChartData(analysis.analysis.contributionPattern.metrics.distribution).map((entry, index) => {
                        const score = entry.qualityScore;
                        let color = '#9E9E9E'; // 기본 회색
                        
                        if (score >= 80) color = '#4CAF50'; // 초록색 (80-100점)
                        else if (score >= 60) color = '#2196F3'; // 파란색 (60-79점)
                        else if (score >= 40) color = '#FF9800'; // 주황색 (40-59점)
                        else if (score >= 20) color = '#FF5722'; // 빨간색 (20-39점)
                        
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                
                {/* 점수별 색상 범례 */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginTop: '20px',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#4CAF50', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '11px', color: '#666' }}>80-100점</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#2196F3', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '11px', color: '#666' }}>60-79점</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#FF9800', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '11px', color: '#666' }}>40-59점</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#FF5722', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '11px', color: '#666' }}>20-39점</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#9E9E9E', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '11px', color: '#666' }}>0-19점</span>
                  </div>
                </div>

                {/* 기여자 프로필 이미지와 이름 표시 */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-around', 
                  alignItems: 'center',
                  marginTop: '20px',
                  padding: '0 20px'
                }}>
                  {generateChartData(analysis.analysis.contributionPattern.metrics.distribution).map((contributor, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      minWidth: '80px'
                    }}>
                      {contributor.avatar ? (
                        <img 
                          src={contributor.avatar} 
                          alt={contributor.name}
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%',
                            marginBottom: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }} 
                        />
                      ) : (
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          backgroundColor: '#6c757d', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          marginBottom: '8px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          {contributor.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '2px'
                        }}>
                          {contributor.name}
                        </div>
                        <div style={{ 
                          fontSize: '10px', 
                          color: '#666',
                          fontWeight: '500'
                        }}>
                          {contributor.qualityScore}점
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartContainer>

              <ResultsCard>
                <SectionTitle>📊 분석 결과: {analysis.repository.full_name}</SectionTitle>
              
              <SectionTitle>브랜치별 코드 품질 분석</SectionTitle>
              <div style={{ 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                borderRadius: '12px', 
                padding: '1.5rem', 
                marginBottom: '1.5rem',
                border: '1px solid #dee2e6'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.1rem' }}>📊 코드 품질 평가 기준</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                  <div>
                    <strong style={{ color: '#4CAF50' }}>1. 커밋 일관성 (25점)</strong>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      적절한 커밋 수(20-100개)가 가장 높은 점수. 너무 많거나 적으면 감점.
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: '#2196F3' }}>2. 기여도 균형 (25점)</strong>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      이상적인 기여도(20-40%). 너무 높으면 단일 의존성으로 감점.
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: '#FF9800' }}>3. 활동 패턴 (25점)</strong>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      지속적인 기여 패턴(30-70% 활동률)이 가장 높은 점수.
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: '#FF5722' }}>4. 코드 변경 품질 (25점)</strong>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>
                      리팩토링을 위한 적절한 삭제 비율(20-40%)이 이상적.
                    </p>
                  </div>
                </div>
              </div>
              
              {analysis.branchStats && analysis.branchStats.length > 0 ? (
                <MetricGrid>
                  {analysis.branchStats.slice(0, 8).map((branch, index) => {
                    // 브랜치별 품질 점수 계산
                    const branchCommits = analysis.analysis.contributionPattern.metrics.distribution.filter(
                      contributor => contributor.weeks && contributor.weeks.length > 0
                    ).length;
                    
                    let branchQualityScore = 0;
                    if (branch.commitCount > 50) branchQualityScore += 40;
                    else if (branch.commitCount > 20) branchQualityScore += 30;
                    else if (branch.commitCount > 10) branchQualityScore += 25;
                    else if (branch.commitCount > 5) branchQualityScore += 20;
                    else if (branch.commitCount > 0) branchQualityScore += 15;
                    
                    // 브랜치 보호 여부에 따른 추가 점수
                    if (branch.branchProtected) branchQualityScore += 20;
                    
                    // 기여자 다양성 점수
                    const contributorDiversity = Math.min(30, branchCommits * 3);
                    branchQualityScore += contributorDiversity;
                    
                    branchQualityScore = Math.min(100, branchQualityScore);
                    
                    return (
                      <MetricCard key={index} color={
                        branchQualityScore >= 80 ? '#4CAF50' :
                        branchQualityScore >= 60 ? '#2196F3' :
                        branchQualityScore >= 40 ? '#FF9800' :
                        branchQualityScore >= 20 ? '#FF5722' : '#9E9E9E'
                      }>
                        <MetricTitle>{branch.branch}</MetricTitle>
                        <MetricValue>{branchQualityScore}/100</MetricValue>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                          {branch.commitCount}개 커밋
                          {branch.branchProtected && <span style={{ color: '#28a745', marginLeft: '0.5rem' }}>🔒 보호됨</span>}
                        </div>
                      </MetricCard>
                    );
                  })}
                </MetricGrid>
              ) : (
                <MetricGrid>
                  <MetricCard color={analysis.analysis.codeQuality.score >= 80 ? '#28a745' : analysis.analysis.codeQuality.score >= 60 ? '#ffc107' : '#dc3545'}>
                    <MetricTitle>전체 품질 점수</MetricTitle>
                    <MetricValue>{analysis.analysis.codeQuality.score}/100</MetricValue>
                  </MetricCard>
                  <MetricCard>
                    <MetricTitle>품질 레벨</MetricTitle>
                    <MetricValue>{analysis.analysis.codeQuality.level}</MetricValue>
                  </MetricCard>
                  <MetricCard>
                    <MetricTitle>총 커밋 수</MetricTitle>
                    <MetricValue>{analysis.analysis.codeQuality.metrics.totalCommits}</MetricValue>
                  </MetricCard>
                  <MetricCard>
                    <MetricTitle>기여자 수</MetricTitle>
                    <MetricValue>{analysis.analysis.codeQuality.metrics.contributorsCount}</MetricValue>
                  </MetricCard>
                </MetricGrid>
              )}

              <SectionTitle>전체 기여자 순위</SectionTitle>
              <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                모든 브랜치에서의 기여도를 기준으로 한 전체 기여자 순위입니다.
              </p>
              
                     {analysis.analysis.contributionPattern.metrics.distribution && analysis.analysis.contributionPattern.metrics.distribution.length > 0 && (
                       <>
                         <div style={{
                           display: 'grid',
                           gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                           gap: '1rem',
                           marginBottom: '2rem'
                         }}>
                           {analysis.analysis.contributionPattern.metrics.distribution
                             .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                             .map((contributor, index) => (
                    <div key={index} style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '1px solid #dee2e6',
                      position: 'relative',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {/* 순위 배지 */}
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#6c757d',
                        color: 'white',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flexShrink: 0 }}>
                          {contributor.avatar ? (
                            <img 
                              src={contributor.avatar} 
                              alt={contributor.author} 
                              style={{ 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%',
                                border: '3px solid white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }} 
                            />
                          ) : (
                            <div style={{ 
                              width: '50px', 
                              height: '50px', 
                              borderRadius: '50%', 
                              backgroundColor: '#6c757d', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              border: '3px solid white',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              color: 'white'
                            }}>
                              {contributor.author.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            margin: '0 0 0.5rem 0', 
                            fontSize: '1.1rem', 
                            fontWeight: '600',
                            color: '#2c3e50'
                          }}>
                            {contributor.author}
                          </h4>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            <div style={{ marginBottom: '0.25rem' }}>
                              <strong>{contributor.commits}</strong>개 커밋
                            </div>
                            <div style={{ marginBottom: '0.25rem' }}>
                              전체 기여도 <strong>{contributor.percentage}%</strong>
                            </div>
                            <div style={{ 
                              background: 'linear-gradient(90deg, #4CAF50 0%, #4CAF50 ' + contributor.percentage + '%, #e0e0e0 ' + contributor.percentage + '%, #e0e0e0 100%)',
                              height: '6px',
                              borderRadius: '3px',
                              marginTop: '0.5rem'
                            }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                         ))}
                         </div>
                         
                         {/* 페이지네이션 컨트롤 */}
                         {analysis.analysis.contributionPattern.metrics.distribution.length > itemsPerPage && (
                           <div style={{
                             display: 'flex',
                             justifyContent: 'center',
                             alignItems: 'center',
                             gap: '1rem',
                             marginTop: '2rem',
                             padding: '1rem'
                           }}>
                             <button
                               onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                               disabled={currentPage === 1}
                               style={{
                                 padding: '0.5rem 1rem',
                                 border: '1px solid #ddd',
                                 borderRadius: '6px',
                                 backgroundColor: currentPage === 1 ? '#f5f5f5' : 'white',
                                 cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                 color: currentPage === 1 ? '#999' : '#333'
                               }}
                             >
                               이전
                             </button>
                             
                             <span style={{ fontSize: '0.9rem', color: '#666' }}>
                               {currentPage} / {Math.ceil(analysis.analysis.contributionPattern.metrics.distribution.length / itemsPerPage)} 페이지
                             </span>
                             
                             <button
                               onClick={() => setCurrentPage(Math.min(Math.ceil(analysis.analysis.contributionPattern.metrics.distribution.length / itemsPerPage), currentPage + 1))}
                               disabled={currentPage === Math.ceil(analysis.analysis.contributionPattern.metrics.distribution.length / itemsPerPage)}
                               style={{
                                 padding: '0.5rem 1rem',
                                 border: '1px solid #ddd',
                                 borderRadius: '6px',
                                 backgroundColor: currentPage === Math.ceil(analysis.analysis.contributionPattern.metrics.distribution.length / itemsPerPage) ? '#f5f5f5' : 'white',
                                 cursor: currentPage === Math.ceil(analysis.analysis.contributionPattern.metrics.distribution.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                                 color: currentPage === Math.ceil(analysis.analysis.contributionPattern.metrics.distribution.length / itemsPerPage) ? '#999' : '#333'
                               }}
                             >
                               다음
                             </button>
                           </div>
                         )}
                       </>
                     )}

                     <SectionTitle>브랜치 분석</SectionTitle>
                     {analysis.branchStats && analysis.branchStats.length > 0 && (
                       <>
                         <div style={{
                           background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                           borderRadius: '12px',
                           padding: '1rem',
                           marginBottom: '1.5rem',
                           border: '1px solid #90caf9'
                         }}>
                           <h4 style={{ margin: '0 0 0.5rem 0', color: '#1565c0' }}>📊 전체 브랜치 커밋 통계</h4>
                           <p style={{ margin: '0', fontSize: '0.9rem', color: '#1976d2' }}>
                             총 <strong>{analysis.branchStats.length}개 브랜치</strong>에서
                             <strong> {analysis.totalCommitsAcrossBranches || 0}개 커밋</strong>을 분석했습니다.
                           </p>
                           {analysis.analysisLimit?.isLimited && (
                             <div style={{
                               background: 'rgba(255, 152, 0, 0.1)',
                               border: '1px solid #ff9800',
                               borderRadius: '8px',
                               padding: '0.75rem',
                               marginTop: '0.75rem'
                             }}>
                               <p style={{ margin: '0', fontSize: '0.85rem', color: '#e65100' }}>
                                 ⚠️ <strong>분석 제한:</strong> 커밋 수가 많아 최근 <strong>{analysis.analysisLimit.maxCommits}개</strong>만 분석했습니다.
                                 <br />
                                 전체 커밋 수: <strong>{analysis.analysisLimit.originalCount}개</strong>
                               </p>
                             </div>
                           )}
                         </div>
                  <MetricGrid>
                    {analysis.branchStats.slice(0, 8).map((branch, index) => (
                      <MetricCard key={index} color={
                        branch.commitCount > 50 ? '#4CAF50' :
                        branch.commitCount > 20 ? '#2196F3' :
                        branch.commitCount > 10 ? '#FF9800' :
                        branch.commitCount > 5 ? '#FF5722' : '#9E9E9E'
                      }>
                        <MetricTitle>{branch.branch}</MetricTitle>
                        <MetricValue>{branch.commitCount}개 커밋</MetricValue>
                        {branch.branchProtected && (
                          <div style={{ fontSize: '0.8rem', color: '#28a745', marginTop: '0.5rem' }}>
                            🔒 보호됨
                          </div>
                        )}
                      </MetricCard>
                    ))}
                  </MetricGrid>
                </>
              )}

              <SectionTitle>활동 수준</SectionTitle>
              <p>{analysis.analysis.activityLevel.description}</p>
              <MetricGrid>
                <MetricCard>
                  <MetricTitle>활동 레벨</MetricTitle>
                  <MetricValue>{analysis.analysis.activityLevel.level}</MetricValue>
                </MetricCard>
                <MetricCard>
                  <MetricTitle>최근 커밋</MetricTitle>
                  <MetricValue>{analysis.analysis.activityLevel.metrics.recentCommits}개</MetricValue>
                </MetricCard>
                <MetricCard>
                  <MetricTitle>마지막 커밋</MetricTitle>
                  <MetricValue>{analysis.analysis.activityLevel.metrics.lastCommitDate ? new Date(analysis.analysis.activityLevel.metrics.lastCommitDate).toLocaleDateString() : 'N/A'}</MetricValue>
                </MetricCard>
              </MetricGrid>

              <SectionTitle>추천사항</SectionTitle>
              <RecommendationList>
                {analysis.analysis.recommendations.map((rec, index) => (
                  <RecommendationItem key={index} priority={rec.priority}>
                    <PriorityBadge priority={rec.priority}>{rec.priority}</PriorityBadge>
                    <strong>{rec.title}:</strong> {rec.description}
                  </RecommendationItem>
                ))}
              </RecommendationList>
              </ResultsCard>
            </>
          )}
        </MainContent>
      </AnalysisContainer>
    </Layout>
  );
};

export default RepositoryAnalysis;
