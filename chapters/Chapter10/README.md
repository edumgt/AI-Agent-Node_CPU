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
