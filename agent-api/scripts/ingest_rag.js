/**
 * RAG 문서 인덱싱(임베딩 생성 + 로컬 스토어 저장)
 * - 입력: project-root/rag/docs/*.md (기본)
 * - 출력: project-root/rag/rag_store.json
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
const { saveStore } = require("../src/rag/store");

const DOC_DIR = process.env.RAG_DOC_DIR || path.join(__dirname, "../../rag/docs");
const EMB_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const CHUNK_SIZE = Number(process.env.RAG_CHUNK_SIZE || 800);   // chars
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

async function main() {
  if (!fs.existsSync(DOC_DIR)) {
    console.error(`DOC_DIR not found: ${DOC_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(DOC_DIR).filter(f => f.endsWith(".md"));
  if (files.length === 0) {
    console.error(`No .md files in ${DOC_DIR}`);
    process.exit(1);
  }

  const items = [];
  for (const f of files) {
    const p = path.join(DOC_DIR, f);
    const text = fs.readFileSync(p, "utf-8");
    const chunks = chunkText(text);

    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx].trim();
      if (!chunk) continue;

      const embData = await embedText({ model: EMB_MODEL, input: chunk });
      const embedding = embData[0].embedding;

      items.push({
        id: sha1(`${f}:${idx}:${chunk.slice(0, 50)}`),
        source: f,
        chunk,
        embedding,
      });

      process.stdout.write(`Indexed ${f} [${idx+1}/${chunks.length}]\n`);
    }
  }

  const store = {
    meta: { createdAt: new Date().toISOString(), embeddingModel: EMB_MODEL, docDir: DOC_DIR },
    items,
  };
  saveStore(store);
  console.log(`\nSaved store with ${items.length} chunks.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
