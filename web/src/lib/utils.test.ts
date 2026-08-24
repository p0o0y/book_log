import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("여러 클래스명을 병합한다", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("falsy 값(undefined, false, null)은 무시한다", () => {
    expect(cn("a", undefined, "b", false, null, "c")).toBe("a b c");
  });

  it("tailwind 충돌 클래스는 뒤에 오는 값이 우선한다", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("조건부 객체 형태의 클래스도 처리한다", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("인자가 없으면 빈 문자열을 반환한다", () => {
    expect(cn()).toBe("");
  });
});
