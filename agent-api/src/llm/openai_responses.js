/**
 * OpenAI Responses API 호출 (CommonJS + fetch)
 * - 키는 반드시 서버 환경변수(OPENAI_API_KEY)로만 보관
 * - 브라우저/FE에 키를 노출하면 안 됩니다.
 */
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

function requireKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  return key;
}

async function createResponse({ model, input, temperature = 0.2 }) {
  const key = requireKey();
  const url = `${OPENAI_BASE_URL}/responses`;

  const payload = {
    model,
    input,
    temperature,
  };

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
    throw new Error(`OpenAI error ${r.status}: ${txt}`);
  }

  const data = await r.json();
  const text = data.output_text || "";
  return { text, raw: data };
}

module.exports = { createResponse };
