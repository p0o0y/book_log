# Phase 2 — 독후감 작성/수정/삭제

> 시작 전 [README.md](README.md)의 공통 컨텍스트를 읽을 것. **선행 조건: Phase 1 완료** (인메모리 저장소 `web/src/lib/store.ts` 존재).

## 오버뷰

책 상세 페이지(`/books/[id]`)에는 독후감 목록과 수정(Pencil)/삭제(Trash2) 아이콘 버튼, "독후감 쓰기" 버튼이 있지만 전부 동작하지 않는다. 독후감 작성 페이지(`/books/[id]/review/new`)의 폼도 정적이며, 별점 입력 컴포넌트(`web/src/components/star-rating-input.tsx`)는 폼 값과 연결되어 있지 않다.

이번 단계에서는 독후감 CRUD를 완성한다: 작성 폼 제출 → 저장소에 추가, 기존 독후감 수정 페이지 신설, 삭제 동작(확인 후 삭제). `Review` 타입은 `{ id, bookId, rating?, oneLiner, content, createdAt }`이며 한 책에 여러 독후감(재독 리뷰)이 허용된다.

**구현 방침**
- 저장소에 `addReview`, `updateReview`, `deleteReview` 구현 (Phase 1에서 시그니처만 있다면 완성).
- 서버 액션은 `web/src/app/(main)/books/[id]/review/` 하위에 배치.
- `StarRatingInput`을 제어 컴포넌트로 만들고 hidden input 등으로 폼 데이터에 rating이 포함되게 한다. 별점은 선택 사항(없으면 undefined).
- 수정 페이지는 `/books/[id]/review/[reviewId]/edit` 라우트 신설 — 작성 페이지와 폼을 공유 컴포넌트로 추출해 초기값만 주입.
- 삭제는 실수 방지를 위해 confirm 단계(브라우저 confirm 또는 간단한 확인 UI)를 거친다.
- 검증: `oneLiner` 또는 `content` 중 최소 하나는 필수(빈 독후감 저장 방지). `createdAt`은 저장 시 오늘 날짜(YYYY-MM-DD)로 자동 기록.

## 작업 항목

- [x] 저장소에 `addReview` / `updateReview` / `deleteReview` 구현
- [x] 독후감 작성 폼(`/books/[id]/review/new`)을 서버 액션에 연결 — 저장 후 책 상세로 redirect, 목록에 즉시 반영(`revalidatePath`)
- [x] `StarRatingInput`을 폼 값과 연동 (rating이 서버 액션에 전달되도록)
- [x] 작성/수정 공용 폼 컴포넌트 추출 (`review-form.tsx` 등)
- [x] `/books/[id]/review/[reviewId]/edit` 수정 페이지 신설 — 기존 값 프리필, 저장 시 해당 독후감 갱신 (존재하지 않는 reviewId면 `notFound()`)
- [x] 책 상세의 수정 버튼을 수정 페이지 링크로 연결
- [x] 책 상세의 삭제 버튼 동작 구현 — 확인 후 삭제, 목록 갱신
- [x] 빈 독후감 제출 방지 검증 + 에러 메시지 표시

## 검증 체크리스트

- [x] 책 상세에서 "독후감 쓰기" → 별점/한줄평/본문 입력 → 저장 → 책 상세로 돌아오고 새 독후감이 목록 최상단(최신순)에 표시됨
- [x] 별점 없이 저장해도 정상 동작 (별점 미표시 처리 확인)
- [x] 한줄평·본문 모두 비우고 제출 → 저장되지 않고 에러 메시지 표시
- [x] 기존 독후감의 수정 버튼 → 값이 프리필된 폼 → 수정 저장 → 변경 내용이 상세 페이지에 반영됨
- [x] 삭제 버튼 → 확인 → 목록에서 사라지고 독후감 개수 카운트 갱신
- [x] 독후감이 여러 개인 책(목데이터 bookId "2")에서 특정 하나만 수정/삭제해도 다른 독후감은 영향 없음
- [x] 대시보드의 평균 별점이 추가/삭제된 독후감을 반영해 변함
- [x] `npm run lint` 및 타입 체크 통과
