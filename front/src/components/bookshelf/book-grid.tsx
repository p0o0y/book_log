import Link from "next/link";
import type { Book } from "@/lib/types";
import { BookCover } from "@/components/book-cover";
import { StatusBadge } from "@/components/status-badge";

/** 그리드 대체 뷰 */
export function BookGrid({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/books/${book.id}`}
          className="group rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
        >
          <BookCover book={book} className="transition-transform group-hover:-translate-y-1" />
          <div className="mt-3 space-y-1">
            <p className="truncate text-sm font-bold">{book.title}</p>
            <p className="truncate text-xs text-muted-foreground">{book.author}</p>
            <StatusBadge status={book.status} className="text-[10px]" />
          </div>
        </Link>
      ))}
    </div>
  );
}
