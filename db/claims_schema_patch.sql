-- Apply this on existing D1 databases that predate claim columns.
-- Example:
-- wrangler d1 execute <DB_NAME> --file=db/claims_schema_patch.sql

PRAGMA foreign_keys = ON;

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
