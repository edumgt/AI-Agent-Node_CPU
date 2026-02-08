/**
 * 세션 저장소(SQLite)
 * - 메모리 기반 Map 대신 sqlite3 파일을 사용해 재시작 후에도 유지
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const SESSION_DB_PATH = process.env.SESSION_DB_PATH || path.join(__dirname, "../../../rag/session_store.db");

function sqlQuote(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function runSql(sql, json = false) {
  fs.mkdirSync(path.dirname(SESSION_DB_PATH), { recursive: true });
  const args = [SESSION_DB_PATH];
  if (json) args.unshift("-json");

  const proc = spawnSync("sqlite3", args, {
    input: sql,
    encoding: "utf-8",
  });

  if (proc.status !== 0) {
    throw new Error(proc.stderr || "sqlite3 failed");
  }
  return (proc.stdout || "").trim();
}

function init() {
  runSql(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS session_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      ts INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_session_messages_sid_ts ON session_messages(session_id, ts);
  `);
}

function get(id) {
  init();
  const raw = runSql(`
    SELECT role, content, ts
    FROM session_messages
    WHERE session_id = ${sqlQuote(id)}
    ORDER BY ts ASC, id ASC;
  `, true);
  return raw ? JSON.parse(raw) : [];
}

function append(id, msg) {
  init();
  const ts = Date.now();
  runSql(`
    INSERT INTO session_messages(session_id, role, content, ts)
    VALUES(${sqlQuote(id)}, ${sqlQuote(msg.role)}, ${sqlQuote(msg.content)}, ${ts});
  `);
}

module.exports = { get, append };
