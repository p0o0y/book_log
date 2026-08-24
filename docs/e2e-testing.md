# E2E 테스트 구조 (Playwright)

> 유닛테스트(Vitest, `web/src/**/*.test.ts(x)`)와 별개로, 실제 브라우저에서 화면 흐름을 검증하는 E2E 테스트 구조.

## 전략 결정 사항

| 항목 | 선택 | 이유 |
|---|---|---|
| 테스트 DB | 현재 dev Supabase 프로젝트 + 전용 테스트 계정 | 별도 프로젝트 구축 비용 없이 바로 시작. 계정 하나로 격리하면 충분히 안전 |
| 외부 API (알라딘 검색, 유튜브 완독 추천) | 실제로 호출하되 `@external` 태그로 분리 | 핵심 CRUD 플로우는 외부 의존 없이 항상 안정적으로 돌고, 연동 자체의 정상 동작은 별도로 검증 |
| 동시 실행 | `workers: 1` (직렬) | 테스트 계정이 하나뿐이라 병렬로 돌리면 대시보드 집계 등 공유 상태에서 레이스 발생 가능. 데이터가 늘어나 느려지면 계정을 추가해 병렬화 재검토 |
| 데이터 격리 | 제목/한줄평 등에 `[e2e] {label} {timestamp}-{random}` 접두사 부여 | 실제 계정의 기존 데이터, 다른 스펙이 만든 데이터와 충돌하지 않게 함 |

## 폴더 구조

```
web/
├─ playwright.config.ts        # 전체 설정 (아래 참고)
└─ e2e/
   ├─ global-setup.ts          # 테스트 계정으로 1회 로그인 → storageState 저장
   ├─ .auth/                   # storageState 결과물 (gitignore 대상)
   │  └─ user.json
   ├─ fixtures/
   │  ├─ auth.ts                # 로그인 폼 자체를 검증하는 스펙용 — storageState 없이 시작하는 test 확장
   │  └─ test-data.ts           # uniqueTitle(), createBookViaUi(), deleteBookViaUi() 등 데이터 격리·CRUD 헬퍼
   └─ specs/
      ├─ auth.spec.ts               # 완료 — 회원가입/로그인/로그아웃/잘못된 자격 증명
      ├─ book-crud.spec.ts          # 완료 — 수동 등록/수정/삭제, 필수값 미입력 에러 (외부 API 불필요)
      ├─ book-search.spec.ts        # 예정 — @external — 알라딘 검색 탭
      ├─ bookshelf-filters.spec.ts  # 예정 — 상태 필터·정렬·검색어·뷰(책장/그리드) 전환, URL 상태
      ├─ reading-progress.spec.ts   # 예정 — 상태 전이(읽는중/완독/미시작), 진행률 저장, 마지막 페이지 자동완독
      ├─ reviews.spec.ts            # 예정 — 독후감 작성/수정/삭제
      ├─ youtube-videos.spec.ts     # 예정 — URL 등록/삭제, @external — 완독 시 자동 추천
      └─ dashboard.spec.ts          # 예정 — 대시보드 집계 화면
```

`specs/` 아래 파일 목록은 계획이고, 실제로는 붙이면서 이름/분량을 조정한다.

## 설정 요점 (`playwright.config.ts`)

- `testDir: "./e2e/specs"`, `globalSetup: "./e2e/global-setup.ts"`
- `use.storageState: "./e2e/.auth/user.json"` — 모든 스펙이 기본적으로 로그인된 세션에서 시작 (로그인 자체를 검증하는 `auth.spec.ts`만 `fixtures/auth.ts`로 예외 처리)
- `webServer` — `npm run dev`를 자동 기동, `reuseExistingServer`는 로컬에서만 true
- `trace: "on-first-retry"`, `screenshot: "only-on-failure"`

## 환경변수

`web/.env.local`에 설정 완료:

```
E2E_TEST_EMAIL=...
E2E_TEST_PASSWORD=...
```

dev Supabase 프로젝트에 전용 테스트 계정(`e2e@test.com`)을 만들어 채워뒀다. `global-setup.ts`의 로그인 셀렉터도 채워져 있다.

## `@external` 태그 규칙

외부 API(알라딘 검색, 유튜브 완독 자동 추천)를 실제로 호출하는 테스트 케이스는 제목에 `@external`을 붙인다.

```ts
test("검색 탭에서 책을 찾아 등록한다 @external", async ({ page }) => { ... });
```

- 기본 실행: `@external` 제외 (`--grep-invert @external`)
- 별도 실행: `@external`만 (`--grep @external`)

`package.json`에 스크립트 추가 완료:

```json
"test:e2e": "playwright test --grep-invert @external",
"test:e2e:external": "playwright test --grep @external",
"test:e2e:all": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

## 아직 안 한 것

- `book-search.spec.ts`, `bookshelf-filters.spec.ts`, `reading-progress.spec.ts`, `reviews.spec.ts`, `youtube-videos.spec.ts`, `dashboard.spec.ts` 작성

완료됨: `.gitignore`에 `e2e/.auth/`, `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/` 추가. `auth.spec.ts`, `book-crud.spec.ts` 헤드리스 실행 통과 확인.
