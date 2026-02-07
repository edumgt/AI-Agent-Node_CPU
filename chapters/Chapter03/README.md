# Chapter03 - Agent Core 기초 (세션/메모리/히스토리)와 모듈화

## 목표
- “에이전트”의 기본 구성요소(세션/메모리/히스토리)를 이해하고 개선합니다.
- store를 in-memory에서 파일 기반으로 교체하는 포인트를 파악합니다.

## 연습 1) 세션별 히스토리 조회
```bash
curl -s http://localhost:8080/api/sessions/demo | jq
```

## 연습 2) 메모리 저장소 인터페이스화
- `store/memoryStore.js`를 `store/index.js`로 감싸서,
  나중에 Redis/SQLite로 바꾸기 쉽게 만듭니다.

### 예시 설계
- `get(sessionId): Message[]`
- `append(sessionId, message): void`

## 연습 3) 메모리 제한/정리(운영 관점)
- 세션당 최대 메시지 수 제한(예: 50개)
- 오래된 세션 TTL 적용(예: 24h)

## 체크포인트
- 동일 sessionId로 대화를 이어가면 맥락이 누적된다.

## 과제
- 메시지 저장 시 role/user/assistant 외에 `meta`(tool, latencyMs 등) 포함하도록 확장.

## AI 실무 확장 가이드
- 메모리 계층을 `interface -> implementation`으로 분리하면 교체 비용이 크게 줄어듭니다.
- 추천 정책:
  - 세션당 메시지 최대치
  - 사용자별 세션 최대치
  - TTL + 최근 접근 시간 기반 정리
- 개인정보/민감정보가 포함될 수 있으므로, 저장 전 마스킹/암호화 여부를 검토하세요.
