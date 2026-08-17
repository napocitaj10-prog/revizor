CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line TEXT NOT NULL,
  direction TEXT NOT NULL,
  stop TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('Slabá Wi-Fi', 'Revízor')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
