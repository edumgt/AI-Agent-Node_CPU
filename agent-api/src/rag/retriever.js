const { loadStore } = require("./store");
const { embedText } = require("../llm/openai_embeddings");

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const x = a[i], y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

async function retrieveTopK({ query, k = 4 }) {
  const store = loadStore();
  if (!store.items || store.items.length === 0) {
    return { ok: false, contexts: [], reason: "RAG store is empty. 먼저 rag:ingest 실행이 필요합니다." };
  }

  const embModel = process.env.OPENAI_EMBEDDING_MODEL || store.meta.embeddingModel || "text-embedding-3-small";
  const embData = await embedText({ model: embModel, input: query });
  const qVec = embData[0].embedding;

  const scored = store.items.map((it) => ({
    ...it,
    score: cosine(qVec, it.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, k).map(({ id, source, chunk, score }) => ({ id, source, chunk, score }));

  return { ok: true, contexts: top, embeddingModel: embModel };
}

module.exports = { retrieveTopK };
