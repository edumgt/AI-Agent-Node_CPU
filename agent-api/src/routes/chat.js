const express = require("express");
const router = express.Router();

const { runAgent, runAgentStream } = require("../agent");
const store = require("../store/memoryStore");

router.post("/chat", async (req, res) => {
  const sessionId = req.body.sessionId || "default";
  const userText = String(req.body.message || "");

  const history = store.get(sessionId);
  const result = await runAgent({ sessionId, userText, history });

  store.append(sessionId, { role: "user", content: userText });
  store.append(sessionId, { role: "assistant", content: result.text });

  res.json({ ok: true, sessionId, ...result });
});

router.get("/sessions/:id", (req, res) => {
  res.json({ ok: true, sessionId: req.params.id, messages: store.get(req.params.id) });
});

// SSE 스트리밍
router.post("/chat/stream", async (req, res) => {
  const sessionId = req.body.sessionId || "default";
  const userText = String(req.body.message || "");
  const history = store.get(sessionId);

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();

  store.append(sessionId, { role: "user", content: userText });

  await runAgentStream({
    sessionId,
    userText,
    history,
    onToken: (t) => res.write(`data: ${JSON.stringify({ t })}\n\n`),
    onDone: (finalText) => {
      store.append(sessionId, { role: "assistant", content: finalText });
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    },
  });
});

module.exports = router;
