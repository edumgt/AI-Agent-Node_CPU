/**
 * OpenAI Responses API 호출 (CommonJS + fetch)
 * - 키는 반드시 서버 환경변수(OPENAI_API_KEY)로만 보관
 */
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

function requireKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  return key;
}

function extractTextFromResponses(data) {
  // 1) 편의 필드가 있으면 우선 사용
  if (typeof data.output_text === "string" && data.output_text.trim().length > 0) {
    return data.output_text;
  }

  // 2) 표준 출력 구조에서 content를 순회하며 텍스트 수집
  // data.output: [{ content: [{ type: "output_text", text: "..." }, ...] }, ...]
  const out = data.output;
  if (!Array.isArray(out)) return "";

  let text = "";
  for (const item of out) {
    const contents = item && Array.isArray(item.content) ? item.content : [];
    for (const c of contents) {
      if (c?.type === "output_text" && typeof c.text === "string") text += c.text;
      // 혹시 다른 형태가 오면 여기서 확장 가능
      if (!c?.type && typeof c?.text === "string") text += c.text;
    }
  }
  return text.trim();
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

  const rawText = await r.text();
  if (!r.ok) {
    throw new Error(`OpenAI error ${r.status}: ${rawText}`);
  }

  const data = JSON.parse(rawText);
  const text = extractTextFromResponses(data);

  // ✅ 텍스트가 비면 원인 파악을 위해 최소한의 메시지라도 반환
  return { text: text || "(모델 응답 텍스트를 추출하지 못했습니다. 서버 로그로 raw 응답 확인 필요)", raw: data };
}

module.exports = { createResponse };
