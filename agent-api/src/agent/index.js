const calculator = require("./tools/calculator");
const timeTool = require("./tools/time");
const httpGet = require("./tools/http_get");
const { createResponse } = require("../llm/openai_responses");
const { retrieveTopK } = require("../rag/retriever");

async function runAgent({ sessionId, userText, history, mode = "local" }) {
  if (mode === "openai" || mode === "openai_rag") {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    let ragContext = "";
    if (mode === "openai_rag") {
      const ret = await retrieveTopK({ query: userText, k: 4 });
      if (ret.ok && ret.contexts.length) {
        ragContext = ret.contexts
          .map((c, i) => {
            const meta = c.document || {};
            return `[#${i+1} source=${c.source} category=${meta.category || "unknown"} version=${meta.version || "n/a"} updatedAt=${meta.updatedAt || "n/a"} score=${c.score.toFixed(3)}]\n${c.chunk}`;
          })
          .join("\n\n---\n\n");
      } else {
        ragContext = "(RAG 컨텍스트 없음 - store가 비었거나 인덱싱 필요)";
      }
    }

    const sys = [
      "너는 사내 업무 보조 AI 에이전트다.",
      "가능하면 간단하고 정확하게 답한다.",
      "외부 키/비밀정보를 사용자에게 노출하지 않는다.",
      mode === "openai_rag"
        ? `아래는 참고할 수 있는 내부 문서 발췌다. 답변에 근거로 활용하고, 필요하면 출처 번호(#1 등)를 언급하라.\n\n${ragContext}`
        : "",
    ].filter(Boolean).join("\n\n");

    const recent = history.slice(-10).map(m => ({ role: m.role, content: m.content }));
    const input = [
      { role: "system", content: sys },
      ...recent,
      { role: "user", content: userText },
    ];

    const out = await createResponse({ model, input, temperature: 0.2 });
    return { text: out.text, provider: mode, model };
  }

  const lower = userText.toLowerCase();

  if (lower.includes("계산") || /[\d\+\-\*\/\(\)]/.test(userText)) {
    const out = calculator.exec({ input: userText });
    return { text: out.ok ? `계산 결과: ${out.result}` : `계산 실패: ${out.error}`, tool: "calculator", toolResult: out, provider: "local" };
  }

  if (lower.includes("시간") || lower.includes("now") || lower.includes("오늘")) {
    const out = timeTool.exec({ tz: "Asia/Seoul" });
    return { text: `현재 시간(KST): ${out.now}`, tool: "time", toolResult: out, provider: "local" };
  }

  if (/https?:\/\//i.test(userText)) {
    const out = await httpGet.exec({ urlText: userText });
    if (out.ok) return { text: `요약(상위 200자):\n${out.preview}`, tool: "http_get", toolResult: out, provider: "local" };
    return { text: `웹 요청 실패: ${out.error}`, tool: "http_get", toolResult: out, provider: "local" };
  }

  const last = history.slice(-6).map(m => `${m.role}: ${m.content}`).join("\n");
  return { text: `요청을 확인했어요.\n\n(최근 대화)\n${last || "(없음)"}\n\n질문: ${userText}`, provider: "local" };
}

async function runAgentStream({ sessionId, userText, history, mode, onEvent, onToken, onDone }) {
  if (onEvent) onEvent({ type: "agent_start", mode });

  const r = await runAgent({ sessionId, userText, history, mode });

  if (onEvent && r.tool) onEvent({ type: "tool_used", name: r.tool, ok: true });
  if (onEvent && r.model) onEvent({ type: "llm_used", model: r.model, provider: r.provider });

  for (const c of r.text.split("")) {
    onToken(c);
    await new Promise((x) => setTimeout(x, 4));
  }
  if (onEvent) onEvent({ type: "agent_done" });
  onDone(r.text);
}

module.exports = { runAgent, runAgentStream };
