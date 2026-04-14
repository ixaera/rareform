import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool, { query } from '../src/db';

async function seed() {
  const password = process.env.SEED_PASSWORD || 'testpassword123';
  const hash = await bcrypt.hash(password, 12);

  await query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (username) DO NOTHING`,
    ['testuser', 'test@rareform.dev', hash]
  );

  console.log('Seed complete. Test user: testuser / ' + password);
  await pool.end();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
