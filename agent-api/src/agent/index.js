const calculator = require("./tools/calculator");
const timeTool = require("./tools/time");
const httpGet = require("./tools/http_get");

/**
 * 아주 단순한 “에이전트 라우터”:
 * - LLM이 없어도 "툴 선택 → 실행 → 결과 요약" 흐름만 있으면 에이전트 느낌을 낼 수 있습니다.
 * - 추후 LLM을 붙일 때는 여기의 라우팅을 "LLM이 tool schema를 보고 결정"하도록 교체하면 됩니다.
 */
async function runAgent({ sessionId, userText, history }) {
  const lower = userText.toLowerCase();

  // tool 선택 (룰 기반 데모)
  if (lower.includes("계산") || /[\d\+\-\*\/\(\)]/.test(userText)) {
    const out = calculator.exec({ input: userText });
    return { text: out.ok ? `계산 결과: ${out.result}` : `계산 실패: ${out.error}`, tool: "calculator", toolResult: out };
  }

  if (lower.includes("시간") || lower.includes("now") || lower.includes("오늘")) {
    const out = timeTool.exec({ tz: "Asia/Seoul" });
    return { text: `현재 시간(KST): ${out.now}`, tool: "time", toolResult: out };
  }

  // URL 포함 시: 안전한 http GET (allowlist)
  if (/https?:\/\//i.test(userText)) {
    const out = await httpGet.exec({ urlText: userText });
    if (out.ok) return { text: `요약(상위 200자):\n${out.preview}`, tool: "http_get", toolResult: out };
    return { text: `웹 요청 실패: ${out.error}`, tool: "http_get", toolResult: out };
  }

  // 기본 응답(추후 LLM 붙일 자리)
  const last = history.slice(-6).map(m => `${m.role}: ${m.content}`).join("\n");
  return { text: `요청을 확인했어요.\n\n(최근 대화)\n${last || "(없음)"}\n\n질문: ${userText}` };
}

async function runAgentStream({ sessionId, userText, history, onToken, onDone }) {
  const r = await runAgent({ sessionId, userText, history });

  // 토큰처럼 쪼개서 전송
  const chunks = r.text.split("");
  for (const c of chunks) {
    onToken(c);
    await new Promise((x) => setTimeout(x, 6));
  }
  onDone(r.text);
}

module.exports = { runAgent, runAgentStream };
