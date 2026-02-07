# Chapter07 - EKS 준비 (eksctl 클러스터/노드그룹, kubeconfig, 네임스페이스)

## 목표
- EKS에 배포할 준비를 합니다.
- eksctl/kubectl로 컨텍스트를 확인하고 네임스페이스를 분리합니다.

## 연습 1) kubeconfig 확인
```bash
kubectl config get-contexts
kubectl config current-context
```

## 연습 2) 네임스페이스 생성
```bash
kubectl create ns cpu-agent
kubectl get ns
```

## 연습 3) 리소스쿼터(선택)
개발 환경에서 비용/폭주 방지:
- CPU/메모리 상한
- 파드 수 제한

## 체크포인트
- `cpu-agent` 네임스페이스가 존재한다.

## 과제
- `kubectl -n cpu-agent get all`이 빈 상태인지 확인(초기 상태).
