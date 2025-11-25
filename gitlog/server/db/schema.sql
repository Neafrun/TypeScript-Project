-- 사용자 분석 사용 기록 테이블
CREATE TABLE IF NOT EXISTS user_analysis_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  github_login TEXT NOT NULL,
  analysis_count INTEGER DEFAULT 0,
  free_analysis_used INTEGER DEFAULT 0,
  is_premium INTEGER DEFAULT 0,
  premium_expires_at TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_id ON user_analysis_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_github_login ON user_analysis_usage(github_login);

-- 결제 내역 테이블
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  payment_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL,
  payment_provider TEXT NOT NULL,
  provider_payment_id TEXT,
  plan_type TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 제작자 목록 테이블
CREATE TABLE IF NOT EXISTS creators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_login TEXT UNIQUE NOT NULL,
  github_user_id INTEGER NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'creator',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_creators_github_login ON creators(github_login);

