import { test as base } from "@playwright/test";

/**
 * playwright.config.ts의 use.storageState가 기본적으로 로그인된 세션을 물려주기 때문에,
 * 로그인/로그아웃 자체를 검증하는 스펙(auth.spec.ts)만 이 fixture로 storageState를 비운
 * 별도 컨텍스트를 받아서 로그인 폼부터 시작한다.
 */
export const test = base.extend({
  storageState: async ({}, provide) => {
    await provide(undefined);
  },
});

export { expect } from "@playwright/test";
