# CPU Agent Service (WSL + Express + Vanilla JS + EKS CPU)

이 프로젝트는 **GPU 없이 CPU 환경**에서 “AI Agent 성격”의 모듈을 **Express API**로 서빙하고,
프론트엔드는 **바닐라 JS**로 구성하며, **EKS(쿠버네티스)**에 배포까지 진행하는 학습용/실무형 템플릿입니다.

- 개발환경: WSL(권장), Node.js, Docker, AWS CLI, eksctl, kubectl
- 실행형태: 로컬 실행 → 도커 이미지 → (선택) ECR → EKS 배포(HPA 포함)
- Agent 형태: Tool Calling + Memory + Streaming(SSE) 기반 (LLM은 어댑터로 교체 가능)

## 빠른 시작 (로컬)
```bash
cd agent-api
npm i
npm run dev
```

브라우저에서 `web/index.html` 열고 테스트하세요.

## 폴더 구조
- `agent-api/` : Express API + Agent Core
- `web/` : 바닐라 JS FE (SSE 스트리밍)
- `k8s/` : EKS 배포 매니페스트(Deployment/Service/HPA)
- `chapters/` : Chapter1~10 학습 가이드(MD)

## 환경 변수
로컬은 기본으로 동작합니다. 필요 시 `.env`(샘플: `.env.example`)를 만들어 사용하세요.

## 다음 단계
`chapters/Chapter01~10`의 MD를 순서대로 따라가면 **기초→배포→운영** 흐름을 완주할 수 있습니다.
