import Link from "next/link";
import { BookOpen, Bookmark } from "lucide-react";
import type { Book } from "@/lib/types";

/** 책 id 기반 결정적 변주 — 책마다 두께/높이/기울기를 살짝 다르게 */
function variation(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return {
    width: 28 + (h % 14), // 28~41px
    height: 78 + ((h >> 2) % 18), // 78~95% (선반 높이 대비)
    tilt: h % 7 === 0 ? -2 : 0, // 가끔 살짝 기울어진 책
  };
}

/** 책등 1권 (서버 컴포넌트, hover는 CSS로 처리) */
export function BookSpine({ book }: { book: Book }) {
  const v = variation(book.id);
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
        style={{ backgroundColor: book.spineColor, color: book.spineTextColor }}
      >
        {book.status === "reading" && (
          <BookOpen className="mb-1 size-3 shrink-0 opacity-90" aria-label="읽는 중" />
        )}
        {book.status === "wishlist" && (
          <Bookmark className="mb-1 size-3 shrink-0 opacity-90" aria-label="찜" />
        )}
        <span className="spine-title min-h-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-bold tracking-tight">
          {book.title}
        </span>
        <span className="spine-title mt-1 mb-2 max-h-16 overflow-hidden whitespace-nowrap text-[8px] opacity-70">
          {book.author}
        </span>
      </span>
    </Link>
  );
}
