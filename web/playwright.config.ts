import { defineConfig, devices } from "@playwright/test";

// Next.js는 .env.local을 자동으로 읽지만 Playwright는 별도 Node 프로세스라 자동으로 안 읽는다.
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local이 없으면(CI 등) 무시 — 그 경우 실제 환경변수(CI secret)로 주입됨
}

/**
 * dev Supabase 프로젝트 + 전용 테스트 계정을 그대로 사용한다.
 * 계정 자격 증명은 E2E_TEST_EMAIL / E2E_TEST_PASSWORD 환경변수로 주입한다 (web/.env.local 또는 CI secret).
 *
 * 계정 하나를 여러 워커가 동시에 로그인/조작하면 대시보드 집계 등 공유 상태에서
 * 레이스가 날 수 있어 우선 workers: 1(직렬 실행)로 시작한다. 각 테스트는
 * "[e2e]" 접두사 + 고유 식별자(타임스탬프/uuid)로 데이터를 만들어 서로 충돌하지 않게 하고,
 * afterEach에서 스스로 정리한다. 이후 필요하면 테스트 계정을 늘려 병렬화한다.
 *
 * 외부 API(Aladin 검색, YouTube 완독 추천)를 실제로 호출하는 테스트는 `@external` 태그를 붙여
 * 기본 실행(`npm run test:e2e`)에서 제외하고, `npm run test:e2e:external`로 별도 실행한다.
 */
export default defineConfig({
  testDir: "./e2e/specs",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    storageState: "./e2e/.auth/user.json",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
