interface Env {
  DB: D1Database;
}

interface ClaimPayload {
  itemId: string;
  claimDate: string;
  claimerNickname?: string;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const normalizeText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';


const ensureClaimsSchema = async (db: D1Database): Promise<void> => {
  await db
    .prepare(`
      CREATE TABLE IF NOT EXISTS item_claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        claimer_name TEXT,
        claim_location TEXT,
        claim_date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      )
    `)
    .run();
  await db
    .prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_item_claims_item_id ON item_claims (item_id)')
    .run();
};

const tryInsertClaim = async (
  db: D1Database,
  id: number,
  nickname: string,
  claimDate: string,
  createdAt: string
): Promise<void> => {
  const attempts: Array<{ sql: string; bind: unknown[] }> = [
    {
      sql: `
        INSERT INTO item_claims (item_id, claimer_name, claim_location, claim_date, created_at)
        VALUES (?, ?, ?, ?, ?)
      `,
      bind: [id, nickname, '', claimDate, createdAt],
    },
    {
      sql: `
        INSERT INTO item_claims (item_id, claimer_name, claim_location, claim_date)
        VALUES (?, ?, ?, ?)
      `,
      bind: [id, nickname, '', claimDate],
    },
    {
      sql: `
        INSERT INTO item_claims (item_id, claimer_name, claim_date, created_at)
        VALUES (?, ?, ?, ?)
      `,
      bind: [id, nickname, claimDate, createdAt],
    },
    {
      sql: `
        INSERT INTO item_claims (item_id, claimer_name, claim_date)
        VALUES (?, ?, ?)
      `,
      bind: [id, nickname, claimDate],
    },
    {
      sql: `
        INSERT INTO item_claims (item_id, claim_date, created_at)
        VALUES (?, ?, ?)
      `,
      bind: [id, claimDate, createdAt],
    },
    {
      sql: `
        INSERT INTO item_claims (item_id, claim_date)
        VALUES (?, ?)
      `,
      bind: [id, claimDate],
    },
  ];

  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      await db.prepare(attempt.sql).bind(...attempt.bind).run();
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) {
    return json({ error: 'Database binding "DB" is missing.' }, 500);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON payload.' }, 400);
  }

  if (!payload || typeof payload !== 'object') {
    return json({ error: 'Invalid payload.' }, 400);
  }

  const body = payload as ClaimPayload;
  const itemId = normalizeText(body.itemId);
  const claimDate = normalizeText(body.claimDate);
  const claimerNickname = normalizeText(body.claimerNickname);

  if (!itemId || !claimDate) {
    return json({ error: 'Missing required fields.' }, 400);
  }

  if (claimerNickname.length > 80) {
    return json({ error: 'Claimed nickname is too long.' }, 400);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(claimDate)) {
    return json({ error: 'Claim date must be YYYY-MM-DD.' }, 400);
  }

  const id = Number.parseInt(itemId, 10);
  if (Number.isNaN(id) || id <= 0) {
    return json({ error: 'Invalid item ID.' }, 400);
  }

  const item = await env.DB
    .prepare(`
      SELECT id, title, status, moderation_status, contact, location
      FROM items
      WHERE id = ?
    `)
    .bind(id)
    .first<{
      id: number;
      title: string;
      status: 'lost' | 'found';
      moderation_status: 'pending' | 'approved' | 'rejected';
      contact: string;
      location: string;
    }>();

  if (!item) {
    return json({ error: 'Item not found.' }, 404);
  }

  if (item.moderation_status !== 'approved') {
    return json({ error: 'Only approved items can be claimed.' }, 400);
  }

  await ensureClaimsSchema(env.DB);

  const existingClaim = await env.DB
    .prepare('SELECT id FROM item_claims WHERE item_id = ? LIMIT 1')
    .bind(id)
    .first<{ id: number }>();

  if (existingClaim) {
    return json({ error: 'This item has already been claimed.' }, 409);
  }

  const createdAt = new Date().toISOString();
  try {
    await tryInsertClaim(env.DB, id, claimerNickname || '', claimDate, createdAt);
  } catch (error) {
    console.error('Failed to insert claim:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return json({ error: `Failed to save claim: ${detail}` }, 500);
  }

  return json({ success: true }, 201);
};
