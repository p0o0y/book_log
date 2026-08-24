---
name: create-e2etest
description: docs/e2e-testing.md 구조에 맞춰 Playwright E2E 스펙을 MCP 라이브 브라우저 탐색 기반으로 작성한다. "E2E 테스트 짜줘", "이 플로우 테스트 작성해줘"처럼 새 플로우의 E2E 스펙이 필요할 때 사용한다.
argument-hint: <작성할 플로우 (예: book-crud, "독후감 작성/수정/삭제", bookshelf-filters)>
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(cd web && npx playwright *), Bash(cd web && npx tsc *), Bash(cd web && npx eslint *), mcp__playwright__*
---

# Playwright E2E 스펙 작성

`docs/e2e-testing.md`에 정의된 구조와 컨벤션에 맞춰 아래 플로우의 E2E 스펙을 작성하라.

**기본 원칙: 코드를 읽고 셀렉터를 추측해서 쓰지 않는다.** Playwright MCP로 실제 브라우저를 조작해 플로우를 직접 수행하고, 그 과정에서 확인한 실제 셀렉터·문구·URL·타이밍을 그대로 코드로 옮긴다. 소스 코드 읽기는 라이브로 확인하기 번거로운 것(동적 조건별 문구 전체 목록, 에러 메시지 종류 등)을 보조적으로 확인할 때만 쓴다.

## 대상 플로우

$ARGUMENTS

## 0단계 — 구조 파악 (필수, 매번 다시 읽을 것)

- `docs/e2e-testing.md`를 읽고 폴더 구조, 전략 결정 사항(테스트 DB, `@external` 태그, `workers: 1`, 데이터 격리 규칙)을 확인한다.
- `web/playwright.config.ts`, `web/e2e/global-setup.ts`, `web/e2e/fixtures/auth.ts`, `web/e2e/fixtures/test-data.ts`를 읽어 현재 설정과 이미 존재하는 헬퍼를 파악한다.
- `web/e2e/specs/`에 이미 작성된 다른 스펙이 있으면 함께 읽어 톤·패턴(셀렉터 스타일, 정리 방식)을 맞춘다.
- 이 문서의 내용과 실제 코드가 어긋나면 실제 코드를 우선하고, 눈에 띄면 문서도 함께 갱신한다.

## 1단계 — 플로우 가볍게 훑기 (소스, 탐색 동선 파악용)

라이브 탐색을 헤매지 않기 위한 사전 정찰이다. 셀렉터를 확정 짓지 말고 아래만 파악한다:

- 대상 플로우의 라우트 경로(`web/src/app/**`)와 진입 URL
- 관련 서버 액션(`actions.ts`)이 알라딘 검색(`searchAladinBooks`/`lookupAladinPages`) 또는 유튜브 완독 추천(`searchTopReviewVideo`)처럼 외부 API를 실제로 호출하는지 — 호출하면 해당 케이스에 `@external` 태그가 필요하다는 것만 기억해둔다
- 이 플로우가 로그인 세션을 필요로 하는지 (로그인/로그아웃 자체 검증이 아니면 이미 로그인된 상태를 전제로 진행)

## 2단계 — MCP 라이브 탐색 (핵심 — 여기서 실제 셀렉터를 확정한다)

1. `mcp__playwright__browser_navigate`로 `http://localhost:3000`(개발 서버가 안 떠 있으면 먼저 `npm run dev`를 백그라운드로 띄운다)의 대상 플로우 진입 지점으로 이동한다.
2. 이미 로그인된 세션이 남아있는지 `browser_snapshot`으로 확인한다. 로그인이 안 돼 있고 이 플로우가 로그인을 필요로 하면, `web/.env.local`의 `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD`로 실제 로그인 폼을 채워 로그인한다. 이 값이 없으면 3단계로 건너뛰어 블로커를 먼저 처리한다.
3. 대상 플로우를 처음부터 끝까지 실제로 수행한다 (`browser_click`, `browser_type`, `browser_fill_form`, `browser_select_option`, `browser_press_key` 등). 매 단계마다 `browser_snapshot`으로 실제 렌더링된 요소의 role/name/text를 확인하고 기록해둔다 — 이게 스펙에 그대로 들어갈 셀렉터의 근거다.
4. 성공 케이스뿐 아니라 대상 플로우에 포함된 실패/경계 케이스(빈 입력, 잘못된 값 등)도 가능한 만큼 라이브로 재현해 실제 에러 문구를 확인한다.
5. **외부 API(`@external`) 호출이 필요한 스텝**은 실제 쿼터를 쓰므로, 라이브 탐색에서 한 번만 확인하고(스펙 작성의 근거로 삼기 위해) 이후 검증 단계(4단계)에서는 반복 실행하지 않는다. 라이브로 확인하기 전에 사용자에게 "지금 알라딘/유튜브 API를 실제로 한 번 호출해서 확인해도 되는지" 물어본다.
6. 탐색 중 만든 테스트 데이터(책, 독후감 등)는 탐색이 끝나면 MCP 브라우저에서 직접 삭제해 정리한다.
7. 탐색을 마쳤으면 브라우저 창을 닫지 말고 그대로 둔다 (`docs/project-guide.md`에 명시된 대로 테스트 계정 세션 유지).

## 3단계 — 로그인 인프라 확인 (블로커 처리)

- `web/.env.local`에 `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD`가 없으면, 라이브 탐색과 자동 실행(4단계) 둘 다 로그인이 필요한 플로우에서는 막힌다는 걸 사용자에게 알린다. 계정 생성은 사용자 소관이므로 대신 만들지 않는다. 이 경우 로그인이 필요 없는 부분까지만 라이브로 확인하고, 나머지는 2단계에서 확인한 정보 + 소스 코드로 최대한 정확하게 작성한 뒤 실행 확인이 보류됐음을 보고한다.
- `web/e2e/global-setup.ts`의 로그인 폼 스텝이 아직 TODO 주석 상태이고 2단계에서 실제 로그인 셀렉터를 이미 확인했다면, 그 값 그대로 채워 넣는다. 이미 채워져 있으면 손대지 않는다.

## 4단계 — 스펙 작성

- 파일 위치: `web/e2e/specs/<플로우-slug>.spec.ts` (기존 명명 규칙과 일치시킬 것)
- 2단계 라이브 탐색에서 확인한 실제 role/name/text/URL을 셀렉터 근거로 쓴다 (`getByRole`, `getByLabel`, `getByText` 등 사용자 관점 셀렉터 우선, 소스의 `aria-label`/`name`은 보조 확인용).
- `web/e2e/fixtures/test-data.ts`의 `uniqueTitle()` 등으로 생성 데이터를 `[e2e]` 접두사 + 고유 식별자로 만든다. 새로운 공용 헬퍼가 필요하면 이 파일에 추가하고, 특정 스펙에만 쓰는 로직은 스펙 파일 안에 둔다.
- 각 테스트가 만든 데이터는 `test.afterEach`(또는 케이스 내부)에서 UI 조작(삭제 버튼 등)으로 직접 정리한다.
- 외부 API를 호출하는 케이스는 테스트 제목 끝에 ` @external`을 붙인다. 같은 파일 안에 external과 non-external 케이스가 섞여도 된다.
- 로그인이 필요 없는 일반 스펙은 `@playwright/test`의 `test`/`expect`를 바로 쓰고, 로그인 폼 자체를 다루는 스펙만 `web/e2e/fixtures/auth.ts`의 `test`를 가져다 쓴다.

## 5단계 — 검증 (자동 헤드리스 실행 — MCP 라이브 세션과는 별개)

1. `cd web && npx playwright test <새 스펙 파일> --list`로 케이스가 의도대로 수집되는지 확인한다.
2. `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD`가 설정돼 있으면 `cd web && npx playwright test <새 스펙 파일> --grep-invert @external`로 헤드리스 실행해 통과를 확인한다. `@external` 케이스는 2단계에서 이미 라이브로 한 번 확인했으므로 여기서는 기본적으로 건너뛰고, 사용자가 요청할 때만 `--grep @external`로 추가 실행한다.
3. `cd web && npx tsc --noEmit`, `cd web && npx eslint src e2e --max-warnings 0`로 타입·린트 확인한다.
4. 실패하면 원인을 파악해 수정하고 반복한다. MCP 라이브 탐색에서 확인한 것과 헤드리스 실행 결과가 다르다면(타이밍, 리다이렉트 등) 다시 MCP로 재현해 원인을 확인한다.

## 완료 후 보고

- 작성한 스펙 파일 경로, 케이스 수, `@external` 케이스 유무
- MCP 라이브 탐색으로 실제 확인한 내용과, 헤드리스 실행으로 통과를 확인했는지 여부
- 로그인 인프라 부재 등으로 보류된 부분이 있으면 명시
- `global-setup.ts`나 `test-data.ts`를 수정했다면 그 내용
