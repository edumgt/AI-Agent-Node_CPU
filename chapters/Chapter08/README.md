# Chapter08 - EKS 배포 (Deployment/Service/HPA) + 포트포워딩 검증

## 목표
- EKS에 배포하고, Service로 노출한 뒤 기능을 검증합니다.
- CPU 기반 HPA가 동작하는지 확인합니다.

## 연습 1) 이미지 준비
- ECR에 이미지를 올리고 `k8s/deployment.yaml`의 image를 수정합니다.

## 연습 2) 배포
```bash
kubectl -n cpu-agent apply -k k8s/
kubectl -n cpu-agent get deploy,po,svc,hpa
```

## 연습 3) 포트포워딩으로 테스트
```bash
kubectl -n cpu-agent port-forward svc/cpu-agent-svc 8080:80
curl -s http://localhost:8080/health
```

## 연습 4) HPA 확인(부하 테스트)
```bash
kubectl -n cpu-agent get hpa -w
```
(선택) 간단 부하 도구로 CPU를 올려 스케일아웃 유도

## 체크포인트
- Pod Ready
- Service 정상
- HPA 지표가 관측됨(metrics-server 필요)

## 과제
- readiness/liveness 초기 지연 시간을 환경에 맞게 조정해보기.

## AI 실무 확장 가이드
- 배포 후 검증은 기능 테스트 + 운영 테스트를 함께 수행합니다.
- 필수 확인:
  - 롤링 업데이트 중 무중단 여부
  - readiness/liveness 임계값 적정성
  - HPA scale up/down 안정성(쓰래싱 방지)
- 장애 시 즉시 롤백 가능한 배포 전략(Helm/Kustomize 버전 관리)을 권장합니다.
