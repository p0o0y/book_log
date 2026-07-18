import { cn } from "@/lib/utils";
import type { Book } from "@/lib/types";

/**
 * 표지 플레이스홀더 — 표지 이미지 로딩 실패/부재 시 대표색 기반 대체 UI (PRD 비기능 요구사항).
 * UI 전용 단계라 항상 플레이스홀더를 렌더링한다.
 */
export function BookCover({
  book,
  className,
}: {
  book: Book;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[2/3] flex-col justify-between overflow-hidden rounded-sm p-3 shadow-md",
        className
      )}
      style={{ backgroundColor: book.spineColor, color: book.spineTextColor }}
    >
      <div className="absolute inset-y-0 left-0 w-1.5 bg-black/20" />
      <div className="pl-2">
        <p className="text-sm font-bold leading-snug break-keep">{book.title}</p>
        <p className="mt-1 text-[11px] opacity-80">{book.author}</p>
      </div>
      {book.publisher && (
        <p className="pl-2 text-[10px] opacity-60">{book.publisher}</p>
      )}
    </div>
  );
}
