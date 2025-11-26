import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';
import PullRequestsAnalysis from '../components/PullRequestsAnalysis';
import IssuesAnalysis from '../components/IssuesAnalysis';
import WorkflowsAnalysis from '../components/WorkflowsAnalysis';
import ReleasesAnalysis from '../components/ReleasesAnalysis';
import { apiGet, apiPost } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

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
    border-color: #ff6b35;
  }

  &::placeholder {
    color: #6a737d;
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
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 107, 53, 0.35);
    filter: brightness(1.05);
  }

  &:disabled {
    background: #f97316;
    box-shadow: none;
    cursor: not-allowed;
    opacity: 0.65;
    transform: none;
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
  border-top: 4px solid #ff6b35;
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: ${props => (props.onClick ? 'pointer' : 'default')};

  &:hover {
    transform: ${props => (props.onClick ? 'translateY(-3px)' : 'none')};
    box-shadow: ${props => (props.onClick ? '0 10px 18px rgba(0, 0, 0, 0.1)' : 'none')};
  }
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

const ChatSection = styled.div`
  margin-top: 2.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 12px 30px rgba(255, 107, 53, 0.18);
  border: 1px solid rgba(255, 140, 66, 0.2);
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const ChatTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #7c2d12;
`;

const ChatDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #88492b;
  opacity: 0.85;
`;

const ChatMessages = styled.div`
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ChatMessage = styled.div`
  background: linear-gradient(135deg, rgba(255, 227, 215, 0.9) 0%, rgba(255, 211, 188, 0.9) 100%);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: grid;
  gap: 0.35rem;
  border: 1px solid rgba(255, 140, 66, 0.25);
`;

const ChatMessageHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ChatAuthor = styled.span`
  font-weight: 700;
  color: #7c2d12;
`;

const ChatTimestamp = styled.span`
  font-size: 0.8rem;
  color: #a16207;
`;

const ChatText = styled.p`
  margin: 0;
  color: #4a2704;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const ChatForm = styled.form`
  display: grid;
  gap: 0.75rem;
`;

const ChatInput = styled.textarea`
  min-height: 90px;
  border: 2px solid rgba(255, 140, 66, 0.35);
  border-radius: 10px;
  padding: 0.9rem 1rem;
  resize: vertical;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1f2937;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ff6b35;
    box-shadow: 0 0 0 4px rgba(255, 140, 66, 0.15);
  }
  
  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ChatSubmitButton = styled.button`
  justify-self: flex-end;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.6rem;
  
  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    opacity: 0.6;
  }
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(255, 107, 53, 0.4);
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(0);
  }
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
  const { user, login } = useAuth();
  const { t } = useTranslation();
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [contributorList, setContributorList] = useState([]);
  const [checkingContributor, setCheckingContributor] = useState(false);
  
  // URL 파라미터에서 레포지토리 정보 가져오기
  useEffect(() => {
    const repoParam = searchParams.get('repo');
    if (repoParam) {
      setRepositoryUrl(`https://github.com/${repoParam}`);
    }
  }, [searchParams]);

  // GitHub URL 파싱 함수
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

  // 로그인 상태 및 분석 데이터 변수들
  const isLoggedIn = !!user;
  const analysisData = analysis;
  const repoInfo = repositoryUrl ? parseRepositoryUrl(repositoryUrl) : null;
  const currentRepoKey = repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : null;
  const filteredChatMessages = currentRepoKey
    ? chatMessages.filter((message) => message.repo === currentRepoKey)
    : [];
  
  const contributorListFetchedRef = useRef(null);

  // 레포지토리 기여자 목록 가져오기 (분석 데이터 또는 API에서)
  useEffect(() => {
    const fetchContributorList = async () => {
      if (!repoInfo || !isLoggedIn) {
        setContributorList([]);
        contributorListFetchedRef.current = null;
        return;
      }

      const repoKey = `${repoInfo.owner}/${repoInfo.repo}`;
      
      // 이미 같은 저장소의 기여자 목록을 가져왔으면 다시 가져오지 않음
      if (contributorListFetchedRef.current === repoKey) {
        return;
      }
      
      setCheckingContributor(true);
      
      try {
        // 1. 먼저 분석 데이터에서 기여자 목록 추출 시도
        if (analysisData && analysisData.contributionPattern) {
          const distribution = analysisData.contributionPattern?.distribution || 
                               analysisData.contributionPattern?.metrics?.distribution || [];
          
          const contributors = distribution
            .map(contributor => {
              // author, authorName, login 모두 확인
              return contributor.author || contributor.authorName || contributor.login;
            })
            .filter(Boolean);
          
          if (contributors.length > 0) {
            setContributorList(contributors);
            contributorListFetchedRef.current = repoKey;
            console.log('✅ [기여자 확인] 분석 데이터에서 기여자 목록 가져옴:', contributors);
            setCheckingContributor(false);
            return;
          }
        }
        
        // 2. 분석 데이터에 기여자 정보가 없으면 커밋 통계 API에서 가져오기 (실제 커밋 데이터 기반)
        // 하지만 분석이 진행 중이면 분석 완료를 기다림 (분석 데이터에서 가져오는 것이 더 정확함)
        if (!analysisData && loading) {
          console.log('⏳ [기여자 확인] 분석 진행 중이므로 기여자 목록 가져오기 대기');
          setCheckingContributor(false);
          return;
        }
        
        try {
          const baseEndpoint = isLoggedIn ? '/api/repository' : '/api/repository';
          const contributorsData = await apiGet(`${baseEndpoint}/commits/${repoInfo.owner}/${repoInfo.repo}`);
          
          // contributorsData가 배열이고 각 항목에 author 또는 authorName이 있는 경우
          const contributors = contributorsData
            .map(contributor => {
              // author, authorName, login 순으로 확인
              return contributor.author || contributor.authorName || contributor.login;
            })
            .filter(Boolean);
          
          setContributorList(contributors);
          contributorListFetchedRef.current = repoKey;
          console.log('✅ [기여자 확인] 커밋 통계 API에서 기여자 목록 가져옴:', contributors);
        } catch (apiError) {
          console.warn('⚠️ [기여자 확인] 커밋 통계 API에서 기여자 목록 가져오기 실패, 대체 방법 시도:', apiError);
          
          // 3. 대체 방법: GitHub API에서 직접 가져오기
          try {
            const baseEndpoint = isLoggedIn ? '/api/github' : '/api/repository';
            const contributorsData = await apiGet(`${baseEndpoint}/repos/${repoInfo.owner}/${repoInfo.repo}/contributors`);
            
            const contributors = contributorsData
              .map(contributor => contributor.login || contributor.author?.login || contributor.authorName)
              .filter(Boolean);
            
            setContributorList(contributors);
            contributorListFetchedRef.current = repoKey;
            console.log('✅ [기여자 확인] GitHub API에서 기여자 목록 가져옴:', contributors);
          } catch (fallbackError) {
            console.warn('⚠️ [기여자 확인] GitHub API에서도 기여자 목록 가져오기 실패:', fallbackError);
            setContributorList([]);
          }
        }
      } catch (error) {
        console.error('❌ [기여자 확인] 오류:', error);
        setContributorList([]);
      } finally {
        setCheckingContributor(false);
      }
    };
    
    fetchContributorList();
  }, [repoInfo, analysisData, isLoggedIn, loading]);

  // repoInfo가 변경되면 fetched 상태 리셋
  useEffect(() => {
    if (repoInfo) {
      const repoKey = `${repoInfo.owner}/${repoInfo.repo}`;
      if (contributorListFetchedRef.current !== repoKey) {
        contributorListFetchedRef.current = null;
      }
    }
  }, [repoInfo]);
  
  // 현재 사용자가 레포지토리 기여자인지 확인
  const isCurrentUserContributor = () => {
    if (!user?.login || !repoInfo) return false;
    
    const userLogin = (user.login || '').toLowerCase().trim();
    
    // 대소문자 구분 없이 확인, 여러 필드 확인
    return contributorList.some(contributor => {
      if (!contributor) return false;
      
      const contributorLower = String(contributor).toLowerCase().trim();
      
      // 정확히 일치하거나, @ 없이도 일치하는지 확인
      return contributorLower === userLogin || 
             contributorLower.replace('@', '') === userLogin.replace('@', '');
    });
  };
  
  const canUseChat = isCurrentUserContributor();
  
  // 디버깅용 로그
  console.log('🔍 [RepositoryAnalysis] 로그인 상태 확인:', {
    user: user,
    isLoggedIn: isLoggedIn,
    analysisData: analysisData,
    repoInfo: repoInfo
  });
  
  // 분석 데이터 구조 확인
  console.log('📋 [RepositoryAnalysis] 분석 데이터 구조:', {
    analysis: analysis,
    contributionPattern: analysis?.contributionPattern,
    distribution: analysis?.contributionPattern?.distribution, // 올바른 경로
    metricsDistribution: analysis?.contributionPattern?.metrics?.distribution // 기존 경로도 확인
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('gitlog_repo_chat_messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setChatMessages(parsed);
        }
      }
    } catch (error) {
      console.warn('⚠️ [RepositoryAnalysis] 채팅 기록 로드 실패:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('gitlog_repo_chat_messages', JSON.stringify(chatMessages));
    } catch (error) {
      console.warn('⚠️ [RepositoryAnalysis] 채팅 기록 저장 실패:', error);
    }
  }, [chatMessages]);

  const handleChatSubmit = (event) => {
    event.preventDefault();
    if (!chatInput.trim() || !currentRepoKey) {
      return;
    }
    
    // 기여자만 메시지 전송 가능
    if (!canUseChat) {
      console.warn('⚠️ [채팅] 기여자가 아니므로 메시지를 보낼 수 없습니다.');
      return;
    }

    const newMessage = {
      id: Date.now(),
      repo: currentRepoKey,
      author: user?.login || 'Guest',
      text: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [newMessage, ...prev].slice(0, 200));
    setChatInput('');
  };

  // 차트 데이터 생성 함수 - 개선된 코드 품질 기반 평가
  const generateChartData = (contributors) => {
    console.log('🔍 [generateChartData] 입력 데이터:', contributors);
    
    if (!contributors || contributors.length === 0) {
      console.log('⚠️ [generateChartData] 기여자 데이터가 없습니다.');
      return [];
    }
    
    // 모든 기여자를 표시하되, 최대 20명으로 제한 (성능 고려)
    const chartData = contributors.slice(0, 20).map((contributor, index) => {
      if (!contributor) return null; // 안전성 검사
      
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
      
      // 사용자 이름과 아바타 안전하게 처리
      const userName = contributor.author || contributor.authorName || contributor.login || `User ${index + 1}`;
      const userAvatar = contributor.avatar || contributor.avatar_url || null;
      
      return {
        name: userName,
        avatar: userAvatar,
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
    }).filter(item => item !== null).sort((a, b) => b.qualityScore - a.qualityScore); // 품질 점수 순으로 정렬
    
    console.log('📊 [generateChartData] 생성된 차트 데이터:', chartData);
    return chartData;
  };

  const handleBranchClick = (branch) => {
    setSelectedBranch(branch);
    setShowBranchModal(true);
  };

  const handleAnalyze = async () => {
    if (!repositoryUrl.trim()) {
      setError(t('analysis.enterRepositoryUrl'));
      return;
    }

    const repoInfo = parseRepositoryUrl(repositoryUrl);
    if (!repoInfo) {
      setError(`${t('analysis.invalidUrl')}: ${t('analysis.invalidUrlMessage')}`);
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);
    setCurrentPage(1); // 새 분석 시작 시 첫 페이지로 리셋

    // 로딩 타임아웃 설정 (최대 60초)
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ [프론트엔드] 로딩 타임아웃 발생, 강제로 로딩 해제');
        setLoading(false);
      }
    }, 60000);

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

      // 4. 기여자 데이터 가져오기 (이미 커밋 통계에서 가져왔으면 재사용)
      let contributorsData = [];
      try {
        // 커밋 통계에서 이미 기여자 데이터를 가져왔으면 재사용
        if (commitsData && Array.isArray(commitsData) && commitsData.length > 0) {
          contributorsData = commitsData;
          console.log('✅ [프론트엔드] 커밋 통계에서 기여자 데이터 재사용:', contributorsData.length);
        } else {
          console.log('🔍 [프론트엔드] 기여자 데이터를 가져옵니다...');
          console.log('🔍 [프론트엔드] API 엔드포인트:', `${baseEndpoint}/commits/${repoInfo.owner}/${repoInfo.repo}`);
          
          // 먼저 인증된 API 시도
          try {
            contributorsData = await apiGet(`${baseEndpoint}/commits/${repoInfo.owner}/${repoInfo.repo}`);
            console.log('✅ [프론트엔드] 인증된 API로 기여자 데이터 가져오기 완료:', contributorsData);
          } catch (authError) {
            console.warn('⚠️ [프론트엔드] 인증된 API 실패, 공개 API 시도:', authError.message);
            // 공개 API로 시도
            contributorsData = await apiGet(`${baseEndpoint}/public/commits/${repoInfo.owner}/${repoInfo.repo}`);
            console.log('✅ [프론트엔드] 공개 API로 기여자 데이터 가져오기 완료:', contributorsData);
          }
        }
        
        console.log('✅ [프론트엔드] 기여자 데이터 타입:', typeof contributorsData);
        console.log('✅ [프론트엔드] 기여자 데이터 길이:', contributorsData ? contributorsData.length : 'undefined');
      } catch (contributorError) {
        console.error('❌ [프론트엔드] 모든 기여자 데이터 API 실패:', contributorError);
        console.error('❌ [프론트엔드] 에러 상세:', contributorError.message);
        
        // 커밋 데이터에서 기여자 정보 추출하여 대체 데이터 생성
        console.log('🔄 [프론트엔드] 커밋 데이터에서 기여자 정보 추출 시도...');
        const contributorMap = new Map();
        
        if (recentCommitsData && recentCommitsData.length > 0) {
          recentCommitsData.forEach((commit, index) => {
            const author = commit.commit?.author || commit.author;
            if (author) {
              const authorName = author.name || author.login || `User ${index + 1}`;
              if (contributorMap.has(authorName)) {
                contributorMap.get(authorName).commits++;
              } else {
                contributorMap.set(authorName, {
                  author: authorName,
                  authorName: authorName,
                  avatar: author.avatar_url || null,
                  commits: 1,
                  total: 1,
                  additions: 0,
                  deletions: 0,
                  weeks: [],
                  percentage: 0
                });
              }
            }
          });
          
          contributorsData = Array.from(contributorMap.values());
          console.log('✅ [프론트엔드] 커밋 데이터에서 추출한 기여자 데이터:', contributorsData);
        }
        
        if (contributorsData.length === 0) {
          contributorsData = [];
        }
      }

      // 5. 레포지토리 분석 수행
      console.log('🔍 [프론트엔드] 분석 API 호출 데이터:', {
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        commitsCount: recentCommitsData ? recentCommitsData.length : 0,
        contributorsCount: contributorsData ? contributorsData.length : 0,
        contributorsData: contributorsData
      });
      
      const analysisResponse = await apiPost(`${baseEndpoint}/analyze`, {
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        commits: recentCommitsData,
        contributors: contributorsData
      });

      // 백엔드 응답 구조에 맞게 분석 데이터 추출
      const analysisData = analysisResponse.analysis || analysisResponse;
      
      console.log('✅ [프론트엔드] 분석 응답 받음:', analysisResponse);
      console.log('✅ [프론트엔드] 분석 데이터:', analysisData);
      console.log('✅ [프론트엔드] 기여 패턴:', analysisData?.contributionPattern);
      console.log('✅ [프론트엔드] 기여 패턴 distribution:', analysisData?.contributionPattern?.distribution);

      setAnalysis({
        ...analysisData,
        repository: repoData,
        branchStats: branchStats,
        totalCommitsAcrossBranches: totalCommitsAcrossBranches
      });

      console.log('✅ [프론트엔드] 분석 데이터 설정 완료, 로딩 해제 예정');

    } catch (err) {
      console.error('Repository analysis error:', err);
      
      // 더 구체적인 오류 메시지 제공
      let errorMessage = err.message;
      
      // 403 에러 또는 API rate limit 관련 에러 처리
      if (err.response?.status === 403 || err.message.includes('403') || err.message.includes('API rate limit')) {
        const errorData = err.response?.data;
        if ((errorData?.message && errorData.message.includes('API rate limit exceeded')) || 
            err.message.includes('API rate limit exceeded')) {
          // API rate limit 에러는 실제로는 private repository 접근 거부
          if (!user || !user.login) {
            errorMessage = t('analysis.privateRepositoryAccessDenied');
          } else {
            errorMessage = `${t('analysis.accessDenied')}. ${t('analysis.accessDeniedMessage')}`;
          }
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else {
          if (!user || !user.login) {
            errorMessage = t('analysis.privateRepositoryAccessDenied');
          } else {
            errorMessage = `${t('analysis.accessDenied')}. ${t('analysis.accessDeniedMessage')}`;
          }
        }
      } else if (err.response?.status === 404) {
        errorMessage = `${t('analysis.repositoryNotFound')}: ${t('analysis.repositoryNotFoundMessage')}`;
      } else if (err.response?.status === 401) {
        errorMessage = `${t('analysis.authenticationRequired')}: ${t('analysis.authenticationRequiredMessage')}`;
      } else {
        // 더 구체적인 오류 정보 제공
        const statusCode = err.response?.status;
        
        if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
          errorMessage = `${t('analysis.networkError')}: ${t('analysis.networkErrorMessage')}`;
        } else if (err.code === 'TIMEOUT' || err.message?.includes('timeout')) {
          errorMessage = `${t('analysis.timeoutError')}: ${t('analysis.timeoutErrorMessage')}`;
        } else if (statusCode >= 500) {
          errorMessage = `${t('analysis.serverError')}: ${t('analysis.serverErrorMessage')}`;
        } else if (err.message?.includes('Invalid URL') || err.message?.includes('URL')) {
          errorMessage = `${t('analysis.invalidUrl')}: ${t('analysis.invalidUrlMessage')}`;
        } else {
          const errorDetails = err.response?.data?.message || err.message || 'Unknown error';
          errorMessage = `${t('analysis.analysisError')} (${statusCode || 'Unknown'}): ${errorDetails}. ${t('analysis.tryAgain')}`;
        }
      }
      
      // 에러 발생 시 분석 데이터 초기화
      setAnalysis(null);
      setError(errorMessage);
    } finally {
      console.log('🔄 [프론트엔드] 로딩 상태 해제');
      clearTimeout(loadingTimeout);
      setLoading(false);
    }
  };

  // URL 파라미터가 있을 때 자동으로 분석 시작
  useEffect(() => {
    const repoParam = searchParams.get('repo');
    // 에러가 없고, 로딩 중이 아니고, 분석 데이터가 없을 때만 자동 분석 시작
    if (repoParam && repositoryUrl && !loading && !analysis && !error) {
      // 자동으로 분석 시작
      setTimeout(() => {
        handleAnalyze();
      }, 500);
    }
  }, [searchParams, repositoryUrl, loading, analysis, error]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout>
      <AnalysisContainer>
        <MainContent>
          <Title>{t('analysis.title')}</Title>
          <Subtitle>{t('analysis.selectRepository')}</Subtitle>
          
          <InputCard>
            <InputGroup>
              <Input
                type="text"
                placeholder={t('analysis.enterRepositoryUrl')}
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <AnalyzeButton 
                onClick={handleAnalyze} 
                disabled={loading}
              >
                {loading ? t('analysis.analyzing') : t('analysis.analyze')}
              </AnalyzeButton>
            </InputGroup>
            {!user && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '12px',
                fontSize: '0.95rem',
                color: '#333',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                {t('login.tip')}
              </div>
            )}
          </InputCard>

          {error && (
            <ErrorMessage style={{ 
              whiteSpace: 'pre-line', 
              textAlign: 'center', 
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
              <ResultsCard>
                <SectionTitle>{t('analysis.analysisResults')}: {analysis.repository.full_name}</SectionTitle>
              
                <SectionTitle>{t('analysis.branchAnalysis')}</SectionTitle>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                  borderRadius: '16px', 
                  padding: '2rem', 
                  marginBottom: '2rem',
                  border: '1px solid #dee2e6',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', fontSize: '0.95rem' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
                    padding: '1.2rem',
                    borderRadius: '12px',
                    border: '1px solid #4CAF50'
                  }}>
                    <strong style={{ color: '#4CAF50', fontSize: '1.1rem' }}>1. {t('analysis.commitQuality')} ({t('analysis.commitQualityPoints')})</strong>
                    <p style={{ margin: '0.8rem 0', color: '#2e7d32', lineHeight: '1.5' }}>
                      {t('analysis.commitQualityDescription')}
                    </p>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%)',
                    padding: '1.2rem',
                    borderRadius: '12px',
                    border: '1px solid #2196F3'
                  }}>
                    <strong style={{ color: '#2196F3', fontSize: '1.1rem' }}>2. {t('analysis.codeMaintainability')} ({t('analysis.codeMaintainabilityPoints')})</strong>
                    <p style={{ margin: '0.8rem 0', color: '#1565c0', lineHeight: '1.5' }}>
                      {t('analysis.codeMaintainabilityDescription')}
                    </p>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #fff3e0 0%, #fff8f0 100%)',
                    padding: '1.2rem',
                    borderRadius: '12px',
                    border: '1px solid #FF9800'
                  }}>
                    <strong style={{ color: '#FF9800', fontSize: '1.1rem' }}>3. {t('analysis.collaborationPattern')} ({t('analysis.collaborationPatternPoints')})</strong>
                    <p style={{ margin: '0.8rem 0', color: '#e65100', lineHeight: '1.5' }}>
                      {t('analysis.collaborationPatternDescription')}
                    </p>
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #ffebee 0%, #fff0f0 100%)',
                    padding: '1.2rem',
                    borderRadius: '12px',
                    border: '1px solid #FF5722'
                  }}>
                    <strong style={{ color: '#FF5722', fontSize: '1.1rem' }}>4. {t('analysis.developmentConsistency')} ({t('analysis.developmentConsistencyPoints')})</strong>
                    <p style={{ margin: '0.8rem 0', color: '#c62828', lineHeight: '1.5' }}>
                      {t('analysis.developmentConsistencyDescription')}
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
                      {t('analysis.branchAnalysisResults')} ({analysis.branchStats.length} {t('analysis.branches')})
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2' }}>
                          {analysis.branchStats.length}
                        </div>
                        <div style={{ color: '#424242' }}>{t('analysis.totalBranches')}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#388e3c' }}>
                          {analysis.branchStats.filter(b => b.branchProtected).length}
                        </div>
                        <div style={{ color: '#424242' }}>{t('analysis.protectedBranches')}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f57c00' }}>
                          {Math.max(...analysis.branchStats.map(b => b.commitCount))}
                        </div>
                        <div style={{ color: '#424242' }}>{t('analysis.maxCommits')}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7b1fa2' }}>
                          {Math.round(analysis.branchStats.reduce((sum, b) => sum + b.commitCount, 0) / analysis.branchStats.length)}
                        </div>
                        <div style={{ color: '#424242' }}>{t('analysis.averageCommits')}</div>
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
                        if (!branch) return null;

                        const score = Math.min(100, Math.max(0, Math.round((branch.commitCount / Math.max(1, analysis.totalCommits || 100)) * 100)));
                        const color =
                          score >= 80 ? '#4CAF50' :
                          score >= 60 ? '#2196F3' :
                          score >= 40 ? '#FF9800' :
                          '#FF5722';

                        const handleCardKeyDown = (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleBranchClick(branch);
                          }
                        };

                        return (
                          <MetricCard
                            key={index}
                            color={color}
                            onClick={() => handleBranchClick(branch)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={handleCardKeyDown}
                          >
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '1rem'
                            }}>
                              <div>
                                <MetricTitle style={{ marginBottom: '0.25rem' }}>{branch.branch}</MetricTitle>
                                <MetricValue>{score}/100</MetricValue>
                              </div>
                              <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold'
                              }}>
                                #{index + 1}
                              </div>
                            </div>
                            <div style={{ color: '#555', lineHeight: 1.5, fontSize: '0.9rem' }}>
                              <div>
                                <strong>{t('analysis.commitCount')}</strong>: {branch.commitCount}
                              </div>
                              <div>
                                <strong>{t('analysis.activityLevel')}</strong>: {branch.commitCount > 50 ? t('analysis.veryActive') : branch.commitCount > 20 ? t('analysis.active') : branch.commitCount > 10 ? t('analysis.moderate') : t('analysis.low')}
                              </div>
                              <div>
                                <strong>{t('analysis.isProtected')}</strong>: {branch.branchProtected ? t('analysis.protected') : t('analysis.open')}
                              </div>
                              {branch.branchProtected && (
                                <div style={{ fontSize: '0.8rem', color: '#28a745', marginTop: '0.5rem' }}>
                                  Protected
                                </div>
                              )}
                            </div>
                          </MetricCard>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}

              <SectionTitle>{t('analysis.contributorRankings')}</SectionTitle>
              <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                {/* Overall contributor rankings based on contributions across all branches. */}
              </p>
              {analysis.contributionPattern?.metrics?.distribution && analysis.contributionPattern.metrics.distribution.length > 0 && (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    {analysis.contributionPattern.metrics.distribution
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
                     {analysis.contributionPattern?.metrics?.distribution?.length > itemsPerPage && (
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
                           {currentPage} / {Math.ceil((analysis.contributionPattern?.metrics?.distribution?.length || 0) / itemsPerPage)} pages
                         </span>
                         
                         <button
                           onClick={() => setCurrentPage(Math.min(Math.ceil((analysis.contributionPattern?.metrics?.distribution?.length || 0) / itemsPerPage), currentPage + 1))}
                           disabled={currentPage === Math.ceil((analysis.contributionPattern?.metrics?.distribution?.length || 0) / itemsPerPage)}
                           style={{
                             padding: '0.5rem 1rem',
                             border: '1px solid #ddd',
                             borderRadius: '6px',
                             backgroundColor: currentPage === Math.ceil((analysis.contributionPattern?.metrics?.distribution?.length || 0) / itemsPerPage) ? '#f5f5f5' : 'white',
                             cursor: currentPage === Math.ceil((analysis.contributionPattern?.metrics?.distribution?.length || 0) / itemsPerPage) ? 'not-allowed' : 'pointer',
                             color: currentPage === Math.ceil((analysis.contributionPattern?.metrics?.distribution?.length || 0) / itemsPerPage) ? '#999' : '#333'
                           }}
                         >
                           Next
                         </button>
                       </div>
                     )}
                   </>
                 )}

                 <SectionTitle>{t('analysis.branchAnalysis')}</SectionTitle>
                 {analysis.branchStats && analysis.branchStats.length > 0 && (
                   <>
                     <div style={{
                       background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                       borderRadius: '12px',
                       padding: '1rem',
                       marginBottom: '1.5rem',
                       border: '1px solid #90caf9'
                     }}>
                       <h4 style={{ margin: '0 0 0.5rem 0', color: '#1565c0' }}>{t('analysis.branchCommitStatistics')}</h4>
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
                {analysis.branchStats.slice(0, 8).map((branch, index) => {
                  const branchDisplayName = branch.name || branch.branch || `branch-${index}`;
                  const metricColor =
                    branch.commitCount > 50 ? '#4CAF50' :
                    branch.commitCount > 20 ? '#2196F3' :
                    branch.commitCount > 10 ? '#FF9800' :
                    branch.commitCount > 5 ? '#FF5722' : '#9E9E9E';

                  const handleCardKeyDown = (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleBranchClick(branch);
                    }
                  };

                  return (
                    <MetricCard
                      key={index}
                      color={metricColor}
                      onClick={() => handleBranchClick(branch)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={handleCardKeyDown}
                    >
                      <MetricTitle>{branchDisplayName}</MetricTitle>
                      <MetricValue>{branch.commitCount} commits</MetricValue>
                      {branch.branchProtected && (
                        <div style={{ fontSize: '0.8rem', color: '#28a745', marginTop: '0.5rem' }}>
                          Protected
                        </div>
                      )}
                    </MetricCard>
                  );
                })}
              </MetricGrid>
            </>
          )}

          <SectionTitle>{t('analysis.activityLevel')}</SectionTitle>
          <p>{analysis.activityLevel?.description ? t(analysis.activityLevel.description) : t('analysis.analyzing')}</p>
          <MetricGrid>
            <MetricCard>
              <MetricTitle>{t('analysis.activityLevel')}</MetricTitle>
              <MetricValue>{analysis.activityLevel?.level || t('analysis.analyzing')}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricTitle>{t('analysis.recentCommits')}</MetricTitle>
              <MetricValue>{analysis.activityLevel?.metrics?.recentCommits || 0}</MetricValue>
            </MetricCard>
            <MetricCard>
              <MetricTitle>{t('analysis.lastCommit')}</MetricTitle>
              <MetricValue>{analysis.activityLevel?.metrics?.lastCommitDate ? new Date(analysis.activityLevel.metrics.lastCommitDate).toLocaleDateString() : 'N/A'}</MetricValue>
            </MetricCard>
          </MetricGrid>

          <SectionTitle>{t('analysis.recommendations')}</SectionTitle>
          <RecommendationList>
            {analysis.recommendations?.map((rec, index) => (
              <RecommendationItem key={index} priority={rec.priority}>
                <PriorityBadge priority={rec.priority}>{rec.priority}</PriorityBadge>
                <strong>{t(rec.title)}:</strong> {t(rec.description)}
              </RecommendationItem>
            )) || (
              <RecommendationItem priority="low">
                <PriorityBadge priority="low">{t('analysis.information')}</PriorityBadge>
                <strong>{t('analysis.githubFeatures.analysisComplete')}</strong> {t('analysis.githubFeatures.preparingRecommendations')}
              </RecommendationItem>
            )}
          </RecommendationList>
          </ResultsCard>

          {/* 프리미엄 기능들 */}
          {/* GitHub API 연동 기능들 - 개별 컴포넌트로 분리 */}
          {isLoggedIn && repoInfo ? (
            <>
              <PullRequestsAnalysis repoInfo={repoInfo} />
              <IssuesAnalysis repoInfo={repoInfo} />
              <WorkflowsAnalysis repoInfo={repoInfo} />
              <ReleasesAnalysis repoInfo={repoInfo} />
            </>
          ) : (
            <div style={{ 
              marginTop: '2.5rem',
              background: 'rgba(255, 255, 255, 0.95)', 
              padding: '2rem', 
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              textAlign: 'center',
              color: '#4a4a4a',
              border: '1px solid rgba(226, 232, 240, 0.8)'
            }}>
              <h3 style={{ marginBottom: '0.75rem', color: '#1f2937', fontSize: '1.3rem' }}>
                {t('analysis.githubFeatures.githubAPIIntegration')}
              </h3>
              <p style={{ margin: '0 auto', maxWidth: '520px', lineHeight: 1.6 }}>
                {t('analysis.githubFeatures.githubAPIIntegrationDesc')}
              </p>
              <p style={{ marginTop: '1rem', fontWeight: 600, color: '#ff6b35' }}>
                {t('analysis.githubFeatures.loginRequired')}
              </p>
              <AnalyzeButton style={{ marginTop: '1rem' }} onClick={login}>
                {t('analysis.githubFeatures.loginWithGitHub')}
              </AnalyzeButton>
            </div>
          )}

          {/* 추가 프리미엄 기능들 */}
          {currentRepoKey && (
            <ChatSection>
              <ChatHeader>
                <ChatTitle>팀 채팅 & 기록</ChatTitle>
                <ChatDescription>
                  {canUseChat 
                    ? '저장소를 함께 사용하는 동료와 대화를 나누고 결정 사항을 남겨보세요.'
                    : '이 저장소의 기여자만 채팅을 사용할 수 있습니다.'
                  }
                </ChatDescription>
              </ChatHeader>
              <ChatMessages>
                {filteredChatMessages.length > 0 ? (
                  filteredChatMessages.map((message) => (
                    <ChatMessage key={message.id}>
                      <ChatMessageHeader>
                        <ChatAuthor>{message.author}</ChatAuthor>
                        <ChatTimestamp>
                          {new Date(message.timestamp).toLocaleString()}
                        </ChatTimestamp>
                      </ChatMessageHeader>
                      <ChatText>{message.text}</ChatText>
                    </ChatMessage>
                  ))
                ) : (
                  <ChatMessage>
                    <ChatText>
                      {canUseChat 
                        ? '아직 남겨진 메시지가 없습니다. 첫 대화를 시작해보세요!'
                        : '이 저장소의 기여자만 메시지를 볼 수 있습니다.'
                      }
                    </ChatText>
                  </ChatMessage>
                )}
              </ChatMessages>
              {!isLoggedIn ? (
                <ChatMessage>
                  <ChatText style={{ textAlign: 'center', color: '#dc2626' }}>
                    채팅 기능을 사용하려면 GitHub 로그인이 필요합니다.
                  </ChatText>
                </ChatMessage>
              ) : checkingContributor ? (
                <ChatMessage>
                  <ChatText style={{ textAlign: 'center', color: '#666' }}>
                    기여자 확인 중...
                  </ChatText>
                </ChatMessage>
              ) : !canUseChat ? (
                <ChatMessage>
                  <ChatText style={{ textAlign: 'center', color: '#dc2626' }}>
                    이 저장소의 기여자가 아니므로 채팅 기능을 사용할 수 없습니다. 
                    저장소에 커밋을 하면 기여자로 인식됩니다.
                  </ChatText>
                </ChatMessage>
              ) : (
                <ChatForm onSubmit={handleChatSubmit}>
                  <ChatInput
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="팀원들과 공유하고 싶은 메모나 아이디어를 입력하세요."
                    disabled={!canUseChat}
                  />
                  <ChatSubmitButton type="submit" disabled={!canUseChat}>
                    메시지 남기기
                  </ChatSubmitButton>
                </ChatForm>
              )}
            </ChatSection>
          )}
        </>
      )}

    </MainContent>
  </AnalysisContainer>

  {/* Branch Activity Modal */}
  {showBranchModal && selectedBranch && (
    <ModalOverlay onClick={() => setShowBranchModal(false)}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{t('analysis.branchDetails')}: {selectedBranch.branch}</ModalTitle>
          <CloseButton onClick={() => setShowBranchModal(false)}>
            ×
          </CloseButton>
        </ModalHeader>

        <BranchActivityGrid>
          <ActivityCard level={selectedBranch.commitCount > 50 ? 'Very Active' : selectedBranch.commitCount > 20 ? 'Active' : selectedBranch.commitCount > 10 ? 'Moderate' : 'Low'}>
            <ActivityTitle level={selectedBranch.commitCount > 50 ? 'Very Active' : selectedBranch.commitCount > 20 ? 'Active' : selectedBranch.commitCount > 10 ? 'Moderate' : 'Low'}>
              {t('analysis.commitCount')}
            </ActivityTitle>
            <ActivityValue level={selectedBranch.commitCount > 50 ? 'Very Active' : selectedBranch.commitCount > 20 ? 'Active' : selectedBranch.commitCount > 10 ? 'Moderate' : 'Low'}>
              {selectedBranch.commitCount}
            </ActivityValue>
            <ActivityDescription>
              {t('analysis.totalCommits')} {t('analysis.inThisBranch')}
            </ActivityDescription>
          </ActivityCard>

          <ActivityCard level={selectedBranch.branchProtected ? 'Very Active' : 'Moderate'}>
            <ActivityTitle level={selectedBranch.branchProtected ? 'Very Active' : 'Moderate'}>
              {t('analysis.isProtected')}
            </ActivityTitle>
            <ActivityValue level={selectedBranch.branchProtected ? 'Very Active' : 'Moderate'}>
              {selectedBranch.branchProtected ? t('analysis.protected') : t('analysis.open')}
            </ActivityValue>
            <ActivityDescription>
              {selectedBranch.branchProtected ? t('analysis.branchIsProtectedWithRules') : t('analysis.branchHasNoProtectionRules')}
            </ActivityDescription>
          </ActivityCard>

          <ActivityCard level={selectedBranch.branch === 'main' || selectedBranch.branch === 'master' ? 'Very Active' : selectedBranch.branch === 'develop' || selectedBranch.branch === 'dev' ? 'Active' : 'Moderate'}>
            <ActivityTitle level={selectedBranch.branch === 'main' || selectedBranch.branch === 'master' ? 'Very Active' : selectedBranch.branch === 'develop' || selectedBranch.branch === 'dev' ? 'Active' : 'Moderate'}>
              {t('analysis.branchType')}
            </ActivityTitle>
            <ActivityValue level={selectedBranch.branch === 'main' || selectedBranch.branch === 'master' ? 'Very Active' : selectedBranch.branch === 'develop' || selectedBranch.branch === 'dev' ? 'Active' : 'Moderate'}>
              {selectedBranch.branch === 'main' || selectedBranch.branch === 'master' ? t('analysis.main') : 
               selectedBranch.branch === 'develop' || selectedBranch.branch === 'dev' ? t('analysis.develop') : t('analysis.feature')}
            </ActivityValue>
            <ActivityDescription>
              {selectedBranch.branch === 'main' || selectedBranch.branch === 'master' ? t('analysis.primaryProductionBranch') : 
               selectedBranch.branch === 'develop' || selectedBranch.branch === 'dev' ? t('analysis.developmentIntegrationBranch') : t('analysis.featureOrTopicBranch')}
            </ActivityDescription>
          </ActivityCard>

          <ActivityCard level={selectedBranch.commitCount > 100 ? 'Very Active' : selectedBranch.commitCount > 50 ? 'Active' : selectedBranch.commitCount > 20 ? 'Moderate' : 'Low'}>
            <ActivityTitle level={selectedBranch.commitCount > 100 ? 'Very Active' : selectedBranch.commitCount > 50 ? 'Active' : selectedBranch.commitCount > 20 ? 'Moderate' : 'Low'}>
              {t('analysis.activityLevel')}
            </ActivityTitle>
            <ActivityValue level={selectedBranch.commitCount > 100 ? 'Very Active' : selectedBranch.commitCount > 50 ? 'Active' : selectedBranch.commitCount > 20 ? 'Moderate' : 'Low'}>
              {selectedBranch.commitCount > 100 ? t('analysis.veryActive') : 
               selectedBranch.commitCount > 50 ? t('analysis.active') : 
               selectedBranch.commitCount > 20 ? t('analysis.moderate') : t('analysis.low')}
            </ActivityValue>
            <ActivityDescription>
              {selectedBranch.commitCount > 100 ? t('analysis.highlyActiveDevelopment') : 
               selectedBranch.commitCount > 50 ? t('analysis.activeDevelopment') : 
               selectedBranch.commitCount > 20 ? t('analysis.moderateActivity') : t('analysis.lowActivity')}
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
{t('analysis.branchSummary')}
          </h4>
          <p style={{ margin: '0', color: '#666', lineHeight: '1.5', fontSize: '0.95rem' }}>
            <strong>{selectedBranch.branch}</strong> {t('analysis.branchHasCommitsAndIs').replace('{count}', selectedBranch.commitCount)} 
            {selectedBranch.branchProtected ? t('analysis.protectedWithBranchRules') : t('analysis.openForDirectPushes')}. 
            {selectedBranch.branch === 'main' || selectedBranch.branch === 'master' ? 
              t('analysis.mainProductionBranch') : 
              selectedBranch.branch === 'develop' || selectedBranch.branch === 'dev' ?
              t('analysis.developmentIntegrationBranchDesc') :
              t('analysis.appearsToBeFeatureBranch')}
          </p>
        </div>
      </ModalContent>
    </ModalOverlay>
  )}
</Layout>
);
};

export default RepositoryAnalysis;
