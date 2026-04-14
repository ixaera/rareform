import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { requireAuth } from '../middleware/requireAuth';

export const authRouter = Router();

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict' as const,
  maxAge: COOKIE_MAX_AGE,
};

authRouter.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email, and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const existing = await query(
    'SELECT id FROM users WHERE username = $1 OR email = $2',
    [username, email]
  );
  if (existing.rows.length > 0) {
    res.status(409).json({ error: 'Username or email is already taken' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Server misconfiguration' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
    [username, email, passwordHash]
  );
  const user = rows[0];

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    secret,
    { expiresIn: '7d' }
  );

  res.cookie('planner_session', token, cookieOptions);
  res.status(201).json({ user: { id: user.id, username: user.username, email: user.email } });
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const { rows } = await query(
    'SELECT id, username, email, password_hash FROM users WHERE username = $1',
    [username]
  );

  const user = rows[0];
  const INVALID = 'Invalid credentials';

  if (!user) {
    res.status(401).json({ error: INVALID });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: INVALID });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Server misconfiguration' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    secret,
    { expiresIn: '7d' }
  );

  res.cookie('planner_session', token, cookieOptions);
  res.json({ user: { id: user.id, username: user.username, email: user.email } });
});

authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  const { rows } = await query(
    'SELECT id, username, email FROM users WHERE id = $1',
    [req.user!.userId]
  );

  if (!rows[0]) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  res.json({ user: rows[0] });
});

authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('planner_session', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out' });
});
