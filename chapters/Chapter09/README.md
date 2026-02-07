# Chapter09 - 운영 관측/로그/알림 기본 (구조화 로그, CloudWatch, 장애 대응)

## 목표
- “서비스형 AI”에서 운영이 왜 중요한지 체감합니다.
- 로그/지표/에러 대응 루틴을 갖춥니다.

## 연습 1) 구조화 로그(JSON) 강화
- 요청 단위 requestId 생성(간단 UUID)
- 주요 이벤트 기록: tool 선택/실행시간/실패 사유

## 연습 2) 장애 상황 시나리오
- allowlist 밖 URL 요청 → 차단 로그 확인
- 타임아웃 발생 → 에러 응답/로그 확인

## 연습 3) 알림(선택)
- 에러율 증가/파드 재시작 증가 시 알림(CloudWatch Alarm)

## 체크포인트
- 문제 발생 시 “왜 실패했는지” 로그로 추적 가능

## 과제
- `/metrics` 엔드포인트(간단 카운터/지연시간)를 만들어보거나,
  CloudWatch Embedded Metric Format 적용(선택).

## AI 실무 확장 가이드
- AI 서비스 운영의 핵심은 “설명 가능한 실패”입니다.
- 관측 기본 세트:
  - requestId, sessionId, model/provider, tool latency
  - 사용자 오류 vs 시스템 오류 분류
  - SLO 관점 지표(p95 latency, error rate)
- 알림은 노이즈를 줄이기 위해 임계값/지속시간 조건을 함께 사용하세요.
