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
    date TEXT,
    time TEXT,
    location TEXT,
    type TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`)

export default db