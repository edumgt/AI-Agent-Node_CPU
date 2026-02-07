function exec({ tz }) {
  const now = new Date().toLocaleString("ko-KR", { timeZone: tz });
  return { ok: true, now, tz };
}

module.exports = { exec };
