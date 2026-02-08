const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const STORE_PATH = process.env.RAG_STORE_PATH || path.join(__dirname, "../../../rag/rag_store.db");

function sqlQuote(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function runSql(sql, opts = {}) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  const args = [STORE_PATH];
  if (opts.json) args.unshift("-json");

  const proc = spawnSync("sqlite3", args, {
    input: sql,
    encoding: "utf-8",
  });

  if (proc.status !== 0) {
    throw new Error(proc.stderr || "sqlite3 command failed");
  }

  return (proc.stdout || "").trim();
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

  const sql = Object.entries(entries)
    .map(([k, v]) => `INSERT INTO rag_meta(key, value) VALUES(${sqlQuote(k)}, ${sqlQuote(v)}) ON CONFLICT(key) DO UPDATE SET value=excluded.value;`)
    .join("\n");
  runSql(sql);
}

function insertDocument(doc) {
  runSql(`
    INSERT INTO rag_documents(id, title, category, version, source_url, updated_at, file_path, ingested_at)
    VALUES(
      ${sqlQuote(doc.id)},
      ${sqlQuote(doc.title)},
      ${sqlQuote(doc.category)},
      ${sqlQuote(doc.version)},
      ${sqlQuote(doc.sourceUrl)},
      ${sqlQuote(doc.updatedAt)},
      ${sqlQuote(doc.filePath)},
      ${sqlQuote(doc.ingestedAt)}
    );
  `);
}

function insertChunk(chunk) {
  runSql(`
    INSERT INTO rag_chunks(id, document_id, chunk_index, chunk_text, embedding_json)
    VALUES(
      ${sqlQuote(chunk.id)},
      ${sqlQuote(chunk.documentId)},
      ${Number(chunk.chunkIndex)},
      ${sqlQuote(chunk.chunkText)},
      ${sqlQuote(JSON.stringify(chunk.embedding))}
    );
  `);
}

function loadStore() {
  if (!fs.existsSync(STORE_PATH)) {
    return { meta: { createdAt: null, embeddingModel: null }, items: [] };
  }

  const metaRowsRaw = runSql("SELECT key, value FROM rag_meta;", { json: true });
  const chunkRowsRaw = runSql(`
    SELECT c.id, c.chunk_text, c.embedding_json,
           d.id AS document_id, d.file_path, d.title, d.category, d.version, d.source_url, d.updated_at
    FROM rag_chunks c
    JOIN rag_documents d ON d.id = c.document_id;
  `, { json: true });

  const metaRows = metaRowsRaw ? JSON.parse(metaRowsRaw) : [];
  const chunkRows = chunkRowsRaw ? JSON.parse(chunkRowsRaw) : [];

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
