# MyBookshelf 개선 실행 계획 (목데이터 단계)

각 Phase는 독립적으로 실행 가능하며, 순서대로 진행하면 프로젝트가 점진적으로 개선된다.
아직 DB를 사용하지 않으며 모든 데이터는 목데이터(인메모리)로 처리한다.

| Phase | 파일 | 내용 |
|-------|------|------|
| 1 | [phase-1.md](phase-1.md) | 목데이터 저장소 전환 + 책 등록 기능 동작 |
| 2 | [phase-2.md](phase-2.md) | 독후감 작성/수정/삭제 기능 동작 |
| 3 | [phase-3.md](phase-3.md) | 책 관리 (상태 변경·진행률·완독 처리·수정·삭제) |
| 4 | [phase-4.md](phase-4.md) | 서재 검색/정렬 + 대시보드 데이터 정합성 |
| 5 | [phase-5.md](phase-5.md) | UX 폴리시 (로딩/에러/빈 상태/토스트/접근성) |

## 공통 컨텍스트 (모든 Phase 에이전트 필독)

- **프로젝트 위치**: `front/` (Next.js 16.2.10, App Router, React 19, Tailwind v4, shadcn 스타일 자체 UI 컴포넌트 `front/src/components/ui/`)
- **⚠️ Next.js 버전 주의**: `front/AGENTS.md`에 명시된 대로 이 Next.js 버전은 학습 데이터와 API/컨벤션이 다를 수 있다. 코드 작성 전 `front/node_modules/next/dist/docs/`의 관련 문서를 반드시 확인할 것.
- **데이터**: `front/src/lib/mock-data.ts` — `Book`, `Review`, `YoutubeVideo` 타입과 배열, `getBook/getReviews/getYoutubeVideos` 헬퍼. DB 없음.
- **페이지 구조**:
  - `/` 서재 (책장/그리드 뷰, 상태 필터) — `front/src/app/(main)/page.tsx`
  - `/books/[id]` 책 상세 — `front/src/app/(main)/books/[id]/page.tsx`
  - `/books/[id]/review/new` 독후감 작성 — 정적 폼
  - `/books/new` 책 등록 (검색 목업 + 직접 등록 탭) — 정적 폼
  - `/dashboard` 통계 대시보드
  - `/login` 로그인 (Supabase 연동 작업 중 — 이 계획의 범위 밖, 관련 파일 건드리지 말 것: `src/lib/supabase/`, `src/proxy.ts`, `(auth)/login/*`)
- **개발 서버**: `cd front && npm run dev`
- **완료 기준**: 각 Phase의 검증 체크리스트를 실제 브라우저(또는 Playwright MCP)로 확인하고, `npm run lint`와 `npx tsc --noEmit`(또는 `npm run build`)이 통과해야 한다.
