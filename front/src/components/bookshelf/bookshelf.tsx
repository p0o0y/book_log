import type { Book } from "@/lib/mock-data";
import { BookSpine } from "./book-spine";

const BOOKS_PER_SHELF = 9;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** 나무 책장 프레임 + 선반 (PDF 스크린샷 스타일) */
export function Bookshelf({ books }: { books: Book[] }) {
  const shelves = chunk(books, BOOKS_PER_SHELF);
  // 책이 적어도 책장 형태 유지를 위해 최소 3칸
  while (shelves.length < 3) shelves.push([]);

  return (
    <div
      className="rounded-lg p-3 shadow-xl sm:p-4"
      style={{
        background:
          "linear-gradient(135deg, #6b4226 0%, #7d4e2d 25%, #5d3a20 55%, #6b4226 100%)",
      }}
    >
      <div
        className="flex flex-col gap-0 rounded-sm border-[10px] shadow-inner sm:border-[14px]"
        style={{
          borderColor: "#4a2e18",
          background: "linear-gradient(180deg, #3d2614 0%, #2f1d0e 100%)",
        }}
      >
        {shelves.map((shelf, i) => (
          <div key={i}>
            {/* 선반 한 칸 */}
            <div
              className="flex h-44 items-end gap-[3px] overflow-x-auto px-3 pb-0 sm:h-48"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(93,58,32,0.35) 30%, rgba(93,58,32,0.15) 100%)",
              }}
            >
              {shelf.map((book) => (
                <BookSpine key={book.id} book={book} />
              ))}
              {shelf.length === 0 && (
                <p className="w-full self-center text-center text-sm text-amber-100/40">
                  아직 비어있는 칸이에요
                </p>
              )}
            </div>
            {/* 선반 판자 */}
            <div
              className="h-4 shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
              style={{
                background:
                  "linear-gradient(180deg, #8a5a33 0%, #6b4226 40%, #4a2e18 100%)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
