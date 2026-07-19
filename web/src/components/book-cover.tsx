import { cn } from "@/lib/utils";
import { spineGradient } from "@/lib/spine-palette";
import type { Book } from "@/lib/types";

/**
 * 책 표지 — coverImageUrl이 있으면 실제 표지 이미지를,
 * 없거나 로딩에 실패하면 대표색 기반 플레이스홀더를 보여준다 (PRD 비기능 요구사항).
 * 플레이스홀더를 배경에 항상 렌더링하고 이미지를 위에 얹는 방식이라
 * 이미지가 깨져도 자연스럽게 대체된다.
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
      style={{
        backgroundColor: book.spineColor,
        backgroundImage: spineGradient(book.spinePalette),
        color: book.spineTextColor,
      }}
    >
      <div className="absolute inset-y-0 left-0 w-1.5 bg-black/20" />
      <div className="pl-2">
        <p className="text-sm font-bold leading-snug break-keep">{book.title}</p>
        <p className="mt-1 text-[11px] opacity-80">{book.author}</p>
      </div>
      {book.publisher && (
        <p className="pl-2 text-[10px] opacity-60">{book.publisher}</p>
      )}
      {book.coverImageUrl && (
        // 표지 출처 도메인이 다양해 next/image 대신 img 사용
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.coverImageUrl}
          alt={`${book.title} 표지`}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  );
}
