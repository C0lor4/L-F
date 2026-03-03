interface Env {
  DB: D1Database;
  ADMIN_SECRET: string;
}

type ModerationStatus = 'pending' | 'approved' | 'rejected';

interface ItemRow {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  contact: string;
  status: 'lost' | 'found';
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';
  image_url: string | null;
  created_at: string;
  moderation_status: ModerationStatus;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const toItem = (row: ItemRow) => ({
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
  moderationStatus: row.moderation_status,
});

const verifyAdmin = (request: Request, adminSecret: string): boolean => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.slice(7);
  return token === adminSecret;
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) {
    return json({ error: 'Database binding "DB" is missing.' }, 500);
  }

  if (!verifyAdmin(request, env.ADMIN_SECRET)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') as ModerationStatus | null;

  let query = `
    SELECT id, title, description, location, date, contact, status, color, image_url, created_at, moderation_status
    FROM items
  `;
  const params: string[] = [];

  if (status) {
    query += ' WHERE moderation_status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT 300';

  const stmt = env.DB.prepare(query);
  const boundStmt = params.reduce((stmt, param) => stmt.bind(param), stmt);
  const result = await boundStmt.all<ItemRow>();

  const items = (result.results || []).map(toItem);
  return json({ items });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) {
    return json({ error: 'Database binding "DB" is missing.' }, 500);
  }

  if (!verifyAdmin(request, env.ADMIN_SECRET)) {
    return json({ error: 'Unauthorized' }, 401);
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

  const body = payload as Record<string, unknown>;
  const action = body.action;
  const itemId = body.id;

  if (!action || !itemId || typeof itemId !== 'string') {
    return json({ error: 'Missing required fields: action and id.' }, 400);
  }

  const id = parseInt(itemId, 10);
  if (isNaN(id)) {
    return json({ error: 'Invalid item ID.' }, 400);
  }

  if (action === 'approve') {
    await env.DB
      .prepare('UPDATE items SET moderation_status = ? WHERE id = ?')
      .bind('approved', id)
      .run();
    return json({ success: true });
  }

  if (action === 'reject') {
    await env.DB
      .prepare('UPDATE items SET moderation_status = ? WHERE id = ?')
      .bind('rejected', id)
      .run();
    return json({ success: true });
  }

  if (action === 'delete') {
    await env.DB
      .prepare('DELETE FROM items WHERE id = ?')
      .bind(id)
      .run();
    return json({ success: true });
  }

  return json({ error: 'Invalid action. Use: approve, reject, or delete.' }, 400);
};
