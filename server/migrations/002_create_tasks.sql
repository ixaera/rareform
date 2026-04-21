CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  tags        TEXT[] NOT NULL DEFAULT '{}',
  goal_ids    INTEGER[] NOT NULL DEFAULT '{}',
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_user_date_idx ON tasks(user_id, date);
