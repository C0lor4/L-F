interface Env {
  DB: D1Database;
}

type ItemStatus = 'lost' | 'found';
type StickyColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';

interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  contact: string;
  status: ItemStatus;
  color: StickyColor;
  imageUrl?: string;
  createdAt: string;
}

interface ItemRow {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  contact: string;
  status: ItemStatus;
  color: StickyColor;
  image_url: string | null;
  created_at: string;
}

const MAX_LENGTHS = {
  title: 120,
  description: 1500,
  location: 180,
  contact: 180,
  imageUrl: 2048,
};

const BANNED_KEYWORDS = ['viagra', 'casino', 'loan offer', 'crypto giveaway'];

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const normalizeText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const toItem = (row: ItemRow): LostFoundItem => ({
  id: String(row.id),
  title: row.title,
  description: row.description,
  location: row.location,
  date: row.date,
  contact: row.contact,
  status: row.status,
  color: row.color,
  imageUrl: row.image_url || undefined,
  createdAt: row.created_at,
});

const validatePayload = (input: unknown): { ok: true; value: Omit<LostFoundItem, 'id' | 'createdAt'> } | { ok: false; error: string } => {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'Invalid payload.' };
  }

  const body = input as Record<string, unknown>;
  const title = normalizeText(body.title);
  const description = normalizeText(body.description);
  const location = normalizeText(body.location);
  const date = normalizeText(body.date);
  const contact = normalizeText(body.contact);
  const status = normalizeText(body.status) as ItemStatus;
  const color = normalizeText(body.color) as StickyColor;
  const imageUrl = normalizeText(body.imageUrl);

  if (!title || !description || !location || !date || !contact) {
    return { ok: false, error: 'Required fields are missing.' };
  }

  if (title.length > MAX_LENGTHS.title || description.length > MAX_LENGTHS.description || location.length > MAX_LENGTHS.location || contact.length > MAX_LENGTHS.contact) {
    return { ok: false, error: 'One or more fields are too long.' };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: 'Date format must be YYYY-MM-DD.' };
  }

  if (!['lost', 'found'].includes(status)) {
    return { ok: false, error: 'Invalid status.' };
  }

  if (!['yellow', 'pink', 'blue', 'green', 'orange', 'purple'].includes(color)) {
    return { ok: false, error: 'Invalid color.' };
  }

  if (imageUrl) {
    if (imageUrl.length > MAX_LENGTHS.imageUrl) {
      return { ok: false, error: 'Image URL is too long.' };
    }
    try {
      const url = new URL(imageUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return { ok: false, error: 'Image URL must use http or https.' };
      }
    } catch {
      return { ok: false, error: 'Image URL is invalid.' };
    }
  }

  const scanText = `${title} ${description} ${location} ${contact}`.toLowerCase();
  if (BANNED_KEYWORDS.some((keyword) => scanText.includes(keyword))) {
    return { ok: false, error: 'Submission rejected by anti-abuse filter.' };
  }

  return {
    ok: true,
    value: {
      title,
      description,
      location,
      date,
      contact,
      status,
      color,
      imageUrl: imageUrl || undefined,
    },
  };
};

const hashIp = async (ip: string): Promise<string> => {
  const bytes = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hash;
};

const enforceRateLimit = async (db: D1Database, ip: string): Promise<{ ok: true } | { ok: false; error: string }> => {
  const ipHash = await hashIp(ip || 'unknown');
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;
  const oneDayAgo = now - 86_400_000;

  await db
    .prepare('INSERT INTO submission_logs (ip_hash, created_at) VALUES (?, ?)')
    .bind(ipHash, now)
    .run();

  const minuteResult = await db
    .prepare('SELECT COUNT(*) AS count FROM submission_logs WHERE ip_hash = ? AND created_at >= ?')
    .bind(ipHash, oneMinuteAgo)
    .first<{ count: number }>();

  const dayResult = await db
    .prepare('SELECT COUNT(*) AS count FROM submission_logs WHERE ip_hash = ? AND created_at >= ?')
    .bind(ipHash, oneDayAgo)
    .first<{ count: number }>();

  const minuteCount = Number(minuteResult?.count || 0);
  const dayCount = Number(dayResult?.count || 0);

  if (minuteCount > 3 || dayCount > 20) {
    return { ok: false, error: 'Too many submissions. Please try again later.' };
  }

  if (Math.random() < 0.03) {
    const sevenDaysAgo = now - 7 * 86_400_000;
    await db.prepare('DELETE FROM submission_logs WHERE created_at < ?').bind(sevenDaysAgo).run();
  }

  return { ok: true };
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) {
    return json({ error: 'Database binding "DB" is missing.' }, 500);
  }

  const rows = await env.DB
    .prepare(`
      SELECT id, title, description, location, date, contact, status, color, image_url, created_at
      FROM items
      WHERE moderation_status = 'approved'
      ORDER BY created_at DESC
      LIMIT 300
    `)
    .all<ItemRow>();

  const items = (rows.results || []).map(toItem);
  return json({ items });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) {
    return json({ error: 'Database binding "DB" is missing.' }, 500);
  }

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const rateLimit = await enforceRateLimit(env.DB, ip);
  if (!rateLimit.ok) {
    return json({ error: rateLimit.error }, 429);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON payload.' }, 400);
  }

  const validated = validatePayload(payload);
  if (!validated.ok) {
    return json({ error: validated.error }, 400);
  }

  const item = validated.value;
  const createdAt = new Date().toISOString();
  const insert = await env.DB
    .prepare(`
      INSERT INTO items (title, description, location, date, contact, status, color, image_url, created_at, moderation_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      item.title,
      item.description,
      item.location,
      item.date,
      item.contact,
      item.status,
      item.color,
      item.imageUrl || null,
      createdAt,
      'pending'
    )
    .run();

  const id = Number(insert.meta.last_row_id || 0);
  if (!id) {
    return json({ error: 'Failed to save item.' }, 500);
  }

  const row = await env.DB
    .prepare(`
      SELECT id, title, description, location, date, contact, status, color, image_url, created_at
      FROM items
      WHERE id = ?
    `)
    .bind(id)
    .first<ItemRow>();

  if (!row) {
    return json({ error: 'Saved item could not be loaded.' }, 500);
  }

  return json({ item: toItem(row) }, 201);
};
