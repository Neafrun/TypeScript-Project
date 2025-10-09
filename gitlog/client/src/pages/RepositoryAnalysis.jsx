import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { apiGet, apiPost } from '../api/client';
import { useAuth } from '../context/AuthContext';

const AnalysisContainer = styled.div`
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    pointer-events: none;
  }
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: white;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 300;
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e1e4e8;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #24292e;
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #586069;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f6f8fa;
    color: #24292e;
  }
`;

const BranchActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ActivityCard = styled.div`
  background: ${props => {
    if (props.level === 'Very Active') return 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)';
    if (props.level === 'Active') return 'linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%)';
    if (props.level === 'Moderate') return 'linear-gradient(135deg, #fff3e0 0%, #fff8f0 100%)';
    if (props.level === 'Low') return 'linear-gradient(135deg, #ffebee 0%, #fff0f0 100%)';
    return 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)';
  }};
  border: 1px solid ${props => {
    if (props.level === 'Very Active') return '#4CAF50';
    if (props.level === 'Active') return '#2196F3';
    if (props.level === 'Moderate') return '#FF9800';
    if (props.level === 'Low') return '#FF5722';
    return '#9E9E9E';
  }};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
`;

const ActivityTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => {
    if (props.level === 'Very Active') return '#2e7d32';
    if (props.level === 'Active') return '#1565c0';
    if (props.level === 'Moderate') return '#e65100';
    if (props.level === 'Low') return '#c62828';
    return '#424242';
  }};
`;

const ActivityValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => {
    if (props.level === 'Very Active') return '#4CAF50';
    if (props.level === 'Active') return '#2196F3';
    if (props.level === 'Moderate') return '#FF9800';
    if (props.level === 'Low') return '#FF5722';
    return '#9E9E9E';
  }};
  margin-bottom: 0.5rem;
`;

const ActivityDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
`;

const RepositoryAnalysis = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showBranchModal, setShowBranchModal] = useState(false);

  // URL 파라미터에서 레포지토리 정보 가져오기
  useEffect(() => {
    const repoParam = searchParams.get('repo');
    if (repoParam) {
      setRepositoryUrl(`https://github.com/${repoParam}`);
    }
  }, [searchParams]);

  // 차트 데이터 생성 함수 - 개선된 코드 품질 기반 평가
  const generateChartData = (contributors) => {
    if (!contributors || contributors.length === 0) return [];
    
    return contributors.slice(0, 10).map(contributor => {
      const commits = contributor.commits || contributor.total || 0;
      const weeks = contributor.weeks || [];
      
      // 개선된 코드 품질 점수 계산 (0-100점)
      let qualityScore = 0;
      let breakdown = {
        commitQuality: 0,
        codeMaintainability: 0,
        collaborationPattern: 0,
        developmentConsistency: 0
      };
      
      // 1. 커밋 품질 점수 (30점 만점)
      // 커밋 크기와 일관성을 고려한 평가
      if (commits >= 15 && commits <= 80) breakdown.commitQuality = 30; // 이상적인 범위
      else if (commits >= 10 && commits <= 120) breakdown.commitQuality = 25; // 양호한 범위
      else if (commits >= 5 && commits <= 200) breakdown.commitQuality = 20; // 보통 범위
      else if (commits >= 1 && commits <= 300) breakdown.commitQuality = 15; // 허용 가능
      else if (commits > 0) breakdown.commitQuality = 10; // 최소 점수
      else breakdown.commitQuality = 0; // 커밋이 없으면 0점
      
      // 2. 코드 유지보수성 점수 (25점 만점)
      // 추가/삭제 비율과 코드 변경 패턴 분석
      const totalAdditions = weeks.reduce((sum, week) => sum + (week.a || 0), 0);
      const totalDeletions = weeks.reduce((sum, week) => sum + (week.d || 0), 0);
      const totalChanges = totalAdditions + totalDeletions;
      
      if (totalChanges > 0) {
        const deletionRatio = totalDeletions / totalChanges;
        const additionDeletionBalance = Math.min(totalAdditions, totalDeletions) / Math.max(totalAdditions, totalDeletions);
        
        // 리팩토링과 코드 개선을 위한 적절한 비율
        if (deletionRatio >= 0.15 && deletionRatio <= 0.35 && additionDeletionBalance >= 0.3) {
          breakdown.codeMaintainability = 25; // 이상적인 리팩토링 패턴
        } else if (deletionRatio >= 0.1 && deletionRatio <= 0.45 && additionDeletionBalance >= 0.2) {
          breakdown.codeMaintainability = 20; // 양호한 리팩토링 패턴
        } else if (deletionRatio >= 0.05 && deletionRatio <= 0.6) {
          breakdown.codeMaintainability = 15; // 보통 패턴
        } else if (deletionRatio > 0) {
          breakdown.codeMaintainability = 10; // 최소 점수
        } else {
          breakdown.codeMaintainability = 5; // 삭제가 없으면 최소 점수
        }
      } else {
        breakdown.codeMaintainability = 5; // 변경 데이터가 없으면 최소 점수
      }
      
      // 3. 협업 패턴 점수 (25점 만점)
      // 기여도 균형과 팀워크 평가
      const contributionRate = contributor.percentage || 0;
      const contributorsCount = contributors.length;
      
      // 이상적인 기여도는 팀 크기와 프로젝트 성숙도에 따라 달라짐
      const idealContributionRate = contributorsCount > 5 ? 15 : contributorsCount > 3 ? 25 : 35;
      const maxIdealRate = contributorsCount > 5 ? 35 : contributorsCount > 3 ? 45 : 55;
      
      if (contributionRate >= idealContributionRate && contributionRate <= maxIdealRate) {
        breakdown.collaborationPattern = 25; // 이상적인 협업 패턴
      } else if (contributionRate >= idealContributionRate * 0.7 && contributionRate <= maxIdealRate * 1.3) {
        breakdown.collaborationPattern = 20; // 양호한 협업 패턴
      } else if (contributionRate >= idealContributionRate * 0.5 && contributionRate <= maxIdealRate * 1.5) {
        breakdown.collaborationPattern = 15; // 보통 협업 패턴
      } else if (contributionRate > 0) {
        breakdown.collaborationPattern = 10; // 최소 점수
      } else {
        breakdown.collaborationPattern = 0; // 기여도가 없으면 0점
      }
      
      // 4. 개발 일관성 점수 (20점 만점)
      // 시간적 일관성과 지속성 평가
      const activeWeeks = weeks.filter(week => week.c > 0).length;
      const totalWeeks = weeks.length;
      
      if (totalWeeks > 0) {
        const activityRate = activeWeeks / totalWeeks;
        const consistencyScore = weeks.reduce((score, week, index) => {
          if (index === 0) return score;
          const prevWeek = weeks[index - 1];
          const currentActivity = week.c > 0 ? 1 : 0;
          const prevActivity = prevWeek.c > 0 ? 1 : 0;
          // 일관성 점수: 연속된 활동 패턴에 보너스
          return score + (currentActivity === prevActivity ? 1 : 0);
        }, 0) / Math.max(1, totalWeeks - 1);
        
        if (activityRate >= 0.4 && activityRate <= 0.8 && consistencyScore >= 0.6) {
          breakdown.developmentConsistency = 20; // 매우 일관적인 개발
        } else if (activityRate >= 0.3 && activityRate <= 0.9 && consistencyScore >= 0.4) {
          breakdown.developmentConsistency = 15; // 양호한 일관성
        } else if (activityRate >= 0.2 && consistencyScore >= 0.3) {
          breakdown.developmentConsistency = 10; // 보통 일관성
        } else if (activityRate > 0) {
          breakdown.developmentConsistency = 5; // 최소 점수
        } else {
          breakdown.developmentConsistency = 0; // 활동이 없으면 0점
        }
      } else {
        breakdown.developmentConsistency = 5; // 데이터가 없으면 최소 점수
      }
      
      // 전체 점수 계산
      qualityScore = breakdown.commitQuality + breakdown.codeMaintainability + 
                   breakdown.collaborationPattern + breakdown.developmentConsistency;
      
      // 최대 100점으로 제한
      qualityScore = Math.min(100, Math.max(0, qualityScore));
      
      return {
        name: contributor.author || contributor.authorName || 'Unknown',
        avatar: contributor.avatar || null,
        qualityScore: Math.round(qualityScore),
        commits: commits,
        percentage: contributor.percentage || 0,
        breakdown: breakdown,
        // 추가 품질 지표
        metrics: {
          totalChanges: totalChanges,
          deletionRatio: totalChanges > 0 ? Math.round((totalDeletions / totalChanges) * 100) / 100 : 0,
          activityRate: totalWeeks > 0 ? Math.round((activeWeeks / totalWeeks) * 100) / 100 : 0,
          avgCommitsPerWeek: totalWeeks > 0 ? Math.round((commits / totalWeeks) * 100) / 100 : 0
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

  const handleBranchClick = (branch) => {
    setSelectedBranch(branch);
    setShowBranchModal(true);
  };

  const handleAnalyze = async () => {
    if (!repositoryUrl.trim()) {
      setError('Please enter a repository URL.');
      return;
    }

    const repoInfo = parseRepositoryUrl(repositoryUrl);
    if (!repoInfo) {
      setError('Please enter a valid GitHub repository URL. (e.g., https://github.com/owner/repo or owner/repo)');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);
    setCurrentPage(1); // 새 분석 시작 시 첫 페이지로 리셋

    try {
      // 로그인된 사용자인지 확인하여 적절한 API 엔드포인트 선택
      const isAuthenticated = user && user.login;
      const baseEndpoint = isAuthenticated ? '/api/repository' : '/api/repository/public';
      
      console.log(`🔍 [분석 시작] ${isAuthenticated ? '인증된 사용자' : '비인증 사용자'}로 ${repoInfo.owner}/${repoInfo.repo} 분석을 시작합니다`);

      // 1. 레포지토리 정보 가져오기
      const repoData = await apiGet(`${baseEndpoint}/info/${repoInfo.owner}/${repoInfo.repo}`);

      // 2. 커밋 통계 가져오기
      let commitsData = [];
      try {
        commitsData = await apiGet(`${baseEndpoint}/commits/${repoInfo.owner}/${repoInfo.repo}`);
      } catch (error) {
        if (error.message.includes('403')) {
          console.warn('커밋 통계 API 한도 초과');
        } else {
          throw error;
        }
      }

      // 3. 모든 브랜치의 커밋 가져오기
      let recentCommitsData = [];
      let branchStats = [];
      let totalCommitsAcrossBranches = 0;
      
      try {
        const allCommitsData = await apiGet(`${baseEndpoint}/all-commits/${repoInfo.owner}/${repoInfo.repo}`);
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
      } catch (error) {
        if (error.message.includes('403')) {
          console.warn('모든 브랜치 커밋 API 한도 초과, 기본 커밋으로 대체');
          // API 한도 초과 시 기본 커밋 가져오기
          try {
            recentCommitsData = await apiGet(`${baseEndpoint}/recent-commits/${repoInfo.owner}/${repoInfo.repo}`);
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
          } catch (recentError) {
            throw recentError;
          }
        } else {
          throw error;
        }
      }

      // 4. 레포지토리 분석 수행
      const analysisData = await apiPost(`${baseEndpoint}/analyze`, {
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        commits: recentCommitsData,
        contributors: commitsData
      });

      setAnalysis({
        ...analysisData,
        repository: repoData,
        branchStats: branchStats,
        totalCommitsAcrossBranches: totalCommitsAcrossBranches
      });

    } catch (err) {
      console.error('Repository analysis error:', err);
      
      // 더 구체적인 오류 메시지 제공
      let errorMessage = err.message;
      
      if (err.response?.status === 403) {
        const errorData = err.response?.data;
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = 'Access denied. This repository is private. Please log in to access private repositories.';
        }
      } else if (err.response?.status === 404) {
        const errorData = err.response?.data;
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = 'Repository not found. Please check the repository URL and try again.';
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in to access this repository.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // URL 파라미터가 있을 때 자동으로 분석 시작
  useEffect(() => {
    const repoParam = searchParams.get('repo');
    if (repoParam && repositoryUrl && !loading && !analysis) {
      // 자동으로 분석 시작
      setTimeout(() => {
        handleAnalyze();
      }, 500);
    }
  }, [searchParams, repositoryUrl, loading, analysis]);

  return (
    <Layout>
      <AnalysisContainer>
        <MainContent>
          <Title>Repository Analysis</Title>
          <Subtitle>Comprehensive analysis of GitHub repository code quality, branch structure, and contribution patterns</Subtitle>
          
          <InputCard>
            <InputGroup>
              <Input
                type="text"
                placeholder="Enter GitHub repository URL (e.g., https://github.com/facebook/react)"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <AnalyzeButton 
                onClick={handleAnalyze} 
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </AnalyzeButton>
            </InputGroup>
            {!user && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                💡 <strong>Tip:</strong> Log in to analyze your private repositories and get enhanced features!
              </div>
            )}
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
              <p>Analyzing repository...</p>
            </LoadingCard>
          )}

          {analysis && (
            <>
              {/* 코드 품질 차트 */}
              <ChartContainer>
                <ChartTitle>Code Quality Score</ChartTitle>
                <ChartSubtitle>Contributor-wise code quality assessment</ChartSubtitle>
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
                      label={{ value: 'Quality Score', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '14px', fill: '#666' } }}
                      domain={[0, 100]}
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                      tickCount={6}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} points`,
                        'Code Quality Score'
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
                    <span style={{ fontSize: '11px', color: '#666' }}>80-100 points</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#2196F3', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '11px', color: '#666' }}>60-79 points</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#FF9800', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '11px', color: '#666' }}>40-59 points</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#FF5722', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '11px', color: '#666' }}>20-39 points</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#9E9E9E', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '11px', color: '#666' }}>0-19 points</span>
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
                          {contributor.qualityScore} points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartContainer>

              <ResultsCard>
                <SectionTitle>Analysis Results: {analysis.repository.full_name}</SectionTitle>
              
              <SectionTitle>Branch Analysis</SectionTitle>
              <div style={{ 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                borderRadius: '16px', 
                padding: '2rem', 
                marginBottom: '2rem',
                border: '1px solid #dee2e6',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50', fontSize: '1.3rem', fontWeight: '600' }}>Advanced Code Quality Assessment Criteria</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', fontSize: '0.95rem' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
                    padding: '1.2rem',
                    borderRadius: '12px',
                    border: '1px solid #4CAF50'
                  }}>
                    <strong style={{ color: '#4CAF50', fontSize: '1.1rem' }}>1. Commit Quality (30 points)</strong>
                    <p style={{ margin: '0.8rem 0', color: '#2e7d32', lineHeight: '1.5' }}>
                      Optimal commit count (15-80) with consistent patterns. Evaluates commit size and frequency for maintainability.
                    </p>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%)',
                    padding: '1.2rem',
                    borderRadius: '12px',
                    border: '1px solid #2196F3'
                  }}>
                    <strong style={{ color: '#2196F3', fontSize: '1.1rem' }}>2. Code Maintainability (25 points)</strong>
                    <p style={{ margin: '0.8rem 0', color: '#1565c0', lineHeight: '1.5' }}>
                      Balanced addition/deletion ratio (15-35% deletions) indicates healthy refactoring and code improvement practices.
                    </p>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #fff3e0 0%, #fff8f0 100%)',
                    padding: '1.2rem',
                    borderRadius: '12px',
                    border: '1px solid #FF9800'
                  }}>
                    <strong style={{ color: '#FF9800', fontSize: '1.1rem' }}>3. Collaboration Pattern (25 points)</strong>
                    <p style={{ margin: '0.8rem 0', color: '#e65100', lineHeight: '1.5' }}>
                      Team-appropriate contribution rates. Larger teams favor lower individual contributions for better knowledge distribution.
                    </p>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #ffebee 0%, #fff0f0 100%)',
                    padding: '1.2rem',
                    borderRadius: '12px',
                    border: '1px solid #FF5722'
                  }}>
                    <strong style={{ color: '#FF5722', fontSize: '1.1rem' }}>4. Development Consistency (20 points)</strong>
                    <p style={{ margin: '0.8rem 0', color: '#c62828', lineHeight: '1.5' }}>
                      Consistent activity patterns (40-80% active weeks) with stable development rhythm over time.
                    </p>
                  </div>
                </div>
              </div>
              
              {analysis.branchStats && analysis.branchStats.length > 0 ? (
                <>
                  <div style={{
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '1px solid #90caf9',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1565c0', fontSize: '1.2rem', fontWeight: '600' }}>
                      Branch Analysis Results ({analysis.branchStats.length} branches)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2' }}>
                          {analysis.branchStats.length}
                        </div>
                        <div style={{ color: '#424242' }}>Total Branches</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#388e3c' }}>
                          {analysis.branchStats.filter(b => b.branchProtected).length}
                        </div>
                        <div style={{ color: '#424242' }}>Protected Branches</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f57c00' }}>
                          {Math.max(...analysis.branchStats.map(b => b.commitCount))}
                        </div>
                        <div style={{ color: '#424242' }}>Max Commits</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7b1fa2' }}>
                          {Math.round(analysis.branchStats.reduce((sum, b) => sum + b.commitCount, 0) / analysis.branchStats.length)}
                        </div>
                        <div style={{ color: '#424242' }}>Average Commits</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50', fontSize: '1.3rem', fontWeight: '600' }}>
                      Branch Quality Scores
                    </h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                      gap: '1.5rem' 
                    }}>
                      {analysis.branchStats.map((branch, index) => {
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
                        
                        const isMainBranch = branch.branch === 'main' || branch.branch === 'master';
                        const isDevelopBranch = branch.branch === 'develop' || branch.branch === 'dev';
                        
                        return (
                          <div key={index} 
                            onClick={() => handleBranchClick(branch)}
                            style={{
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                              borderRadius: '16px',
                              padding: '1.5rem',
                              border: `2px solid ${
                                branchQualityScore >= 80 ? '#4CAF50' :
                                branchQualityScore >= 60 ? '#2196F3' :
                                branchQualityScore >= 40 ? '#FF9800' :
                                branchQualityScore >= 20 ? '#FF5722' : '#9E9E9E'
                              }`,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              position: 'relative',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }}>
                            {(isMainBranch || isDevelopBranch) && (
                              <div style={{
                                position: 'absolute',
                                top: '0.5rem',
                                right: '0.5rem',
                                background: isMainBranch ? '#4CAF50' : '#2196F3',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                {isMainBranch ? 'MAIN' : 'DEVELOP'}
                              </div>
                            )}
                            
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                              <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: branchQualityScore >= 80 ? '#4CAF50' :
                                               branchQualityScore >= 60 ? '#2196F3' :
                                               branchQualityScore >= 40 ? '#FF9800' :
                                               branchQualityScore >= 20 ? '#FF5722' : '#9E9E9E',
                                marginRight: '0.75rem'
                              }}></div>
                              <h5 style={{ 
                                margin: 0, 
                                fontSize: '1.1rem', 
                                fontWeight: '600',
                                color: '#2c3e50'
                              }}>
                                {branch.branch}
                              </h5>
                            </div>
                            
                            <div style={{ marginBottom: '1rem' }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '0.5rem'
                              }}>
                                <span style={{ fontSize: '0.9rem', color: '#666' }}>Quality Score</span>
                                <span style={{ 
                                  fontSize: '1.2rem', 
                                  fontWeight: 'bold',
                                  color: branchQualityScore >= 80 ? '#4CAF50' :
                                         branchQualityScore >= 60 ? '#2196F3' :
                                         branchQualityScore >= 40 ? '#FF9800' :
                                         branchQualityScore >= 20 ? '#FF5722' : '#9E9E9E'
                                }}>
                                  {branchQualityScore}/100
                                </span>
                              </div>
                              <div style={{
                                width: '100%',
                                height: '8px',
                                backgroundColor: '#e0e0e0',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${branchQualityScore}%`,
                                  height: '100%',
                                  background: `linear-gradient(90deg, ${
                                    branchQualityScore >= 80 ? '#4CAF50' :
                                    branchQualityScore >= 60 ? '#2196F3' :
                                    branchQualityScore >= 40 ? '#FF9800' :
                                    branchQualityScore >= 20 ? '#FF5722' : '#9E9E9E'
                                  }, ${
                                    branchQualityScore >= 80 ? '#66BB6A' :
                                    branchQualityScore >= 60 ? '#42A5F5' :
                                    branchQualityScore >= 40 ? '#FFB74D' :
                                    branchQualityScore >= 20 ? '#EF5350' : '#BDBDBD'
                                  })`,
                                  transition: 'width 0.3s ease'
                                }}></div>
                              </div>
                            </div>
                            
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '0.75rem',
                              fontSize: '0.85rem'
                            }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                                  {branch.commitCount}
                                </div>
                                <div style={{ color: '#666' }}>Commits</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                                  {branch.branchProtected ? 'Protected' : 'Open'}
                                </div>
                                <div style={{ color: '#666' }}>
                                  {branch.branchProtected ? 'Protected' : 'Normal'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <MetricGrid>
                  <MetricCard color={analysis.analysis.codeQuality.score >= 80 ? '#28a745' : analysis.analysis.codeQuality.score >= 60 ? '#ffc107' : '#dc3545'}>
                    <MetricTitle>Overall Quality Score</MetricTitle>
                    <MetricValue>{analysis.analysis.codeQuality.score}/100</MetricValue>
                  </MetricCard>
                  <MetricCard>
                    <MetricTitle>Quality Level</MetricTitle>
                    <MetricValue>{analysis.analysis.codeQuality.level}</MetricValue>
                  </MetricCard>
                  <MetricCard>
                    <MetricTitle>Total Commits</MetricTitle>
                    <MetricValue>{analysis.analysis.codeQuality.metrics.totalCommits}</MetricValue>
                  </MetricCard>
                  <MetricCard>
                    <MetricTitle>Contributors</MetricTitle>
                    <MetricValue>{analysis.analysis.codeQuality.metrics.contributorsCount}</MetricValue>
                  </MetricCard>
                </MetricGrid>
              )}

              <SectionTitle>Contributor Rankings</SectionTitle>
              <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                Overall contributor rankings based on contributions across all branches.
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
                              <strong>{contributor.commits}</strong> commits
                            </div>
                            <div style={{ marginBottom: '0.25rem' }}>
                              Total contribution: <strong>{contributor.percentage}%</strong>
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
                               Previous
                             </button>
                             
                             <span style={{ fontSize: '0.9rem', color: '#666' }}>
                               {currentPage} / {Math.ceil(analysis.analysis.contributionPattern.metrics.distribution.length / itemsPerPage)} pages
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
                               Next
                             </button>
                           </div>
                         )}
                       </>
                     )}

                     <SectionTitle>Branch Analysis</SectionTitle>
                     {analysis.branchStats && analysis.branchStats.length > 0 && (
                       <>
                         <div style={{
                           background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                           borderRadius: '12px',
                           padding: '1rem',
                           marginBottom: '1.5rem',
                           border: '1px solid #90caf9'
                         }}>
                           <h4 style={{ margin: '0 0 0.5rem 0', color: '#1565c0' }}>Branch Commit Statistics</h4>
                           <p style={{ margin: '0', fontSize: '0.9rem', color: '#1976d2' }}>
                             Analyzed <strong>{analysis.totalCommitsAcrossBranches || 0} commits</strong> across
                             <strong> {analysis.branchStats.length} branches</strong>.
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
                                 <strong>Analysis Limit:</strong> Due to high commit count, only recent <strong>{analysis.analysisLimit.maxCommits} commits</strong> were analyzed.
                                 <br />
                                 Total commits: <strong>{analysis.analysisLimit.originalCount}</strong>
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
                        <MetricValue>{branch.commitCount} commits</MetricValue>
                        {branch.branchProtected && (
                          <div style={{ fontSize: '0.8rem', color: '#28a745', marginTop: '0.5rem' }}>
                            Protected
                          </div>
                        )}
                      </MetricCard>
                    ))}
                  </MetricGrid>
                </>
              )}

              <SectionTitle>Activity Level</SectionTitle>
              <p>{analysis.analysis.activityLevel.description}</p>
              <MetricGrid>
                <MetricCard>
                  <MetricTitle>Activity Level</MetricTitle>
                  <MetricValue>{analysis.analysis.activityLevel.level}</MetricValue>
                </MetricCard>
                <MetricCard>
                  <MetricTitle>Recent Commits</MetricTitle>
                  <MetricValue>{analysis.analysis.activityLevel.metrics.recentCommits}</MetricValue>
                </MetricCard>
                <MetricCard>
                  <MetricTitle>Last Commit</MetricTitle>
                  <MetricValue>{analysis.analysis.activityLevel.metrics.lastCommitDate ? new Date(analysis.analysis.activityLevel.metrics.lastCommitDate).toLocaleDateString() : 'N/A'}</MetricValue>
                </MetricCard>
              </MetricGrid>

              <SectionTitle>Recommendations</SectionTitle>
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

      {/* Branch Activity Modal */}
      {showBranchModal && selectedBranch && (
        <ModalOverlay onClick={() => setShowBranchModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Branch Activity: {selectedBranch.branch}</ModalTitle>
              <CloseButton onClick={() => setShowBranchModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <BranchActivityGrid>
              <ActivityCard level={selectedBranch.commitCount > 50 ? 'Very Active' : selectedBranch.commitCount > 20 ? 'Active' : selectedBranch.commitCount > 10 ? 'Moderate' : 'Low'}>
                <ActivityTitle level={selectedBranch.commitCount > 50 ? 'Very Active' : selectedBranch.commitCount > 20 ? 'Active' : selectedBranch.commitCount > 10 ? 'Moderate' : 'Low'}>
                  Commit Count
                </ActivityTitle>
                <ActivityValue level={selectedBranch.commitCount > 50 ? 'Very Active' : selectedBranch.commitCount > 20 ? 'Active' : selectedBranch.commitCount > 10 ? 'Moderate' : 'Low'}>
                  {selectedBranch.commitCount}
                </ActivityValue>
                <ActivityDescription>
                  Total commits in this branch
                </ActivityDescription>
              </ActivityCard>

              <ActivityCard level={selectedBranch.branchProtected ? 'Very Active' : 'Moderate'}>
                <ActivityTitle level={selectedBranch.branchProtected ? 'Very Active' : 'Moderate'}>
                  Protection Status
                </ActivityTitle>
                <ActivityValue level={selectedBranch.branchProtected ? 'Very Active' : 'Moderate'}>
                  {selectedBranch.branchProtected ? 'Protected' : 'Open'}
                </ActivityValue>
                <ActivityDescription>
                  {selectedBranch.branchProtected ? 'Branch is protected with rules' : 'Branch has no protection rules'}
                </ActivityDescription>
              </ActivityCard>

              <ActivityCard level={selectedBranch.branch === 'main' || selectedBranch.branch === 'master' ? 'Very Active' : selectedBranch.branch === 'develop' || selectedBranch.branch === 'dev' ? 'Active' : 'Moderate'}>
                <ActivityTitle level={selectedBranch.branch === 'main' || selectedBranch.branch === 'master' ? 'Very Active' : selectedBranch.branch === 'develop' || selectedBranch.branch === 'dev' ? 'Active' : 'Moderate'}>
                  Branch Type
                </ActivityTitle>
                <ActivityValue level={selectedBranch.branch === 'main' || selectedBranch.branch === 'master' ? 'Very Active' : selectedBranch.branch === 'develop' || selectedBranch.branch === 'dev' ? 'Active' : 'Moderate'}>
                  {selectedBranch.branch === 'main' || selectedBranch.branch === 'master' ? 'Main' : 
                   selectedBranch.branch === 'develop' || selectedBranch.branch === 'dev' ? 'Develop' : 'Feature'}
                </ActivityValue>
                <ActivityDescription>
                  {selectedBranch.branch === 'main' || selectedBranch.branch === 'master' ? 'Primary production branch' : 
                   selectedBranch.branch === 'develop' || selectedBranch.branch === 'dev' ? 'Development integration branch' : 'Feature or topic branch'}
                </ActivityDescription>
              </ActivityCard>

              <ActivityCard level={selectedBranch.commitCount > 100 ? 'Very Active' : selectedBranch.commitCount > 50 ? 'Active' : selectedBranch.commitCount > 20 ? 'Moderate' : 'Low'}>
                <ActivityTitle level={selectedBranch.commitCount > 100 ? 'Very Active' : selectedBranch.commitCount > 50 ? 'Active' : selectedBranch.commitCount > 20 ? 'Moderate' : 'Low'}>
                  Activity Level
                </ActivityTitle>
                <ActivityValue level={selectedBranch.commitCount > 100 ? 'Very Active' : selectedBranch.commitCount > 50 ? 'Active' : selectedBranch.commitCount > 20 ? 'Moderate' : 'Low'}>
                  {selectedBranch.commitCount > 100 ? 'Very Active' : 
                   selectedBranch.commitCount > 50 ? 'Active' : 
                   selectedBranch.commitCount > 20 ? 'Moderate' : 'Low'}
                </ActivityValue>
                <ActivityDescription>
                  {selectedBranch.commitCount > 100 ? 'Highly active development' : 
                   selectedBranch.commitCount > 50 ? 'Active development' : 
                   selectedBranch.commitCount > 20 ? 'Moderate activity' : 'Low activity'}
                </ActivityDescription>
              </ActivityCard>
            </BranchActivityGrid>

            <div style={{ 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              borderRadius: '12px', 
              padding: '1.5rem',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.1rem', fontWeight: '600' }}>
                Branch Summary
              </h4>
              <p style={{ margin: '0', color: '#666', lineHeight: '1.5', fontSize: '0.95rem' }}>
                The <strong>{selectedBranch.branch}</strong> branch has {selectedBranch.commitCount} commits and is 
                {selectedBranch.branchProtected ? ' protected with branch rules' : ' open for direct pushes'}. 
                {selectedBranch.branch === 'main' || selectedBranch.branch === 'master' ? 
                  ' This is the main production branch.' : 
                  selectedBranch.branch === 'develop' || selectedBranch.branch === 'dev' ?
                  ' This is the development integration branch.' :
                  ' This appears to be a feature or topic branch.'}
              </p>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Layout>
  );
};

export default RepositoryAnalysis;
