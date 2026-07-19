# 마이북셸프 프로젝트 가이드

> 나중에 다시 볼 때를 위한 요약 문서. 상세 설계는 `docs/plans/`, 과거 이슈는 GitHub Issues 참고.

## 프로젝트 한 줄 소개

읽은 책을 책장 UI로 관리하는 개인 서재 서비스. Next.js 풀스택(서버 액션이 백엔드 역할) + Supabase(PostgreSQL·인증·RLS).

## 지금까지의 여정 (커밋 히스토리 순)

| 단계 | 내용 | 커밋 |
|---|---|---|
| PRD | `prd.pdf` (git 미추적) 기반으로 요구사항 정의 | - |
| UI 구현 | 마이북셸프 프론트엔드 UI (#6) | `99526a9` |
| 인증 | Supabase 이메일 로그인/회원가입 | `8e7cb5a` |
| 목데이터 | 인메모리 store 기반 서재 기능 Phase 1~5 (`docs/plans/`) | `e6a0784`, `276e2e4` |
| MCP 등록 | supabase·context7 MCP 서버 (`.mcp.json`) | `4a0b35b` |
| DB 전환 | 스키마+RLS 마이그레이션 (#10), store.ts Supabase 전환 (#11) | `dc89b8d`, `49460d5` |
| 외부 연동 | 알라딘 책 검색, 찜 플래그 분리(버그 수정), 표지색 다색 책등 | `154a9da` |
| 유튜브 | URL 붙여넣기 + oEmbed 수동 등록 | `78d9377` |

## 폴더 구조

- `front/` — Next.js 앱 전체 (이름과 달리 서버 액션 포함 풀스택. `web`으로 개명 예정)
  - `src/lib/store.ts` — **모든 데이터 접근의 단일 창구** (Supabase 쿼리)
  - `src/lib/aladin.ts` / `youtube.ts` / `cover-color.ts` — 외부 연동·색 추출 (서버 전용)
  - `src/app/(main)/**/actions.ts` — 서버 액션 (= 컨트롤러)
  - `.env.local` — Supabase 키, `ALADIN_TTB_KEY` (git 미추적)
- `supabase/migrations/` — DB 스키마 변경 이력 (순서대로 적용됨)
- `docs/plans/` — 목데이터 시절 Phase 1~5 작업 계획 (역사 기록)

## MCP 서버 (.mcp.json, 프로젝트 스코프)

| 서버 | 용도 | 비고 |
|---|---|---|
| **supabase** | DB 마이그레이션 적용, SQL 실행, TypeScript 타입 생성 | 원격 MCP. `/mcp`에서 OAuth 인증. 프로젝트 `etkvdtmhjhgjsfhmacps`로 제한 |
| **context7** | 라이브러리 최신 공식문서 조회 (@supabase/ssr, Next.js 등) | 이 Next.js 버전은 학습데이터와 달라 문서 확인 필수 (`front/AGENTS.md`) |
| **playwright** | 브라우저 자동화 — 구현 후 실제 화면 검증(E2E), 스크린샷 | Claude 검증용 창이 뜨면 닫지 말 것 (테스트 계정 세션) |

## .claude 커스텀 명령어 (슬래시 커맨드)

| 명령 | 언제 쓰나 |
|---|---|
| `/create-issue <내용>` | 버그/기능 아이디어를 정리해 GitHub 이슈 1개로 생성 |
| `/decompose-issue <작업>` | 큰 작업을 여러 이슈로 분해 → 승인 후 GitHub에 일괄 생성 (라벨 체계 자동 적용) |
| `/breakdown <문제>` | 문제를 실행 단위(Task)로 분해해 계획 문서로 출력 (이슈 생성은 안 함) |
| `/resolve-issue <번호>` | 이슈를 읽고 해결 계획 수립 → **승인 후** 코드 수정 시작 |

## .claude 에이전트

| 에이전트 | 언제 쓰나 |
|---|---|
| `code-reviewer` | 기능 구현 후·PR 머지 전 코드 품질/성능/보안 리뷰. **읽기 전용** (수정 안 함) |

## GitHub 이슈 라벨 체계

`유형: 기능|수정|리팩터링|테스트|문서화` / `복잡도: 낮음|중간|높음` / `영역: 프론트엔드|백엔드|DevOps`

## 자주 쓰는 명령

```bash
cd front
npm run dev        # 개발 서버 (http://localhost:3000)
npm run build      # 프로덕션 빌드 (배포 전 확인)
npx tsc --noEmit   # 타입 체크
```

## 주의사항 모음

- **RLS가 보안 경계**: publishable key는 노출돼도 되지만, 새 테이블을 만들면 반드시 RLS 정책을 함께 작성할 것
- 계정별로 데이터가 분리됨 — 브라우저에 책이 안 보이면 **로그인 계정부터 확인**
- 스키마 변경 시: 마이그레이션 SQL 작성 → supabase MCP로 적용 → 타입 재생성(`database.types.ts`) 순서
- 알라딘 API 일 5,000회 / oEmbed는 무제한·키 불필요
- 찜(`is_wishlisted`)은 읽기 상태(`status`)와 독립 플래그 — status의 `wishlist` 값은 "미시작" 의미
