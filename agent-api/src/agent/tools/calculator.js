function exec({ input }) {
  // 데모 수준의 안전장치: 숫자/연산자만 남김
  const expr = String(input).replace(/[^0-9\+\-\*\/\(\)\.\s]/g, "");
  if (!expr.trim()) return { ok: false, result: null, error: "수식이 없습니다." };

  try {
    // eslint-disable-next-line no-new-func
    const v = Function(`"use strict"; return (${expr});`)();
    return { ok: true, result: v };
  } catch (e) {
    return { ok: false, result: null, error: "유효하지 않은 수식입니다." };
  }
}

module.exports = { exec };
