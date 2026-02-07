/**
 * OpenAI Embeddings API 호출 (CommonJS + fetch)
 */
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

function requireKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  return key;
}

async function embedText({ model, input }) {
  const key = requireKey();
  const url = `${OPENAI_BASE_URL}/embeddings`;

  const payload = { model, input };

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`OpenAI embeddings error ${r.status}: ${txt}`);
  }

  const data = await r.json();
  return data.data;
}

module.exports = { embedText };
