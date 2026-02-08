const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const STORE_PATH = process.env.RAG_STORE_PATH || path.join(__dirname, "../../../rag/rag_store.db");

const SQLITE_HEADER = Buffer.from("SQLite format 3\u0000", "utf8");

function sqlQuote(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function withDb(handler) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  recoverNonSqliteFile(STORE_PATH);
  const db = new DatabaseSync(STORE_PATH);

  try {
    return handler(db);
  } finally {
    db.close();
  }
}

function recoverNonSqliteFile(storePath) {
  if (!fs.existsSync(storePath)) return;

  const stat = fs.statSync(storePath);
  if (!stat.isFile() || stat.size === 0) return;

  const fd = fs.openSync(storePath, "r");
  const header = Buffer.alloc(SQLITE_HEADER.length);
  fs.readSync(fd, header, 0, SQLITE_HEADER.length, 0);
  fs.closeSync(fd);

  if (header.compare(SQLITE_HEADER) === 0) return;

  const backupPath = `${storePath}.invalid-${Date.now()}`;
  fs.renameSync(storePath, backupPath);
  process.stderr.write(
    `[rag/store] Existing store was not a SQLite database. Moved to: ${backupPath}\n`
  );
}

function runSql(sql) {
  return withDb((db) => db.exec(sql));
}

function initStore() {
  runSql(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS rag_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rag_documents (
      id TEXT PRIMARY KEY,
      title TEXT,
      category TEXT,
      version TEXT,
      source_url TEXT,
      updated_at TEXT,
      file_path TEXT NOT NULL,
      ingested_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rag_chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      chunk_text TEXT NOT NULL,
      embedding_json TEXT NOT NULL,
      FOREIGN KEY(document_id) REFERENCES rag_documents(id)
    );

    CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc_id ON rag_chunks(document_id);
    CREATE INDEX IF NOT EXISTS idx_rag_documents_category ON rag_documents(category);
  `);
}

function clearStore() {
  runSql(`
    DELETE FROM rag_chunks;
    DELETE FROM rag_documents;
    DELETE FROM rag_meta;
  `);
}

function upsertMeta(meta) {
  const now = new Date().toISOString();
  const entries = {
    createdAt: meta.createdAt || now,
    embeddingModel: meta.embeddingModel || "",
    docDir: meta.docDir || "",
    schemaVersion: meta.schemaVersion || "v1",
  };

  withDb((db) => {
    const stmt = db.prepare(`
      INSERT INTO rag_meta(key, value)
      VALUES(?, ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value;
    `);

    for (const [key, value] of Object.entries(entries)) {
      stmt.run(key, value);
    }
  });
}

function insertDocument(doc) {
  withDb((db) => {
    db.prepare(`
      INSERT INTO rag_documents(id, title, category, version, source_url, updated_at, file_path, ingested_at)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?);
    `).run(
      doc.id,
      doc.title ?? null,
      doc.category ?? null,
      doc.version ?? null,
      doc.sourceUrl ?? null,
      doc.updatedAt ?? null,
      doc.filePath,
      doc.ingestedAt
    );
  });
}

function insertChunk(chunk) {
  withDb((db) => {
    db.prepare(`
      INSERT INTO rag_chunks(id, document_id, chunk_index, chunk_text, embedding_json)
      VALUES(?, ?, ?, ?, ?);
    `).run(
      chunk.id,
      chunk.documentId,
      Number(chunk.chunkIndex),
      chunk.chunkText,
      JSON.stringify(chunk.embedding)
    );
  });
}

function loadStore() {
  if (!fs.existsSync(STORE_PATH)) {
    return { meta: { createdAt: null, embeddingModel: null }, items: [] };
  }

  const { metaRows, chunkRows } = withDb((db) => ({
    metaRows: db.prepare("SELECT key, value FROM rag_meta;").all(),
    chunkRows: db.prepare(`
      SELECT c.id, c.chunk_text, c.embedding_json,
             d.id AS document_id, d.file_path, d.title, d.category, d.version, d.source_url, d.updated_at
      FROM rag_chunks c
      JOIN rag_documents d ON d.id = c.document_id;
    `).all(),
  }));

  const meta = metaRows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  const items = chunkRows.map((r) => ({
    id: r.id,
    source: r.file_path,
    chunk: r.chunk_text,
    embedding: JSON.parse(r.embedding_json),
    document: {
      id: r.document_id,
      title: r.title,
      category: r.category,
      version: r.version,
      sourceUrl: r.source_url,
      updatedAt: r.updated_at,
    },
  }));

  return { meta, items };
}

module.exports = {
  STORE_PATH,
  sqlQuote,
  initStore,
  clearStore,
  upsertMeta,
  insertDocument,
  insertChunk,
  loadStore,
};
