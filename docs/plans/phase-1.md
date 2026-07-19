# Phase 1 — 목데이터 저장소 전환 + 책 등록 기능

> 시작 전 [README.md](README.md)의 공통 컨텍스트를 읽을 것.

## 오버뷰

현재 `web/src/lib/mock-data.ts`는 읽기 전용 상수 배열이라 어떤 데이터도 추가/수정할 수 없고, 모든 폼은 핸들러 없는 정적 마크업이다(버튼이 전부 `type="button"`).

이번 단계에서는 (1) 목데이터를 **변경 가능한 인메모리 저장소**로 리팩터링하고, (2) 첫 번째 쓰기 기능으로 **책 등록**(`/books/new`)을 실제로 동작하게 만든다. 이 저장소 계층은 이후 모든 Phase의 기반이며, 나중에 DB로 교체할 때 이 모듈만 바꾸면 되도록 인터페이스를 함수로 감싼다.

**구현 방침**
- `web/src/lib/store.ts`(신규)에 인메모리 저장소를 만든다. Next.js dev 모드의 핫리로드/모듈 재평가로 데이터가 초기화되지 않도록 `globalThis`에 저장소 인스턴스를 보관하는 패턴을 사용할 것.
- 초기 데이터는 기존 `mock-data.ts`의 배열을 시드로 사용. 타입(`Book`, `Review` 등)은 `mock-data.ts`에 유지하거나 별도 `types.ts`로 분리해도 됨.
- 쓰기는 **서버 액션**으로 구현하고, 변경 후 `revalidatePath` + `redirect`로 반영한다.
- 저장소 API 예시: `listBooks()`, `getBook(id)`, `addBook(input)`, `updateBook(id, patch)`, `deleteBook(id)`, `listReviews(bookId)`, `addReview(...)` 등. 이번 Phase에서는 책 조회/추가만 실제 사용하고 나머지는 시그니처만 만들어도 된다.
- 신규 책의 `spineColor`/`spineTextColor`: 사용자 입력이 없으므로 미리 정의한 팔레트에서 결정적(예: id 해시 기반) 또는 순환 방식으로 자동 배정한다.

## 작업 항목

- [x] `web/src/lib/store.ts` 신규 생성 — `globalThis` 기반 인메모리 저장소, `mock-data.ts` 배열을 시드로 로드
- [x] 기존 페이지(서재 `/`, 상세 `/books/[id]`, 대시보드 `/dashboard`, 독후감 작성 페이지)가 `mock-data.ts` 배열 직접 import 대신 저장소 함수를 통해 데이터를 읽도록 교체
- [x] `web/src/app/(main)/books/new/actions.ts` 신규 — `createBook` 서버 액션 (필수값 검증: 제목/저자, 상태별 날짜 필드 처리, spine 색 자동 배정, 성공 시 `/books/[newId]`로 redirect)
- [x] `/books/new` "직접 등록" 탭 폼을 서버 액션에 연결 (`<form action={...}>`, 제출 버튼 `type="submit"`으로 변경, 시작일 입력 필드 추가, 상태가 `reading`일 때만 진행 페이지 관련 필드 노출은 선택 사항)
- [x] `/books/new` "검색으로 등록" 탭 — 검색 인풋에 입력한 키워드로 목데이터 내 제목/저자 필터링 동작(클라이언트 컴포넌트로 전환 또는 searchParams 방식), "선택" 버튼 클릭 시 해당 책 정보가 직접 등록 폼에 채워지거나 바로 등록되도록 연결
- [x] 필수값 누락 시 에러 메시지를 폼에 표시 (`useActionState` 또는 유사 패턴)

## 검증 체크리스트

- [x] `/books/new` 직접 등록 탭에서 제목·저자 입력 후 등록 → 새 책 상세 페이지로 이동하고 정보가 정확히 표시됨
- [x] 등록한 책이 서재(`/`)의 해당 상태 필터와 전체 카운트에 반영됨
- [x] 제목 또는 저자를 비우고 제출 → 등록되지 않고 에러 메시지 표시
- [x] 검색 탭에서 키워드 입력 시 결과가 필터링되고, "선택"으로 등록 플로우가 이어짐
- [x] 기존 페이지들(서재/상세/대시보드/독후감 작성)이 리팩터링 후에도 이전과 동일하게 렌더링됨 (회귀 없음)
- [x] 페이지 이동을 반복해도 dev 서버 세션 내에서 등록한 책이 유지됨 (핫리로드 초기화 문제 없음)
- [x] `npm run lint` 및 타입 체크 통과
