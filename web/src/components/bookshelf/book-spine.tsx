import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import { spineGradient } from "@/lib/spine-palette";
import type { Book } from "@/lib/types";

/** 책 id 기반 결정적 변주 — 책마다 두께/높이/기울기를 살짝 다르게 */
function variation(id: string, titleLength: number) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return {
    // 긴 제목은 세로쓰기 두 줄이 들어가도록 살짝 두껍게
    width: 28 + (h % 14) + (titleLength > 13 ? 10 : 0),
    height: 78 + ((h >> 2) % 18), // 78~95% (선반 높이 대비)
    tilt: h % 7 === 0 ? -2 : 0, // 가끔 살짝 기울어진 책
  };
}

/** 제목이 잘리지 않도록 길이에 따라 글자 크기를 줄인다 */
function titleFontSize(titleLength: number): number {
  if (titleLength <= 9) return 11;
  if (titleLength <= 13) return 10;
  if (titleLength <= 20) return 9;
  return 8;
}

/** 책등 1권 (서버 컴포넌트, hover는 CSS로 처리) */
export function BookSpine({ book }: { book: Book }) {
  const v = variation(book.id, book.title.length);
  return (
    <Link
      href={`/books/${book.id}`}
      title={`${book.title} — ${book.author}`}
      className="group relative flex shrink-0 self-end transition-transform duration-200 hover:-translate-y-2"
      style={{
        width: v.width,
        height: `${v.height}%`,
        transform: v.tilt ? `rotate(${v.tilt}deg)` : undefined,
      }}
    >
      <span
        className="relative flex w-full flex-col items-center overflow-hidden rounded-t-[3px] pt-2 shadow-[inset_2px_0_3px_rgba(255,255,255,0.25),inset_-2px_0_4px_rgba(0,0,0,0.35),2px_0_3px_rgba(0,0,0,0.3)] group-hover:shadow-[inset_2px_0_3px_rgba(255,255,255,0.25),inset_-2px_0_4px_rgba(0,0,0,0.35),3px_4px_8px_rgba(0,0,0,0.4)]"
        style={{
          backgroundColor: book.spineColor,
          // 표지에서 추출한 색 비율대로 밴드를 나눈 책등 (위→아래)
          backgroundImage: spineGradient(book.spinePalette),
          color: book.spineTextColor,
        }}
      >
        {book.status === "reading" && (
          <BookOpen className="mb-1 size-3 shrink-0 opacity-90" aria-label="읽는 중" />
        )}
        {book.isWishlisted && (
          <Star
            className="mb-1 size-3 shrink-0 fill-current opacity-90"
            aria-label="찜"
          />
        )}
        {/* 제목은 잘리지 않게 — 길면 글자를 줄이고, 두꺼운 책등에서 두 줄로 흐른다 */}
        <span
          className="spine-title min-h-0 flex-1 overflow-hidden break-keep font-bold leading-tight tracking-tight"
          style={{ fontSize: titleFontSize(book.title.length) }}
        >
          {book.title}
        </span>
        <span className="spine-title mt-1 mb-2 max-h-12 overflow-hidden whitespace-nowrap text-[6px] opacity-60">
          {book.author}
        </span>
      </span>
    </Link>
  );
}
