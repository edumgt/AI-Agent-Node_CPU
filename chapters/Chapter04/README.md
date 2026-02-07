# Chapter04 - Tool Calling 설계 (스키마, 타임아웃, 안전장치)

## 목표
- “도구 호출”이 에이전트의 핵심임을 이해하고, 안전하게 설계합니다.
- 입력 검증과 allowlist 같은 보안 기본기를 적용합니다.

## 연습 1) Tool 표준 스키마 정의
모든 tool은 아래 형태를 따르도록 통일합니다.
- name
- description
- inputSchema(문서화)
- exec(input) → output

## 연습 2) http_get 도구 allowlist 확장
현재 allowlist: `example.com`, `httpbin.org`
- 필요한 도메인을 추가하되, 무분별한 외부 호출은 금지(운영 위험)

## 연습 3) 타임아웃 적용
`fetch`에 AbortController를 적용해 3~5초 타임아웃을 넣습니다.

## 연습 4) 계산기 보안 강화(선택)
현재는 Function으로 계산합니다(데모).
- 운영에서는 안전한 parser 라이브러리 또는 직접 파서 구현 권장.

## 체크포인트
- URL이 allowlist 밖이면 차단된다.
- 느린 응답은 타임아웃으로 끊어진다.

## 과제
- `tools/`에 `uuid`, `text_summary`(단순 규칙 기반) 같은 도구 2개 추가.
