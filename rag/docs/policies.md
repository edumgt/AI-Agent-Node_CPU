---
title: 보안/비용 가드레일
category: governance
version: 1.2.0
source_url: internal://ai-platform/security-cost-policy
updated_at: 2026-02-08
---

# 내부 문서 샘플: 보안/비용 가드레일

## 보안
- API Key는 서버에서만 사용한다.
- 외부 호출 도구는 allowlist로 제한한다.
- 요청 크기/빈도를 제한한다.

## 비용
- EKS 리소스 requests/limits를 설정한다.
- HPA는 CPU 기반으로 시작하고, 과도한 스케일을 막기 위해 maxReplicas를 낮게 둔다.
- 로그는 구조화(JSON)하고 과다 출력(토큰 스트리밍 로그 등)을 피한다.
