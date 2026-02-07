# Chapter05 - 스트리밍(SSE) 고도화 + 프론트 UX 개선

## 목표
- SSE로 “토큰 단위 스트리밍”을 자연스럽게 만들고 UX를 개선합니다.
- 중간 이벤트(툴 실행 시작/종료)를 프론트에 표시합니다.

## 연습 1) 이벤트 타입 분리
SSE data payload에 타입을 포함합니다.
- `{type:"token", t:"..."}`
- `{type:"tool_start", name:"calculator"}`
- `{type:"tool_end", name:"calculator", ok:true}`

## 연습 2) FE 렌더링 개선
- 툴 실행 중 스피너/상태 출력
- Enter 전송, Shift+Enter 줄바꿈(선택)

## 연습 3) 에러 처리
- 네트워크 오류/타임아웃 시 사용자 메시지 표시

## 체크포인트
- “툴 실행 중…” 같은 상태가 채팅에 보인다.

## 과제
- 채팅 로그를 LocalStorage에 캐시하고 새로고침해도 유지.
