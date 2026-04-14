import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pool, { query } from '../src/db';

const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations');

async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const { rows } = await query('SELECT filename FROM schema_migrations');
  const applied = new Set(rows.map((r: { filename: string }) => r.filename));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  skip  ${file}`);
      continue;
    }

    console.log(`  apply ${file}`);
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

    try {
      await query('BEGIN');
      await query(sql);
      await query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await query('COMMIT');
    } catch (err) {
      await query('ROLLBACK');
      console.error(`  ERROR in ${file}:`, err);
      process.exit(1);
    }
  }

  console.log('Migrations complete.');
  await pool.end();
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
