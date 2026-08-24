import type { Page } from "@playwright/test";

/**
 * 공유 테스트 계정 하나로 여러 스펙이 데이터를 만들기 때문에,
 * 모든 E2E 생성 데이터는 이 접두사 + 고유 식별자를 제목/한줄평 등에 포함시켜
 * 실제 계정의 기존 데이터 및 다른 스펙 실행분과 충돌하지 않게 한다.
 */
export const E2E_PREFIX = "[e2e]";

export function uniqueTitle(label: string): string {
  return `${E2E_PREFIX} ${label} ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 책 등록 화면의 "직접 등록" 탭으로 최소 입력(제목/저자)만 채워 책 하나를 만든다.
 * 등록 후 상세 페이지(/books/{id})로 리다이렉트되는 것까지 기다리고 id를 반환한다.
 */
export async function createBookViaUi(
  page: Page,
  { title, author }: { title: string; author: string }
): Promise<string> {
  await page.goto("/books/new");
  await page.getByRole("tab", { name: "직접 등록" }).click();
  await page.getByRole("textbox", { name: "제목 *" }).fill(title);
  await page.getByRole("textbox", { name: "저자 *" }).fill(author);
  await page.getByRole("button", { name: "등록하기" }).click();
  // 등록 전 URL이 이미 /books/new이므로, "new"가 아닌 실제 id로 바뀔 때까지 기다린다.
  await page.waitForURL(/\/books\/(?!new)[^/]+$/);
  const match = page.url().match(/\/books\/([^/]+)$/);
  if (!match) throw new Error(`책 등록 후 상세 URL에서 id를 찾을 수 없어요: ${page.url()}`);
  return match[1];
}

/**
 * 책 상세 페이지에서 삭제 버튼으로 정리한다. 삭제 확인 네이티브 다이얼로그를 수락하고
 * 서재(/)로의 리다이렉트까지 기다린다.
 * 호출 시점 URL과 무관하게 항상 해당 책의 상세 페이지로 이동한 뒤 삭제한다 —
 * 이미 /edit, /review 등 하위 경로에 있을 때 부분 일치로 잘못 건너뛰는 걸 방지한다.
 */
export async function deleteBookViaUi(page: Page, bookId: string): Promise<void> {
  await page.goto(`/books/${bookId}`);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "삭제" }).click();
  await page.waitForURL(/\/(\?.*)?$/);
}
