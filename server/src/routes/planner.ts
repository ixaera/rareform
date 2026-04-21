import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { query } from '../db';
import pool from '../db';

export const plannerRouter = Router();
plannerRouter.use(requireAuth);

// ── Helpers ───────────────────────────────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function rowToTask(row: any) {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    tags: row.tags ?? [],
    goalIds: row.goal_ids ?? [],
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchTags(userId: number): Promise<string[]> {
  const result = await query(
    'SELECT name FROM user_tags WHERE user_id = $1 ORDER BY name ASC',
    [userId]
  );
  return result.rows.map((r: any) => r.name);
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

plannerRouter.get('/tasks', async (req: Request, res: Response): Promise<void> => {
  const { date } = req.query;
  if (!date || !DATE_RE.test(date as string)) {
    res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });
    return;
  }
  try {
    const result = await query(
      `SELECT id, text, completed, tags, goal_ids, date, created_at, updated_at
       FROM tasks WHERE user_id = $1 AND date = $2 ORDER BY created_at ASC`,
      [req.user!.userId, date]
    );
    res.json({ tasks: result.rows.map(rowToTask) });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

plannerRouter.post('/tasks', async (req: Request, res: Response): Promise<void> => {
  const { text, completed = false, tags = [], goalIds = [], date } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'text is required' });
    return;
  }
  if (!date || !DATE_RE.test(date)) {
    res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
    return;
  }
  try {
    const result = await query(
      `INSERT INTO tasks (user_id, text, completed, tags, goal_ids, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, text, completed, tags, goal_ids, date, created_at, updated_at`,
      [req.user!.userId, text.trim(), completed, tags, goalIds, date]
    );
    res.status(201).json({ task: rowToTask(result.rows[0]) });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

plannerRouter.patch('/tasks/:id', async (req: Request, res: Response): Promise<void> => {
  const taskId = parseInt(req.params.id, 10);
  if (isNaN(taskId)) {
    res.status(400).json({ error: 'Invalid task id' });
    return;
  }
  const { text, completed, tags, goalIds } = req.body;
  try {
    const result = await query(
      `UPDATE tasks
       SET text      = COALESCE($3, text),
           completed = COALESCE($4, completed),
           tags      = COALESCE($5, tags),
           goal_ids  = COALESCE($6, goal_ids),
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, text, completed, tags, goal_ids, date, created_at, updated_at`,
      [taskId, req.user!.userId,
       text ?? null,
       completed ?? null,
       tags ?? null,
       goalIds ?? null]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ task: rowToTask(result.rows[0]) });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

plannerRouter.delete('/tasks/:id', async (req: Request, res: Response): Promise<void> => {
  const taskId = parseInt(req.params.id, 10);
  if (isNaN(taskId)) {
    res.status(400).json({ error: 'Invalid task id' });
    return;
  }
  try {
    const result = await query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, req.user!.userId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Tags ──────────────────────────────────────────────────────────────────────

plannerRouter.get('/tags', async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await fetchTags(req.user!.userId);
    res.json({ tags });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

plannerRouter.post('/tags', async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  if (name.trim().length > 50) {
    res.status(400).json({ error: 'Tag name must be 50 characters or fewer' });
    return;
  }
  try {
    await query(
      'INSERT INTO user_tags (user_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user!.userId, name.trim()]
    );
    const tags = await fetchTags(req.user!.userId);
    res.json({ tags });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

plannerRouter.patch('/tags/:name', async (req: Request, res: Response): Promise<void> => {
  const oldName = req.params.name;
  const { newName } = req.body;
  if (!newName || typeof newName !== 'string' || !newName.trim()) {
    res.status(400).json({ error: 'newName is required' });
    return;
  }
  const userId = req.user!.userId;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tagResult = await client.query(
      'UPDATE user_tags SET name = $3 WHERE user_id = $1 AND name = $2',
      [userId, oldName, newName.trim()]
    );
    if (tagResult.rowCount === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    await client.query(
      `UPDATE tasks
       SET tags = array_replace(tags, $2, $3), updated_at = NOW()
       WHERE user_id = $1 AND $2 = ANY(tags)`,
      [userId, oldName, newName.trim()]
    );
    await client.query('COMMIT');
    const tags = await fetchTags(userId);
    res.json({ tags });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

plannerRouter.delete('/tags/:name', async (req: Request, res: Response): Promise<void> => {
  const name = req.params.name;
  const userId = req.user!.userId;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'DELETE FROM user_tags WHERE user_id = $1 AND name = $2',
      [userId, name]
    );
    await client.query(
      `UPDATE tasks
       SET tags = array_remove(tags, $2), updated_at = NOW()
       WHERE user_id = $1 AND $2 = ANY(tags)`,
      [userId, name]
    );
    await client.query('COMMIT');
    const tags = await fetchTags(userId);
    res.json({ tags });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});
