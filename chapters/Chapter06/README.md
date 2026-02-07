# Chapter06 - 도커라이징 (Dockerfile, 이미지 최적화, 로컬 컨테이너 실행)

## 목표
- Express 서버를 컨테이너로 패키징하고 로컬에서 실행합니다.
- 이미지 크기/빌드 속도 관점의 기본 최적화를 적용합니다.

## 연습 1) 도커 빌드
프로젝트 루트에서:
```bash
docker build -t cpu-agent:dev ./agent-api
```

## 연습 2) 컨테이너 실행
```bash
docker run --rm -p 8080:8080 cpu-agent:dev
curl -s http://localhost:8080/health
```

## 연습 3) 이미지 최적화(선택)
- `npm ci` 활용
- 불필요 파일 COPY 제외(.dockerignore 추가)

## 체크포인트
- 컨테이너로 실행해도 FE가 정상 호출한다.

## 과제
- `.dockerignore` 작성(예: node_modules, logs, .git 등 제외)
