import type { SpineBand } from "./types";

export interface SpineColors {
  spineColor: string;
  spineTextColor: string;
}

/** 비율 밴드 팔레트를 위→아래 하드 스톱 그라데이션 CSS로 만든다 */
export function spineGradient(palette?: SpineBand[]): string | undefined {
  if (!palette || palette.length < 2) return undefined;
  const stops: string[] = [];
  let acc = 0;
  for (let i = 0; i < palette.length; i++) {
    const end =
      i === palette.length - 1 ? 100 : Math.min(acc + palette[i].ratio, 100);
    stops.push(`${palette[i].color} ${acc}% ${end}%`);
    acc = end;
  }
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

/** 신규 책에 자동 배정되는 책등 색 팔레트 (배경/글자 대비 확보된 조합) */
const PALETTE: SpineColors[] = [
  { spineColor: "#2f4858", spineTextColor: "#f5f0e6" },
  { spineColor: "#3b6ea5", spineTextColor: "#ffffff" },
  { spineColor: "#9b2226", spineTextColor: "#fff3e0" },
  { spineColor: "#2a9d8f", spineTextColor: "#f0fdfa" },
  { spineColor: "#5f4b8b", spineTextColor: "#f3eefc" },
  { spineColor: "#e07a5f", spineTextColor: "#fff8f0" },
  { spineColor: "#606c38", spineTextColor: "#fefae0" },
  { spineColor: "#7f5539", spineTextColor: "#f5ebe0" },
  { spineColor: "#14213d", spineTextColor: "#ffd166" },
  { spineColor: "#0b525b", spineTextColor: "#e0fbfc" },
  { spineColor: "#f4a261", spineTextColor: "#442c14" },
  { spineColor: "#40916c", spineTextColor: "#ecfdf5" },
];

/** 시드 문자열(제목+저자 등)로부터 결정적으로 색 조합을 고른다. */
export function assignSpineColors(seed: string): SpineColors {
  let hash = 0;
  for (const ch of seed) {
    hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
