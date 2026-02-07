/**
 * 세션별 메모리 저장소(in-memory)
 * - 학습용으로 단순화
 * - 운영에서는 Redis/DynamoDB/SQLite 등으로 교체 권장
 */
const sessions = new Map();

function get(id) {
  return sessions.get(id) || [];
}

function append(id, msg) {
  const arr = sessions.get(id) || [];
  arr.push({ ...msg, ts: Date.now() });
  sessions.set(id, arr);
}

module.exports = { get, append };
