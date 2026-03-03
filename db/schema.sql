-- Items posted by users
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  contact TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('lost', 'found')),
  color TEXT NOT NULL CHECK (color IN ('yellow', 'pink', 'blue', 'green', 'orange', 'purple')),
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_items_created_at ON items (created_at DESC);

-- Hashed IP submission logs for simple rate limiting
CREATE TABLE IF NOT EXISTS submission_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submission_logs_ip_time ON submission_logs (ip_hash, created_at DESC);
