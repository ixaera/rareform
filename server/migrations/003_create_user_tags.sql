CREATE TABLE IF NOT EXISTS user_tags (
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  PRIMARY KEY (user_id, name)
);
