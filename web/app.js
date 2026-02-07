const chat = document.getElementById("chat");
const form = document.getElementById("form");
const msg = document.getElementById("msg");

const sessionId = "demo";
const API_BASE = "http://localhost:8080";

function add(role, text) {
  const el = document.createElement("div");
  el.className = `m ${role}`;
  el.textContent = `${role}: ${text}`;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
  return el;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = msg.value.trim();
  if (!text) return;
  msg.value = "";

  add("user", text);
  const botEl = add("assistant", "");

  const r = await fetch(`${API_BASE}/api/chat/stream`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId, message: text }),
  });

  const reader = r.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buf = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const parts = buf.split("\n\n");
    buf = parts.pop();

    for (const p of parts) {
      const line = p.split("\n").find(x => x.startsWith("data: "));
      if (!line) continue;
      const payload = JSON.parse(line.slice(6));
      if (payload.t) botEl.textContent += payload.t;
    }
  }
});
