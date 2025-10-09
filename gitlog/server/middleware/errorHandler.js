const errorHandler = (err, req, res, next) => {
  console.error('오류:', err);

  // 기본 오류
  let error = { ...err };
  error.message = err.message;

  // Mongoose 잘못된 ObjectId
  if (err.name === 'CastError') {
    const message = '리소스를 찾을 수 없습니다';
    error = { message, statusCode: 404 };
  }

  // Mongoose 중복 키
  if (err.code === 11000) {
    const message = '중복된 필드 값이 입력되었습니다';
    error = { message, statusCode: 400 };
  }

  // Mongoose 유효성 검사 오류
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // JWT 오류
  if (err.name === 'JsonWebTokenError') {
    const message = '잘못된 토큰입니다';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = '토큰이 만료되었습니다';
    error = { message, statusCode: 401 };
  }

  // GitHub API 오류
  if (err.response && err.response.status === 401) {
    const message = 'GitHub 인증에 실패했습니다';
    error = { message, statusCode: 401 };
  }

  if (err.response && err.response.status === 403) {
    const message = 'GitHub API 요청 한도를 초과했습니다';
    error = { message, statusCode: 429 };
  }

  if (err.response && err.response.status === 404) {
    const message = 'GitHub 리소스를 찾을 수 없습니다';
    error = { message, statusCode: 404 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '서버 오류',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;