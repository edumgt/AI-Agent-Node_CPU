const express = require("express");
const router = express.Router();

const { runAgent, runAgentStream } = require("../agent");
const store = require("../store/memoryStore");

router.post("/chat", async (req, res) => {
  const sessionId = req.body.sessionId || "default";
  const userText = String(req.body.message || "");
  const mode = req.body.mode || "local";

  const history = store.get(sessionId);
  const result = await runAgent({ sessionId, userText, history, mode });

  store.append(sessionId, { role: "user", content: userText });
  store.append(sessionId, { role: "assistant", content: result.text });

  res.json({ ok: true, sessionId, mode, ...result });
});

router.get("/sessions/:id", (req, res) => {
  res.json({ ok: true, sessionId: req.params.id, messages: store.get(req.params.id) });
});

router.post("/chat/stream", async (req, res) => {
  const sessionId = req.body.sessionId || "default";
  const userText = String(req.body.message || "");
  const mode = req.body.mode || "local";
  const history = store.get(sessionId);

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();

  store.append(sessionId, { role: "user", content: userText });

  try {
    await runAgentStream({
      sessionId,
      userText,
      history,
      mode,
      onEvent: (evt) => res.write(`data: ${JSON.stringify({ type: "event", evt })}\n\n`),
      onToken: (t) => res.write(`data: ${JSON.stringify({ type: "token", t })}\n\n`),
      onDone: (finalText) => {
        store.append(sessionId, { role: "assistant", content: finalText });
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();
      },
    });
  } catch (err) {
    const message = err?.message || "알 수 없는 서버 오류";
    res.write(`data: ${JSON.stringify({ type: "error", message })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  }
});

module.exports = router;
