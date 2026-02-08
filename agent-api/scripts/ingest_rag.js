/**
 * RAG 문서 인덱싱(임베딩 생성 + SQLite 저장)
 * - 입력: project-root/rag/docs/*.md + rag/docs/manifest.json
 * - 출력: project-root/rag/rag_store.db
 *
 * 실행:
 *   cd agent-api
 *   npm run rag:ingest
 *
 * 필요:
 *   OPENAI_API_KEY 환경변수
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { embedText } = require("../src/llm/openai_embeddings");
const {
  initStore,
  clearStore,
  upsertMeta,
  insertDocument,
  insertChunk,
} = require("../src/rag/store");

const DOC_DIR = process.env.RAG_DOC_DIR || path.join(__dirname, "../../rag/docs");
const MANIFEST_PATH = process.env.RAG_MANIFEST_PATH || path.join(DOC_DIR, "manifest.json");
const EMB_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const CHUNK_SIZE = Number(process.env.RAG_CHUNK_SIZE || 800);
const CHUNK_OVERLAP = Number(process.env.RAG_CHUNK_OVERLAP || 120);

function chunkText(text) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(text.length, i + CHUNK_SIZE);
    const chunk = text.slice(i, end);
    chunks.push(chunk);
    i = end - CHUNK_OVERLAP;
    if (i < 0) i = 0;
    if (end === text.length) break;
  }
  return chunks;
}

function sha1(s) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

function parseFrontMatter(raw) {
  if (!raw.startsWith("---\n")) return { metadata: {}, body: raw };
  const end = raw.indexOf("\n---\n", 4);
  if (end < 0) return { metadata: {}, body: raw };

  const fm = raw.slice(4, end).trim();
  const body = raw.slice(end + 5);
  const metadata = {};

  for (const line of fm.split("\n")) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    metadata[key] = value;
  }

  return { metadata, body };
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifest file not found: ${MANIFEST_PATH}`);
  }

  const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  if (!parsed.documents || !Array.isArray(parsed.documents)) {
    throw new Error("Manifest must include a documents array.");
  }

  const map = new Map();
  for (const doc of parsed.documents) {
    map.set(doc.file, doc);
  }
  return map;
}

function ensureDocMetadata({ file, frontMatter, manifestMeta }) {
  const merged = {
    title: frontMatter.title || manifestMeta?.title || file,
    category: frontMatter.category || manifestMeta?.category,
    version: frontMatter.version || manifestMeta?.version,
    sourceUrl: frontMatter.source_url || manifestMeta?.sourceUrl,
    updatedAt: frontMatter.updated_at || manifestMeta?.updatedAt,
  };

  const missing = ["category", "version", "sourceUrl", "updatedAt"].filter((k) => !merged[k]);
  if (missing.length) {
    throw new Error(`${file}: missing required metadata fields (${missing.join(", ")})`);
  }

  return merged;
}

async function main() {
  if (!fs.existsSync(DOC_DIR)) {
    console.error(`DOC_DIR not found: ${DOC_DIR}`);
    process.exit(1);
  }

  const manifestMap = loadManifest();
  const files = fs.readdirSync(DOC_DIR).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    console.error(`No .md files in ${DOC_DIR}`);
    process.exit(1);
  }

  initStore();
  clearStore();

  let chunkCount = 0;
  const now = new Date().toISOString();

  for (const f of files) {
    const p = path.join(DOC_DIR, f);
    const raw = fs.readFileSync(p, "utf-8");
    const { metadata: frontMatter, body } = parseFrontMatter(raw);
    const docMeta = ensureDocMetadata({ file: f, frontMatter, manifestMeta: manifestMap.get(f) });

    const documentId = sha1(`doc:${f}:${docMeta.version}`);

    insertDocument({
      id: documentId,
      title: docMeta.title,
      category: docMeta.category,
      version: docMeta.version,
      sourceUrl: docMeta.sourceUrl,
      updatedAt: docMeta.updatedAt,
      filePath: f,
      ingestedAt: now,
    });

    const chunks = chunkText(body);
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx].trim();
      if (!chunk) continue;

      const embData = await embedText({ model: EMB_MODEL, input: chunk });
      const embedding = embData[0].embedding;
      const chunkId = sha1(`${documentId}:${idx}:${chunk.slice(0, 50)}`);

      insertChunk({
        id: chunkId,
        documentId,
        chunkIndex: idx,
        chunkText: chunk,
        embedding,
      });

      chunkCount += 1;
      process.stdout.write(`Indexed ${f} [${idx + 1}/${chunks.length}]\n`);
    }
  }

  upsertMeta({
    createdAt: now,
    embeddingModel: EMB_MODEL,
    docDir: DOC_DIR,
    schemaVersion: "rag.sqlite.v1",
  });

  console.log(`\nSaved SQLite store with ${chunkCount} chunks.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
