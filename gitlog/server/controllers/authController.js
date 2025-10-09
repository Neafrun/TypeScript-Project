const axios = require('axios');
const jwt = require('jsonwebtoken');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/callback';

// GitHub OAuth URL 생성
const getGitHubAuthUrl = (req, res) => {
  // 세션 없이 간단한 state 생성
  const state = Math.random().toString(36).substring(7);
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&state=${state}&scope=user:email,repo`;
  
  console.log('GitHub OAuth URL 생성:', { state, authUrl });
  res.redirect(authUrl);
};

// GitHub OAuth 콜백 처리
const handleCallback = async (req, res) => {
  try {
    const { code } = req.body;
    
    console.log('OAuth 콜백 처리 시작:', { code: code ? 'present' : 'missing' });
    
    if (!code) {
      return res.status(400).json({ error: '인증 코드가 없습니다' });
    }
    
    // 코드를 액세스 토큰으로 교환
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: code,
    }, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const { access_token } = tokenResponse.data;
    
    if (!access_token) {
      return res.status(400).json({ error: '액세스 토큰을 가져오는데 실패했습니다' });
    }
    
    // GitHub에서 사용자 정보 가져오기
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${access_token}`,
      },
    });
    
    const user = userResponse.data;
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: user.id, 
        login: user.login, 
        access_token: access_token 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // 쿠키 설정 (개발환경에서는 localhost 전역에 설정하여 3000/5000 모두 접근 가능하도록)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });
    
    res.json({
      id: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
    });
    
  } catch (error) {
    console.error('OAuth 콜백 오류:', error);
    res.status(500).json({ error: '인증에 실패했습니다' });
  }
};

// 현재 사용자 가져오기
const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: '토큰이 제공되지 않았습니다' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // GitHub에서 최신 사용자 데이터 가져오기
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${decoded.access_token}`,
      },
    });
    
    const user = userResponse.data;
    
    res.json({
      id: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
    });
    
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    res.status(401).json({ error: '잘못된 토큰입니다' });
  }
};

// 로그아웃
const logout = (req, res) => {
  // 쿠키 완전 삭제
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
    path: '/',
  });
  
  // 세션 삭제
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('세션 삭제 실패:', err);
      }
    });
  }
  
  res.json({ message: '성공적으로 로그아웃되었습니다' });
};

module.exports = {
  getGitHubAuthUrl,
  handleCallback,
  getCurrentUser,
  logout,
};