# Chapter01 - WSL 개발환경 준비 (Node.js, Git, Docker, AWS CLI, kubectl, eksctl)

## 목표
- WSL에서 이 프로젝트를 수행할 수 있도록 기본 도구 설치/검증을 완료합니다.
- “로컬 실행 → 도커 → EKS 배포”에 필요한 최소 셋을 갖춥니다.

## 준비물
- Windows + WSL2(Ubuntu 권장)
- AWS 계정/액세스 키(또는 SSO)
- (선택) Docker Desktop

## 연습 1) Node.js 설치/버전 확인
```bash
node -v
npm -v
```
---
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
nvm install node
nvm use node
```



## 연습 2) Git 설정
```bash
git --version
git config --global user.name "YOUR_NAME"
git config --global user.email "YOUR_EMAIL"
```

## 연습 3) Docker 동작 확인
```bash
docker version
docker ps
```

## 연습 4) AWS CLI 인증 확인
```bash
aws --version
aws sts get-caller-identity
aws configure list
```

## 연습 5) kubectl / eksctl 확인
```bash
kubectl version --client
eksctl version
```

## 체크포인트
- `aws sts get-caller-identity`가 성공한다.
- `kubectl version --client`가 출력된다.
- `docker ps`가 동작한다.

## 과제
- 본인 환경 정보를 `docs/env-check.txt`에 정리(버전/리전/프로필).
