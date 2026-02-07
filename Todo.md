# AI 관련 IPCC, AICC 정리

AI/컨택센터 문맥에서 **IPCC**, **AICC**는 주로 콜센터(컨택센터) 분야 약어로 쓰입니다. 다만 문맥에 따라 의미가 달라질 수 있어, 현업에서 가장 흔한 의미를 기준으로 정리합니다.

---

## 1) IPCC (대부분: IP Contact Center)

- **IPCC = IP 기반 컨택센터(콜센터)** 를 뜻하는 경우가 많습니다.  
  전화/상담 시스템이 **IP(VoIP) 네트워크 기반**으로 동작하면서, 콜 라우팅(분배), CTI(컴퓨터-전화 연동), 멀티채널(음성/이메일/채팅 등) 처리를 하는 형태입니다.
- 예: Cisco 문서에서도 **Cisco IP Contact Center (IPCC)** 라는 이름으로 IP 기반 콜센터/컨택센터 아키텍처를 설명합니다.

**참고**
- Cisco IP Contact Center (IPCC) 관련 문서: https://www.cisco.com/web/AP/uc/assets/docs/cipcc.pdf

---

## 2) AICC (AI 문맥에서 대부분: AI Contact Center)

- 한국/기업 IT 문서에서 **AICC = AI Contact Center(인공지능 컨택센터)** 로 가장 흔하게 씁니다.  
  핵심은 **기존 컨택센터에 AI를 적용해 자동화/지능화**하는 것입니다.

대표 기능 예시:
- 음성인식(STT)으로 상담 내용 실시간 텍스트화
- 챗봇/보이스봇으로 1차 응대 자동화
- 상담 요약, 답변 추천, 감정/이슈 분류, 품질 모니터링 등 상담사 Assist
- 옴니채널(전화/채팅/메신저/이메일) 통합

**참고**
- Genesys AI Contact Center 소개: https://www.genesys.com/ko-kr/ai-contact-center

---

## 3) 둘의 관계 (현업 감각)

- **IPCC = 컨택센터의 ‘통신/인프라 기반(IP)’ 중심 용어**
- **AICC = 그 컨택센터 위에 ‘AI 기능’을 본격 적용한 진화형 개념**

즉, **IPCC(기반) → AICC(AI 고도화)** 처럼 함께 엮여 쓰이는 경우가 많습니다.

---

## 4) 헷갈림 주의: AICC는 e‑Learning 표준 의미도 있음

AI/콜센터가 아니라 교육/LMS 문서에서는  
**AICC = Aviation Industry CBT Committee**(이러닝 콘텐츠 표준) 의미로도 많이 쓰입니다.

- AICC(e-learning) glossary 예시: https://www.iseazy.com/glossary/aicc/

---

## 문맥 판별 팁

- 문서에 **컨택센터/상담/콜/IVR/CTI/보이스봇** 등이 나오면 → 보통 **IPCC / AI Contact Center(AICC)**
- 문서에 **LMS/SCORM/xAPI/콘텐츠 표준** 등이 나오면 → **Aviation Industry CBT Committee(AICC)**

---

# AI Agent 실무 적용 Todo

이 문서는 본 프로젝트를 학습용에서 **실무 운영 수준**으로 발전시키기 위한 우선순위 작업 목록입니다.

## 1) 보안(Security)
- [ ] OpenAI/API Key를 K8s Secret + IRSA 기반으로 관리하고, 평문 `.env` 의존도를 제거한다.
- [ ] Tool 입력 JSON Schema 검증을 강제하고, 검증 실패 시 표준 에러 코드를 반환한다.
- [ ] `http_get` 도구에 allowlist + 최대 응답 크기 + timeout(기본 3~5초) 정책을 적용한다.
- [ ] 요청 본문/프롬프트 길이 제한(예: 8KB)과 레이트 리밋(사용자/IP 단위)을 설정한다.
- [ ] 보안 로그(차단 이벤트, 인증 실패, 비정상 트래픽)를 대시보드로 시각화한다.

## 2) 신뢰성(Reliability)
- [ ] SSE 이벤트 표준(`token/tool_start/tool_end/done/error`)을 문서화하고 서버/FE를 동기화한다.
- [ ] 외부 API/LLM 호출에 retry(backoff) + circuit breaker를 도입한다.
- [ ] 세션 메모리에 TTL/최대 개수 제한을 적용하고, eviction 전략을 명시한다.
- [ ] 장애 시 fallback 응답(예: “잠시 후 다시 시도”) 정책을 구현한다.
- [ ] 배포 파이프라인에 자동 롤백 기준(에러율, readiness 실패율)을 추가한다.

## 3) 관측성(Observability)
- [ ] 요청 단위 `requestId`/`sessionId`/`userId(가능 시)`를 구조화 로그에 포함한다.
- [ ] 핵심 지표를 수집한다: p50/p95 latency, error rate, tool timeout rate.
- [ ] `/metrics`(Prometheus 형식) 또는 CloudWatch EMF를 도입한다.
- [ ] 에러를 분류한다: 사용자 입력 오류, 도구 오류, 모델 오류, 인프라 오류.
- [ ] 운영 알림 정책(경고/치명)을 분리하고 노이즈 필터를 설정한다.

## 4) 품질(Quality)
- [ ] 핵심 API E2E 테스트(`/health`, `/api/chat`, `/api/chat/stream`)를 자동화한다.
- [ ] Tool 단위 테스트(성공/실패/timeout/allowlist 위반)를 작성한다.
- [ ] 프롬프트 회귀 테스트(대표 질문 세트 + 기대 규칙)를 구성한다.
- [ ] PR 단계에서 lint/test/security scan이 모두 통과해야 머지되도록 설정한다.
- [ ] 문서 변경 시 체크리스트(환경, 배포, 장애 대응)가 최신 상태인지 검증한다.

## 5) 비용 최적화(Cost)
- [ ] K8s requests/limits를 트래픽 패턴 기반으로 재설정한다.
- [ ] HPA 스케일 정책(min/max, cooldown)을 서비스 특성에 맞게 튜닝한다.
- [ ] 대화 히스토리 저장량을 제어해 메모리/스토리지 비용을 낮춘다.
- [ ] 모델/도구 호출량 대시보드를 만들고 월간 비용 리포트를 자동화한다.
- [ ] 고비용 경로(긴 프롬프트, 과도한 재시도)를 탐지해 개선한다.

## 6) RAG 고도화(RAG Maturity)
- [ ] 문서 수집 파이프라인(버전, 출처, 갱신일)을 표준화한다.
- [ ] chunk 전략(길이/겹침/메타데이터)을 A/B 테스트로 최적화한다.
- [ ] 검색 품질 지표(hit@k, 정답 포함률)를 주기적으로 측정한다.
- [ ] “근거 문서 출처 표시(citation)”를 응답 UI에 노출한다.
- [ ] RAG 미적중 시 안전한 fallback 응답 정책을 정의한다.

## 7) 운영 Runbook
- [ ] 장애 유형별 1차 점검 순서(네트워크/Secret/Pod/HPA/외부 API)를 문서화한다.
- [ ] 롤백 절차(직전 이미지 태그/manifest)와 책임자를 명시한다.
- [ ] 온콜 핸드오프 템플릿(현상/영향/가설/조치/남은 리스크)을 작성한다.
- [ ] 주요 장애 시나리오 게임데이(분기 1회)를 운영한다.

## 권장 우선순위(첫 2주)
1. 보안: Secret/allowlist/input 제한
2. 신뢰성: timeout/retry/SSE 에러 처리
3. 관측성: requestId + latency/error 대시보드
4. 품질: 핵심 API E2E 자동화
