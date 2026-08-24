import { expect, test } from "../fixtures/auth";
import { test as authedTest, expect as authedExpect } from "@playwright/test";

/**
 * 이 파일에서 확인한 실제 UI 동작 (MCP 라이브 탐색 기준):
 * - 폼 필드: getByRole("textbox", { name: "이메일" }) / "비밀번호"
 * - 버튼: getByRole("button", { name: "이메일로 로그인" }) / "회원가입"
 * - 이메일/비밀번호 input에는 required, 비밀번호에는 minLength=6이 걸려있어
 *   브라우저 자체 유효성 검사가 서버 액션(authenticate)의
 *   "이메일과 비밀번호를 모두 입력해 주세요." / "비밀번호는 6자 이상이어야 해요." 메시지보다
 *   먼저 제출을 막는다. 즉 이 두 서버 메시지는 실제 UI로는 도달 불가능 —
 *   해당 로직은 web/src/app/(auth)/login/actions.test.ts(유닛테스트)에서 이미 검증됨.
 * - 회원가입 성공 시 새 Supabase Auth 사용자가 영구적으로 생긴다(앱에 자기 계정 삭제 기능 없음).
 *   반복 실행 시 계정이 계속 쌓이는 걸 피하려고, "새 이메일로 회원가입 성공" 케이스는
 *   여기서 반복 검증하지 않는다 (이미 라이브 탐색으로 1회 확인함). 대신 이미 존재하는
 *   테스트 계정(e2e@test.com)으로의 "이미 가입된 이메일" 에러 케이스로 같은 코드 경로를 커버한다.
 */

test.describe("로그인", () => {
  test("잘못된 자격 증명이면 에러를 보여준다", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("textbox", { name: "이메일" }).fill("wrong-user@example.com");
    await page.getByRole("textbox", { name: "비밀번호" }).fill("wrongpassword123");
    await page.getByRole("button", { name: "이메일로 로그인" }).click();

    await expect(page.getByRole("alert").filter({ hasText: "이메일 또는 비밀번호가 올바르지 않아요." })).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("올바른 자격 증명이면 대시보드로 이동한다", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;
    if (!email || !password) {
      test.skip(true, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD가 설정되지 않았어요.");
      return;
    }

    await page.goto("/login");
    await page.getByRole("textbox", { name: "이메일" }).fill(email);
    await page.getByRole("textbox", { name: "비밀번호" }).fill(password);
    await page.getByRole("button", { name: "이메일로 로그인" }).click();

    await page.waitForURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible();
  });
});

test.describe("회원가입", () => {
  test("이미 가입된 이메일이면 에러를 보여준다", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;
    if (!email || !password) {
      test.skip(true, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD가 설정되지 않았어요.");
      return;
    }

    await page.goto("/login");
    await page.getByRole("textbox", { name: "이메일" }).fill(email);
    await page.getByRole("textbox", { name: "비밀번호" }).fill(password);
    await page.getByRole("button", { name: "회원가입" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: "이미 가입된 이메일이에요. 로그인해 주세요." })
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});

// 로그아웃은 storageState로 이미 로그인된 기본 세션(fixtures/auth.ts 아님)에서 시작해야 한다.
authedTest.describe("로그아웃", () => {
  authedTest("헤더의 로그아웃 버튼을 누르면 로그인 화면으로 이동한다", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "로그아웃" }).click();

    await page.waitForURL(/\/login$/);
    await authedExpect(page.getByRole("button", { name: "이메일로 로그인" })).toBeVisible();
  });
});
