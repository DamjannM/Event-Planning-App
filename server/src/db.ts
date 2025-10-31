import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(":memory:");

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  )
`)

db.exec(`
  CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    title VARCHAR(20),
    timestamp INTEGER,
    location TEXT,
    type TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`)

db.exec(`
  CREATE TABLE event_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  role TEXT CHECK(role IN ('creator', 'visitor')) NOT NULL,
  status TEXT DEFAULT 'pending'
  )
`)

export default db