# Chapter02 - 프로젝트 구조 이해 + 로컬 실행 (Express API + Vanilla FE)

## 목표
- Express API를 로컬에서 실행하고, 바닐라 JS FE에서 호출해 봅니다.
- SSE 스트리밍 응답을 확인합니다.

## 연습 1) 의존성 설치 및 실행
```bash
cd agent-api
npm i
npm run dev
```
다른 터미널에서:
```bash
curl -s http://localhost:8080/health | jq
```

## 연습 2) 일반 채팅 호출
```bash
curl -s http://localhost:8080/api/chat \
  -H 'content-type: application/json' \
  -d '{"sessionId":"demo","message":"12*(3+4) 계산해줘"}' | jq
```

## 연습 3) SSE 스트리밍 테스트(브라우저)
- `web/index.html`을 브라우저에서 열고 메시지 전송
- 개발자도구(Network)에서 event-stream 확인

## 체크포인트
- `/health` OK
- `/api/chat` 응답 OK
- `/api/chat/stream`에서 글자가 “타자 치듯” 출력

## 과제
- FE에서 API_BASE를 환경에 맞게 바꿀 수 있도록 간단한 입력창(옵션) 추가.
