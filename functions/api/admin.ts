interface Env {
  DB: D1Database;
  ADMIN_SECRET: string;
  GITHUB_BACKUP_TOKEN?: string;
  GITHUB_BACKUP_REPO?: string;
  GITHUB_BACKUP_BRANCH?: string;
}

type ModerationStatus = 'pending' | 'approved' | 'rejected';
type ModerationCounts = Record<ModerationStatus, number>;

interface ItemRow {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  contact: string;
  status: 'lost' | 'found';
  color: string;
  image_url: string | null;
  created_at: string;
  moderation_status: ModerationStatus;
  claim_location: string | null;
  claim_date: string | null;
  claim_created_at: string | null;
  claimer_name: string | null;
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
  claimed: Boolean(row.claim_created_at),
  claimerNickname: row.claimer_name || undefined,
  claimDate: row.claim_date || undefined,
  claimCreatedAt: row.claim_created_at || undefined,
});

const verifyAdmin = (request: Request, adminSecret: string): boolean => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.slice(7);
  return token === adminSecret;
};

const encodeBase64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
};

const toSafeFileTitle = (title: string): string => {
  const safe = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return safe || 'item';
};

const toCommitTitle = (title: string, itemId: number): string => {
  const trimmed = title.trim();
  return trimmed || `item ${itemId}`;
};

const backupDeletedClaimToGitHub = async (
  env: Env,
  data: {
    itemId: number;
    itemTitle: string;
    itemStatus: 'lost' | 'found';
    itemContact: string;
    itemLocation: string;
    claimDate: string | null;
    claimerNickname: string | null;
    claimRecordedAt: string;
    deletedAt: string;
  }
): Promise<void> => {
  const token = (env.GITHUB_BACKUP_TOKEN || '').trim();
  if (!token) return;

  const repo = (env.GITHUB_BACKUP_REPO || 'C0lor4/Database-No2').trim();
  const branch = (env.GITHUB_BACKUP_BRANCH || 'main').trim();

  const now = new Date(data.deletedAt);
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const safeTitle = toSafeFileTitle(data.itemTitle);
  const commitTitle = toCommitTitle(data.itemTitle, data.itemId);
  const path = `claims/${yyyy}/${mm}/${dd}/deleted-${safeTitle}-${data.itemId}-${stamp}.json`;

  const content = JSON.stringify(
    {
      event: 'deleted_claimed_item',
      ...data,
    },
    null,
    2
  ) + '\n';

  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'User-Agent': 'lost-found-admin-backup',
    },
    body: JSON.stringify({
      message: `backup: deleted claimed item ${commitTitle}`,
      content: encodeBase64(content),
      branch,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub backup failed (${response.status}): ${body}`);
  }
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

  const params: string[] = [];
  if (status) {
    params.push(status);
  }
  const counts: ModerationCounts = { pending: 0, approved: 0, rejected: 0 };

  const runQuery = async (selectColorExpr: string) => {
    let query = `
      SELECT items.id, items.title, items.description, items.location, items.date, items.contact, items.status, ${selectColorExpr} AS color, items.image_url, items.created_at, items.moderation_status,
             item_claims.claimer_name, item_claims.claim_location, item_claims.claim_date, item_claims.created_at AS claim_created_at
      FROM items
      LEFT JOIN item_claims ON item_claims.item_id = items.id
    `;
    if (status) {
      query += ' WHERE items.moderation_status = ?';
    }
    query += ' ORDER BY items.created_at DESC LIMIT 300';
    const stmt = env.DB.prepare(query);
    const boundStmt = params.reduce((acc, param) => acc.bind(param), stmt);
    return boundStmt.all<ItemRow>();
  };
  const loadCounts = async () => {
    const countRows = await env.DB
      .prepare(`
        SELECT moderation_status, COUNT(*) AS count
        FROM items
        GROUP BY moderation_status
      `)
      .all<{ moderation_status: ModerationStatus; count: number }>();

    for (const row of countRows.results || []) {
      counts[row.moderation_status] = Number(row.count || 0);
    }
  };

  try {
    const result = await runQuery('COALESCE(custom_color, color)');
    await loadCounts();
    const items = (result.results || []).map(toItem);
    return json({ items, counts });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('no such column: custom_color')) {
      const fallbackResult = await runQuery('color');
      await loadCounts();
      const items = (fallbackResult.results || []).map(toItem);
      return json({ items, counts });
    }
    console.error('Failed to load admin items:', error);
    return json({ error: 'Failed to load items.' }, 500);
  }
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
    type DeletableItemRow = {
      id: number;
      title: string;
      status: 'lost' | 'found';
      contact: string;
      location: string;
      claim_date: string | null;
      claimer_name: string | null;
      claim_created_at: string | null;
    };

    let target: DeletableItemRow | null = null;
    try {
      target = await env.DB
        .prepare(`
          SELECT items.id, items.title, items.status, items.contact, items.location,
                 item_claims.claim_date, item_claims.claimer_name, item_claims.created_at AS claim_created_at
          FROM items
          LEFT JOIN item_claims ON item_claims.item_id = items.id
          WHERE items.id = ?
          LIMIT 1
        `)
        .bind(id)
        .first<DeletableItemRow>();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('no such table: item_claims')) {
        throw error;
      }
    }

    if (!target) {
      const fallback = await env.DB
        .prepare(`
          SELECT id, title, status, contact, location
          FROM items
          WHERE id = ?
          LIMIT 1
        `)
        .bind(id)
        .first<{
          id: number;
          title: string;
          status: 'lost' | 'found';
          contact: string;
          location: string;
        }>();

      if (!fallback) {
        return json({ error: 'Item not found.' }, 404);
      }

      target = {
        ...fallback,
        claim_date: null,
        claimer_name: null,
        claim_created_at: null,
      };
    }

    if (target.claim_created_at) {
      const deletedAt = new Date().toISOString();
      try {
        await backupDeletedClaimToGitHub(env, {
          itemId: target.id,
          itemTitle: target.title,
          itemStatus: target.status,
          itemContact: target.contact,
          itemLocation: target.location,
          claimDate: target.claim_date,
          claimerNickname: target.claimer_name,
          claimRecordedAt: target.claim_created_at,
          deletedAt,
        });
      } catch (error) {
        console.error('Failed to backup claimed item before delete:', error);
        return json({ error: 'Failed to backup claimed item to GitHub.' }, 500);
      }
    }

    await env.DB
      .prepare('DELETE FROM items WHERE id = ?')
      .bind(id)
      .run();
    return json({ success: true });
  }

  if (action === 'unclaim') {
    try {
      await env.DB
        .prepare('DELETE FROM item_claims WHERE item_id = ?')
        .bind(id)
        .run();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('no such table: item_claims')) {
        throw error;
      }
    }
    return json({ success: true });
  }

  return json({ error: 'Invalid action. Use: approve, reject, delete, or unclaim.' }, 400);
};
