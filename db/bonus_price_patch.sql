-- Apply this on existing D1 databases to add optional lost-item reward text.
-- Example:
-- wrangler d1 execute <DB_NAME> --file=db/bonus_price_patch.sql

ALTER TABLE items ADD COLUMN bonus_price TEXT;
