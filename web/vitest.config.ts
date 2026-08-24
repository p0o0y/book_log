import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // 기본은 node 환경(순수 로직용). 컴포넌트 테스트(.tsx)는 파일 상단에
    // `// @vitest-environment jsdom` 주석을 추가해 개별 오버라이드한다
    // (vitest 4는 environmentMatchGlobs를 지원하지 않음).
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/app/**", // 라우트/서버 액션은 추후 통합 테스트에서 다룸
        "src/lib/supabase/database.types.ts",
      ],
    },
  },
});
