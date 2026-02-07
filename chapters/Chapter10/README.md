# Chapter10 - 캡스톤: CPU Agent 서비스 완성 (보안/비용/확장 포인트 포함)

## 목표
- 지금까지 만든 것을 “프로젝트 형태”로 정리하고, 확장 가능한 형태로 마무리합니다.

## 캡스톤 요구사항(권장)
1) FE
- 채팅 UI
- SSE 스트리밍
- 세션 히스토리 보기

2) API
- /health
- /api/chat, /api/chat/stream
- tool 이벤트(시작/종료/에러) 스트리밍

3) Agent
- 최소 3개 tool (calculator, time, http_get)
- 메모리 제한/정리(TTL 또는 최대 메시지 수)

4) 운영
- K8s Deployment/Service/HPA
- 리소스 requests/limits
- 간단 Runbook(장애 시 체크리스트)

## 문서화 산출물
- `docs/architecture.md` : 구성도/흐름
- `docs/runbook.md` : 장애 대응
- `docs/security.md` : allowlist/레이트리밋/입력 제한
- `docs/cost.md` : 리소스 제한/스케일 정책

## 체크포인트
- 로컬/컨테이너/EKS에서 모두 동작
- 운영 관점 문서가 존재

## 확장 아이디어
- LLM Adapter 추가(OpenAI 등)
- SQS 비동기 작업 큐(긴 작업 분리)
- DB/Redis 메모리 저장소
- 인증(JWT), 레이트리밋, WAF 연동

## 추가 과제: OpenAI 연동 + RAG 활성화
### 1) 서버에 OpenAI 키 설정(로컬)
```bash
cd agent-api
cp .env.example .env
# .env에 OPENAI_API_KEY 입력
node -r dotenv/config src/server.js
```

### 2) RAG 인덱싱(임베딩 생성)
```bash
cd agent-api
npm run rag:ingest
```
- 입력 문서: `rag/docs/*.md`
- 출력 스토어: `rag/rag_store.json`

### 3) FE에서 Provider 선택
- Local / OpenAI / OpenAI+RAG 중 선택
- OpenAI+RAG를 선택하면, 서버가 RAG 컨텍스트를 검색해 시스템 프롬프트에 주입합니다.

### 4) EKS 배포 시 GitHub Secret → K8s Secret 주입
- GitHub Secrets에 `OPENAI_API_KEY`를 저장
- Workflow에서 `kubectl create secret generic openai-secret ...`로 주입
- 서버는 `OPENAI_API_KEY`를 env로 받아 사용합니다.

## AI 실무 확장 가이드
- 캡스톤 완료 기준은 “동작”이 아니라 “운영 가능한 품질”입니다.
- 최종 점검 항목:
  - 보안: 키 관리/입력 검증/권한 최소화
  - 신뢰성: timeout/retry/fallback
  - 비용: 토큰/CPU 사용량 추적
  - 문서: runbook, 장애 시나리오, 배포/롤백 절차
- 권장 데모 시나리오:
  - 정상 응답
  - tool timeout
  - allowlist 차단
  - RAG 미적중(근거 없음 안내)
