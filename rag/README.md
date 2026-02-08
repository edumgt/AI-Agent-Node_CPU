# RAG

## 문서 포맷 표준
- `rag/docs/*.md` 문서는 front-matter에 아래 필드를 포함해야 합니다.
  - `title`
  - `category`
  - `version`
  - `source_url`
  - `updated_at`
- 동일 메타데이터를 `rag/docs/manifest.json`에도 유지해 수집 파이프라인 표준을 맞춥니다.

## 인덱싱
- `cd agent-api && npm run rag:ingest`
- 결과는 `rag/rag_store.db`(SQLite)로 저장됩니다.

## 도메인 확장
- 기본 운영/정책 문서 외에 다음 도메인을 포함합니다.
  - 건설(`construction`)
  - 건축(`architecture`)
  - 법률(`legal`)
