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

## AI 실무 확장 가이드
- EKS 준비 단계에서 네임스페이스 분리는 필수입니다(dev/stg/prod).
- 최소 보안 기준:
  - IRSA 또는 최소권한 IAM 정책
  - Secret 분리 및 접근 제어
  - 기본 NetworkPolicy 적용 검토
- 비용 관리:
  - 노드 타입 표준화
  - 오토스케일 범위 제한
