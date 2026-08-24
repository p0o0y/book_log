import { chromium, type FullConfig } from "@playwright/test";

/**
 * 전용 E2E 테스트 계정으로 한 번만 로그인해 storageState를 저장한다.
 * 이후 모든 스펙은 playwright.config.ts의 use.storageState로 이 세션을 재사용하므로
 * 테스트마다 로그인 폼을 거치지 않는다.
 *
 * 필요 환경변수 (web/.env.local 또는 CI secret):
 * - E2E_TEST_EMAIL / E2E_TEST_PASSWORD: dev Supabase 프로젝트에 미리 만들어둔 전용 테스트 계정
 */
export default async function globalSetup(config: FullConfig) {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "E2E_TEST_EMAIL / E2E_TEST_PASSWORD 환경변수가 필요해요. web/.env.local에 전용 테스트 계정 자격 증명을 추가해주세요."
    );
  }

  const baseURL = config.projects[0]?.use?.baseURL as string | undefined;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/login`);
  await page.getByRole("textbox", { name: "이메일" }).fill(email);
  await page.getByRole("textbox", { name: "비밀번호" }).fill(password);
  await page.getByRole("button", { name: "이메일로 로그인" }).click();
  await page.waitForURL(`${baseURL}/dashboard`);

  await page.context().storageState({ path: "./e2e/.auth/user.json" });
  await browser.close();
}
