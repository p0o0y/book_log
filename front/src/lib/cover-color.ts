import sharp from "sharp";
import type { SpineBand } from "./types";
import type { SpineColors } from "./spine-palette";

/**
 * 표지 이미지에서 책등 색을 추출한다 (서버 전용).
 * 표지 전체 픽셀을 색 군집으로 묶어, 비율이 충분한 색(최대 4개)을
 * 표지에서의 상하 위치 순서대로 밴드로 만든다. 예: 흰 배경에 주황 포인트면
 * 흰색 큰 밴드 + 주황 작은 밴드. 실패 시 null (호출부에서 팔레트 폴백).
 */

export interface ExtractedSpineColors extends SpineColors {
  spinePalette?: SpineBand[];
}

interface Cluster {
  n: number;
  r: number;
  g: number;
  b: number;
  ySum: number;
}

/** 군집 병합 기준 — 이보다 가까운 색은 같은 밴드로 본다 */
const MERGE_DISTANCE = 48;
/** 밴드로 인정할 최소 픽셀 비율(%) */
const MIN_RATIO = 8;
const MAX_BANDS = 4;

const avg = (c: Cluster): [number, number, number] => [
  Math.round(c.r / c.n),
  Math.round(c.g / c.n),
  Math.round(c.b / c.n),
];

const toHex = ([r, g, b]: [number, number, number]): string =>
  `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;

const distance = (a: [number, number, number], b: [number, number, number]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** 상대 휘도(0~1) — 글자색(밝음/어둠) 결정용 */
const luminance = ([r, g, b]: [number, number, number]) =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/** 4비트/채널 양자화 버킷을 유사색끼리 병합해 군집을 만든다 */
function clusterColors(data: Buffer, width: number, height: number): Cluster[] {
  const buckets = new Map<number, Cluster>();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
      const bucket = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0, ySum: 0 };
      bucket.n += 1;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.ySum += y;
      buckets.set(key, bucket);
    }
  }

  // 큰 버킷부터 훑으며 가까운 색은 하나의 군집으로 합친다
  const clusters: Cluster[] = [];
  for (const bucket of [...buckets.values()].sort((a, b) => b.n - a.n)) {
    const near = clusters.find(
      (c) => distance(avg(c), avg(bucket)) < MERGE_DISTANCE
    );
    if (near) {
      near.n += bucket.n;
      near.r += bucket.r;
      near.g += bucket.g;
      near.b += bucket.b;
      near.ySum += bucket.ySum;
    } else {
      clusters.push({ ...bucket });
    }
  }
  return clusters;
}

/** 군집에서 밴드 팔레트를 만든다. 유의미한 색이 2개 미만이면 undefined */
export function buildPalette(
  clusters: Cluster[],
  totalPixels: number
): SpineBand[] | undefined {
  const major = clusters
    .filter((c) => (c.n / totalPixels) * 100 >= MIN_RATIO)
    .sort((a, b) => b.n - a.n)
    .slice(0, MAX_BANDS);
  if (major.length < 2) return undefined;

  // 표지에서 위에 있는 색이 책등 위 밴드가 되도록 평균 y로 정렬
  major.sort((a, b) => a.ySum / a.n - b.ySum / b.n);

  const majorTotal = major.reduce((sum, c) => sum + c.n, 0);
  const bands = major.map((c) => ({
    color: toHex(avg(c)),
    ratio: Math.max(1, Math.round((c.n / majorTotal) * 100)),
  }));
  // 반올림 오차는 마지막 밴드에서 보정해 합계 100 유지
  const sum = bands.reduce((s, b) => s + b.ratio, 0);
  bands[bands.length - 1].ratio += 100 - sum;
  return bands;
}

export async function extractCoverColors(
  coverImageUrl: string
): Promise<ExtractedSpineColors | null> {
  try {
    const res = await fetch(coverImageUrl, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());

    const { data, info } = await sharp(buffer)
      .resize(32, 48, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const clusters = clusterColors(data, info.width, info.height);
    const dominant = clusters.reduce((a, b) => (b.n > a.n ? b : a));
    const dominantRgb = avg(dominant);

    return {
      spineColor: toHex(dominantRgb),
      spineTextColor: luminance(dominantRgb) > 0.55 ? "#1f2937" : "#f8fafc",
      spinePalette: buildPalette(clusters, info.width * info.height),
    };
  } catch {
    return null;
  }
}
