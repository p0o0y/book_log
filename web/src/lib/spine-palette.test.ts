import { describe, it, expect } from "vitest";
import { assignSpineColors, spineGradient } from "./spine-palette";
import type { SpineBand } from "./types";

describe("assignSpineColors", () => {
  it("같은 시드는 항상 같은 결과를 반환한다 (결정적)", () => {
    const seed = "제목저자";
    expect(assignSpineColors(seed)).toEqual(assignSpineColors(seed));
  });

  it("다른 시드는 다른 색 조합이 나올 수 있다", () => {
    const results = new Set(
      ["book-a", "book-b", "book-c", "book-d", "book-e"].map(
        (seed) => assignSpineColors(seed).spineColor
      )
    );
    expect(results.size).toBeGreaterThan(1);
  });

  it("빈 문자열도 에러 없이 팔레트 내 값을 반환한다", () => {
    const result = assignSpineColors("");
    expect(result).toHaveProperty("spineColor");
    expect(result).toHaveProperty("spineTextColor");
    expect(typeof result.spineColor).toBe("string");
  });
});

describe("spineGradient", () => {
  it("palette가 undefined면 undefined를 반환한다", () => {
    expect(spineGradient(undefined)).toBeUndefined();
  });

  it("밴드가 1개면 undefined를 반환한다", () => {
    const palette: SpineBand[] = [{ color: "#111111", ratio: 100 }];
    expect(spineGradient(palette)).toBeUndefined();
  });

  it("밴드 2개일 때 올바른 linear-gradient 문자열을 생성한다", () => {
    const palette: SpineBand[] = [
      { color: "#111111", ratio: 30 },
      { color: "#222222", ratio: 70 },
    ];
    expect(spineGradient(palette)).toBe(
      "linear-gradient(to bottom, #111111 0% 30%, #222222 30% 100%)"
    );
  });

  it("밴드 3개 이상일 때 누적 %를 계산하고 마지막 stop이 100%로 끝난다", () => {
    const palette: SpineBand[] = [
      { color: "#111111", ratio: 20 },
      { color: "#222222", ratio: 30 },
      { color: "#333333", ratio: 50 },
    ];
    const result = spineGradient(palette);
    expect(result).toBe(
      "linear-gradient(to bottom, #111111 0% 20%, #222222 20% 50%, #333333 50% 100%)"
    );
    expect(result?.endsWith("100%)")).toBe(true);
  });

  it("ratio 합계가 100을 넘는 경우에도 마지막 stop은 100%로 고정된다", () => {
    const palette: SpineBand[] = [
      { color: "#111111", ratio: 60 },
      { color: "#222222", ratio: 60 },
    ];
    const result = spineGradient(palette);
    expect(result).toBe(
      "linear-gradient(to bottom, #111111 0% 60%, #222222 60% 100%)"
    );
  });
});
