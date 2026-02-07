/**
 * 매우 단순한 HTTP GET 도구 (Node 18+ fetch 사용)
 * - 보안상 allowlist 도메인만 허용하는 방식 권장
 * - 데모에서는 example.com / httpbin.org 만 허용
 */
const ALLOWLIST = new Set(["example.com", "httpbin.org"]);

function extractUrl(text) {
  const m = String(text).match(/https?:\/\/[^\s]+/i);
  return m ? m[0] : null;
}

function hostnameOf(url) {
  try { return new URL(url).hostname; } catch { return null; }
}

async function exec({ urlText }) {
  const url = extractUrl(urlText);
  if (!url) return { ok: false, error: "URL을 찾지 못했습니다." };

  const host = hostnameOf(url);
  if (!host) return { ok: false, error: "URL 파싱 실패" };
  if (!ALLOWLIST.has(host)) {
    return { ok: false, error: `허용되지 않은 도메인입니다: ${host} (allowlist: ${Array.from(ALLOWLIST).join(", ")})` };
  }

  try {
    const r = await fetch(url, { method: "GET" });
    const txt = await r.text();
    const preview = txt.slice(0, 200);
    return { ok: true, url, status: r.status, preview };
  } catch (e) {
    return { ok: false, error: "네트워크 오류" };
  }
}

module.exports = { exec };
