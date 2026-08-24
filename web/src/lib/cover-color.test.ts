import { describe, it, expect } from "vitest";
import { buildPalette } from "./cover-color";

interface Cluster {
  n: number;
  r: number;
  g: number;
  b: number;
  ySum: number;
}

describe("buildPalette", () => {
  it("유의미한(>=8%) 군집이 2개 미만이면 undefined를 반환한다", () => {
    const clusters: Cluster[] = [
      { n: 95, r: 0, g: 0, b: 0, ySum: 0 }, // 95%
      { n: 5, r: 0, g: 0, b: 0, ySum: 0 }, // 5% (< 8%)
    ];
    expect(buildPalette(clusters, 100)).toBeUndefined();
  });

  it("유의미한 군집이 0개여도 undefined를 반환한다", () => {
    const clusters: Cluster[] = [{ n: 5, r: 0, g: 0, b: 0, ySum: 0 }];
    expect(buildPalette(clusters, 100)).toBeUndefined();
  });

  it("상위 4개까지만 채택한다", () => {
    // 6개 군집 모두 >=8% 비중, n 내림차순으로 상위 4개만 선택되어야 함
    const clusters: Cluster[] = [
      { n: 30, r: 30 * 10, g: 0, b: 0, ySum: 0 },
      { n: 25, r: 25 * 20, g: 0, b: 0, ySum: 25 },
      { n: 20, r: 20 * 30, g: 0, b: 0, ySum: 20 * 2 },
      { n: 15, r: 15 * 40, g: 0, b: 0, ySum: 15 * 3 },
      { n: 5, r: 5 * 50, g: 0, b: 0, ySum: 5 * 4 }, // n 작아 4개 밖으로 밀림
      { n: 5, r: 5 * 60, g: 0, b: 0, ySum: 5 * 5 },
    ];
    const totalPixels = clusters.reduce((s, c) => s + c.n, 0); // 100
    const result = buildPalette(clusters, totalPixels);
    expect(result).toBeDefined();
    expect(result?.length).toBe(4);
  });

  it("y평균(ySum/n) 기준 상하(오름차순)로 정렬한다", () => {
    const clusters: Cluster[] = [
      { n: 30, r: 30 * 200, g: 30 * 0, b: 30 * 0, ySum: 30 * 40 }, // y평균 40 (아래쪽)
      { n: 30, r: 30 * 0, g: 30 * 200, b: 30 * 0, ySum: 30 * 5 }, // y평균 5 (위쪽)
      { n: 30, r: 30 * 0, g: 30 * 0, b: 30 * 200, ySum: 30 * 20 }, // y평균 20 (중간)
    ];
    const result = buildPalette(clusters, 90);
    expect(result).toBeDefined();
    expect(result?.length).toBe(3);
    // y평균 5(초록) -> 20(파랑) -> 40(빨강) 순으로 정렬되어야 함
    expect(result?.[0].color.toLowerCase()).toBe("#00c800");
    expect(result?.[1].color.toLowerCase()).toBe("#0000c8");
    expect(result?.[2].color.toLowerCase()).toBe("#c80000");
  });

  it("ratio 합계는 항상 100이다 (반올림 보정)", () => {
    // n 비율이 33.33...% 씩 나눠지도록 구성해 반올림 오차를 유발
    const clusters: Cluster[] = [
      { n: 10, r: 10 * 10, g: 0, b: 0, ySum: 0 },
      { n: 10, r: 10 * 20, g: 0, b: 0, ySum: 10 },
      { n: 10, r: 10 * 30, g: 0, b: 0, ySum: 20 },
    ];
    const result = buildPalette(clusters, 30);
    expect(result).toBeDefined();
    const sum = result?.reduce((s, b) => s + b.ratio, 0);
    expect(sum).toBe(100);
  });

  it("ratio 합계가 100 미만으로 남는 경우에도 마지막 밴드에서 보정되어 100이 된다", () => {
    const clusters: Cluster[] = [
      { n: 34, r: 0, g: 0, b: 0, ySum: 0 },
      { n: 33, r: 0, g: 0, b: 0, ySum: 33 },
      { n: 33, r: 0, g: 0, b: 0, ySum: 66 },
    ];
    const result = buildPalette(clusters, 100);
    expect(result).toBeDefined();
    const sum = result?.reduce((s, b) => s + b.ratio, 0);
    expect(sum).toBe(100);
    expect(result?.every((b) => b.ratio >= 1)).toBe(true);
  });
});
