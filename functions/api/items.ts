interface Env {
  DB: D1Database;
}

type ItemStatus = 'lost' | 'found';
type StickyColor = string;

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
  imageUrl: 2_100_000,
};

const BANNED_KEYWORDS = ['viagra', 'casino', 'loan offer', 'crypto giveaway'];
const DATA_IMAGE_PREFIX = /^data:image\/[a-zA-Z0-9.+-]+;base64,/;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const PRESET_COLORS = ['yellow', 'pink', 'blue', 'green', 'orange', 'purple'] as const;

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
  const inputColor = normalizeText(body.color);
  const imageUrl = normalizeText(body.imageUrl);

  let color: StickyColor | null = null;
  if (PRESET_COLORS.includes(inputColor.toLowerCase() as (typeof PRESET_COLORS)[number])) {
    color = inputColor.toLowerCase();
  } else if (HEX_COLOR_PATTERN.test(inputColor)) {
    color = inputColor.toLowerCase();
  }

  if (!title || !location || !date || !contact) {
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

  if (!color) {
    return { ok: false, error: 'Invalid color.' };
  }

  if (imageUrl) {
    if (imageUrl.length > MAX_LENGTHS.imageUrl) {
      return { ok: false, error: 'Image URL is too long.' };
    }

    const isDataImage = DATA_IMAGE_PREFIX.test(imageUrl);
    if (isDataImage) {
      const base64Data = imageUrl.split(',')[1] || '';
      if (!base64Data || !/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
        return { ok: false, error: 'Image data is invalid.' };
      }
    } else {
      try {
        const url = new URL(imageUrl);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return { ok: false, error: 'Image URL must use http or https.' };
        }
      } catch {
        return { ok: false, error: 'Image URL is invalid.' };
      }
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

  const runQuery = (selectColorExpr: string) =>
    env.DB
      .prepare(`
        SELECT id, title, description, location, date, contact, status, ${selectColorExpr} AS color, image_url, created_at
        FROM items
        WHERE moderation_status = 'approved'
        ORDER BY created_at DESC
        LIMIT 300
      `)
      .all<ItemRow>();

  try {
    const rows = await runQuery('COALESCE(custom_color, color)');
    const items = (rows.results || []).map(toItem);
    return json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('no such column: custom_color')) {
      const fallbackRows = await runQuery('color');
      const fallbackItems = (fallbackRows.results || []).map(toItem);
      return json({ items: fallbackItems });
    }
    console.error('Failed to load items:', error);
    return json({ error: 'Failed to load items.' }, 500);
  }
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
  const isCustomColor = HEX_COLOR_PATTERN.test(item.color);
  try {
    const insertWithCustomColor = () =>
      env.DB
        .prepare(`
          INSERT INTO items (title, description, location, date, contact, status, color, custom_color, image_url, created_at, moderation_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          item.title,
          item.description,
          item.location,
          item.date,
          item.contact,
          item.status,
          isCustomColor ? 'yellow' : item.color,
          isCustomColor ? item.color : null,
          item.imageUrl || null,
          createdAt,
          'pending'
        )
        .run();

    const insertLegacy = () =>
      env.DB
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

    let insert;
    try {
      insert = await insertWithCustomColor();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('no such column: custom_color')) {
        throw error;
      }
      if (isCustomColor) {
        return json({ error: 'Custom colors require a database migration.' }, 400);
      }
      insert = await insertLegacy();
    }

    const id = Number(insert.meta.last_row_id || 0);
    if (!id) {
      return json({ error: 'Failed to save item.' }, 500);
    }

    let row: ItemRow | null = null;
    try {
      row = await env.DB
        .prepare(`
          SELECT id, title, description, location, date, contact, status, COALESCE(custom_color, color) AS color, image_url, created_at
          FROM items
          WHERE id = ?
        `)
        .bind(id)
        .first<ItemRow>();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('no such column: custom_color')) {
        throw error;
      }
      row = await env.DB
        .prepare(`
          SELECT id, title, description, location, date, contact, status, color, image_url, created_at
          FROM items
          WHERE id = ?
        `)
        .bind(id)
        .first<ItemRow>();
    }

    if (!row) {
      return json({ error: 'Saved item could not be loaded.' }, 500);
    }

    return json({ item: toItem(row) }, 201);
  } catch (error) {
    console.error('Failed to save item:', error);
    return json({ error: 'Failed to save item.' }, 500);
  }
};
