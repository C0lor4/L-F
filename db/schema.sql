-- Items posted by users
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  contact TEXT NOT NULL,
  bonus_price TEXT,
  status TEXT NOT NULL CHECK (status IN ('lost', 'found')),
  color TEXT NOT NULL CHECK (color IN ('yellow', 'pink', 'blue', 'green', 'orange', 'purple')),
  custom_color TEXT,
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

-- Claim records for lost items
CREATE TABLE IF NOT EXISTS item_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  claimer_name TEXT,
  claim_location TEXT,
  claim_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_item_claims_item_id ON item_claims (item_id);
