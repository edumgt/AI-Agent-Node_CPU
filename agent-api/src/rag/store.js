const fs = require("fs");
const path = require("path");

const STORE_PATH = process.env.RAG_STORE_PATH || path.join(__dirname, "../../rag/rag_store.json");

function loadStore() {
  if (!fs.existsSync(STORE_PATH)) {
    return { meta: { createdAt: null, embeddingModel: null }, items: [] };
  }
  const raw = fs.readFileSync(STORE_PATH, "utf-8");
  return JSON.parse(raw);
}

function saveStore(store) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

module.exports = { STORE_PATH, loadStore, saveStore };
