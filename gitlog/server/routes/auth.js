const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

// 환경 변수
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
// 로컬 환경에서는 http://localhost:5000/api/auth/callback 사용
// 배포 환경에서는 환경 변수 GITHUB_REDIRECT_URI로 설정
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5000/api/auth/callback';
const CLIENT_URL = (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';

// 환경 변수 디버깅
console.log('🔍 [환경 변수 확인] 서버 시작 시 환경 변수 상태:');
console.log('GITHUB_CLIENT_ID:', GITHUB_CLIENT_ID ? '설정됨' : '❌ 없음');
console.log('GITHUB_CLIENT_SECRET:', GITHUB_CLIENT_SECRET ? '설정됨' : '❌ 없음');
console.log('GITHUB_REDIRECT_URI:', GITHUB_REDIRECT_URI);
console.log('CLIENT_URL:', CLIENT_URL);
console.log('JWT_SECRET:', JWT_SECRET ? '설정됨' : '❌ 없음');

// GitHub OAuth 시작
router.get('/github', (req, res) => {
  try {
    console.log('🔄 [OAuth 시작] 사용자가 GitHub 로그인을 요청했습니다');
    
    // state 생성 및 세션에 저장
    const state = Math.random().toString(36).substring(7);
    req.session.state = state;
    console.log(`🔐 [보안] CSRF 방지를 위한 state 값 생성: ${state}`);
    
    // GitHub OAuth URL 생성
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&state=${state}&scope=user:email,repo`;
    
    console.log('📤 [리다이렉트] 사용자를 GitHub 인증 페이지로 이동시킵니다');
    console.log(`🔗 [URL] GitHub OAuth URL: ${authUrl}`);
    res.redirect(authUrl);
    
  } catch (error) {
    console.error('❌ [오류] GitHub OAuth 시작 중 문제가 발생했습니다:', error);
    res.status(500).json({ 
      error: 'OAuth initiation failed',
      message: error.message 
    });
  }
});

// GitHub OAuth 콜백 처리
router.get('/callback', async (req, res) => {
  try {
    console.log('🔄 [콜백 처리] GitHub에서 인증 완료 후 돌아온 사용자를 처리합니다');
    
    const { code, state } = req.query;
    
    // 디버그 정보
    console.log('📥 [요청 분석] GitHub에서 받은 인증 데이터를 확인합니다:', {
      code: code ? `${code.substring(0, 10)}...` : '없음',
      state: state || '없음',
      sessionState: req.session.state || '없음'
    });
    
    // 필수 파라미터 검증
    if (!code) {
      console.error('❌ [오류] GitHub에서 받은 인증 코드가 없습니다');
      return res.status(400).json({ 
        error: 'Authorization code is required' 
      });
    }
    
    // state 검증 (개발 환경에서는 유연하게)
    if (process.env.NODE_ENV === 'production' && state !== req.session.state) {
      console.error('❌ [보안 오류] CSRF 공격으로 의심되는 잘못된 state 값입니다:', { received: state, expected: req.session.state });
      return res.status(400).json({ 
        error: 'Invalid state parameter' 
      });
    }
    
    console.log('🔄 [토큰 요청] GitHub API에 액세스 토큰을 요청합니다');
    
    // GitHub에서 액세스 토큰 요청
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: code
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 [토큰 응답] GitHub에서 액세스 토큰 요청 결과를 확인합니다:', {
      status: tokenResponse.status,
      hasAccessToken: !!tokenResponse.data.access_token,
      error: tokenResponse.data.error || '없음'
    });
    
    const { access_token, error, error_description } = tokenResponse.data;
    
    if (error) {
      console.error('❌ [토큰 오류] GitHub에서 액세스 토큰 발급에 실패했습니다:', { error, error_description });
      return res.status(400).json({ 
        error: 'GitHub token error',
        details: error_description || error
      });
    }
    
    if (!access_token) {
      console.error('❌ [토큰 누락] GitHub에서 액세스 토큰을 받지 못했습니다');
      return res.status(400).json({ 
        error: 'No access token received from GitHub' 
      });
    }
    
    console.log('🔄 [사용자 정보] GitHub API에서 사용자 정보를 가져옵니다');
    
    // GitHub에서 사용자 정보 가져오기
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    console.log('📥 [사용자 정보] GitHub에서 받은 사용자 데이터를 확인합니다:', {
      status: userResponse.status,
      userId: userResponse.data?.id,
      login: userResponse.data?.login,
      name: userResponse.data?.name
    });
    
    const user = userResponse.data;
    
    // JWT 토큰 생성 (GitHub Access Token 포함)
    const token = jwt.sign(
      {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        githubAccessToken: access_token  // GitHub Access Token 추가
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ [JWT 생성] 사용자 인증을 위한 JWT 토큰을 생성했습니다:', {
      userId: user.id,
      login: user.login,
      tokenLength: token.length
    });
    
    // 응답 데이터
    const responseData = {
      id: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
      token: token
    };
    
    console.log('📤 [응답 전송] 클라이언트에게 로그인 성공 데이터를 전송합니다:', {
      userId: responseData.id,
      login: responseData.login,
      hasToken: !!responseData.token
    });
    
    // 프론트엔드로 리다이렉트 (토큰을 URL 파라미터로 전달)
    const frontendUrl = `${CLIENT_URL}/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(responseData))}`;
    console.log('🏠 [리다이렉트] 프론트엔드로 리다이렉트합니다:', frontendUrl);
    res.redirect(frontendUrl);
    
  } catch (error) {
    console.error('❌ [콜백 오류] OAuth 인증 처리 중 예상치 못한 오류가 발생했습니다:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    res.status(500).json({ 
      error: 'OAuth callback failed',
      message: error.message,
      details: error.response?.data || 'Unknown error'
    });
  }
});

// 현재 사용자 정보 가져오기
router.get('/me', (req, res) => {
  try {
    console.log('🔄 [사용자 확인] 현재 로그인한 사용자 정보를 요청받았습니다');
    
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      console.error('❌ [인증 실패] 요청에 JWT 토큰이 포함되지 않았습니다');
      return res.status(401).json({ 
        error: 'No token provided' 
      });
    }
    
    // JWT 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ [토큰 검증] JWT 토큰이 유효하며 사용자 정보를 추출했습니다:', {
      userId: decoded.id,
      login: decoded.login
    });
    
    // 사용자 정보 반환
    res.json({
      id: decoded.id,
      login: decoded.login,
      name: decoded.name,
      email: decoded.email,
      avatar_url: decoded.avatar_url,
      html_url: decoded.html_url
    });
    
  } catch (error) {
    console.error('❌ [토큰 오류] JWT 토큰 검증에 실패했습니다:', error.message);
    res.status(401).json({ 
      error: 'Invalid token',
      message: error.message 
    });
  }
});

// 로그아웃
router.post('/logout', (req, res) => {
  try {
    console.log('🔄 [로그아웃] 사용자가 로그아웃을 요청했습니다');
    
    // 세션 삭제
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ [세션 오류] 사용자 세션을 삭제하는 중 오류가 발생했습니다:', err);
        return res.status(500).json({ 
          error: 'Logout failed' 
        });
      }
      
      console.log('✅ [로그아웃 완료] 사용자 세션이 성공적으로 삭제되었습니다');
      res.json({ 
        message: 'Logged out successfully' 
      });
    });
    
  } catch (error) {
    console.error('❌ [로그아웃 오류] 로그아웃 처리 중 예상치 못한 오류가 발생했습니다:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      message: error.message 
    });
  }
});

module.exports = router;
