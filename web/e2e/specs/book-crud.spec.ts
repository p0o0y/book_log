import { expect, test } from "@playwright/test";
import { createBookViaUi, deleteBookViaUi, uniqueTitle } from "../fixtures/test-data";

/**
 * 이 파일에서 확인한 실제 UI 동작 (MCP 라이브 탐색 기준):
 * - "직접 등록" 탭의 필수 입력은 제목/저자. HTML required 속성이 없어
 *   빈 값으로 제출하면 서버 액션(saveBook)의 "제목을 입력해주세요." 메시지가
 *   role="alert"로 실제로 렌더링된다 (로그인 폼과 달리 브라우저 자체 검증에 막히지 않음).
 * - 등록/수정 성공 시 상세 페이지(/books/{id})로 리다이렉트된다.
 * - 삭제 버튼은 네이티브 confirm 다이얼로그("이 책과 관련 독후감을 모두 삭제할까요?")를 띄우고,
 *   수락하면 서재(/)로 리다이렉트된다.
 */

test.describe("책 등록", () => {
  test("제목과 저자를 입력하면 등록되고 상세 페이지에 반영된다", async ({ page }) => {
    const title = uniqueTitle("book-crud-create");
    const author = "테스트 저자";

    const bookId = await createBookViaUi(page, { title, author });
    try {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
      await expect(page.getByText(author).first()).toBeVisible();
    } finally {
      await deleteBookViaUi(page, bookId);
    }
  });

  test("제목을 입력하지 않으면 에러를 보여준다", async ({ page }) => {
    await page.goto("/books/new");
    await page.getByRole("tab", { name: "직접 등록" }).click();
    await page.getByRole("textbox", { name: "저자 *" }).fill("테스트 저자");
    await page.getByRole("button", { name: "등록하기" }).click();

    await expect(page.getByRole("alert").filter({ hasText: "제목을 입력해주세요." })).toBeVisible();
    await expect(page).toHaveURL(/\/books\/new$/);
  });
});

test.describe("책 정보 수정", () => {
  test("제목을 수정하면 상세 페이지에 반영된다", async ({ page }) => {
    const title = uniqueTitle("book-crud-edit");
    const editedTitle = `${title}-edited`;
    const author = "테스트 저자";

    const bookId = await createBookViaUi(page, { title, author });
    try {
      await page.getByRole("link", { name: "정보 수정" }).click();
      await expect(page).toHaveURL(`/books/${bookId}/edit`);
      await page.getByRole("textbox", { name: "제목 *" }).fill(editedTitle);
      await page.getByRole("button", { name: "저장하기" }).click();

      await page.waitForURL(`/books/${bookId}`);
      await expect(page.getByRole("heading", { name: editedTitle })).toBeVisible();
    } finally {
      await deleteBookViaUi(page, bookId);
    }
  });
});

test.describe("책 삭제", () => {
  test("삭제하면 서재 목록에서 사라진다", async ({ page }) => {
    const title = uniqueTitle("book-crud-delete");
    const author = "테스트 저자";

    const bookId = await createBookViaUi(page, { title, author });
    await deleteBookViaUi(page, bookId);

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);
  });
});
