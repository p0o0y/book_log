import Link from "next/link";
import { LayoutGrid, Library, SearchX } from "lucide-react";
import { listBooks } from "@/lib/store";
import { STATUS_LABEL, type Book, type BookStatus } from "@/lib/types";
import { Bookshelf } from "@/components/bookshelf/bookshelf";
import { BookGrid } from "@/components/bookshelf/book-grid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShelfControls } from "./shelf-controls";
import {
  SHELF_FILTERS,
  SHELF_SORTS,
  shelfUrl,
  type ShelfFilter,
  type ShelfParams,
  type ShelfSort,
} from "./shelf-url";

function compareBooks(sort: ShelfSort) {
  return (a: Book, b: Book): number => {
    if (sort === "title") return a.title.localeCompare(b.title, "ko");
    if (sort === "author") return a.author.localeCompare(b.author, "ko");
    // recent: 완독일 → 시작일 기준 내림차순, 날짜 없는 책(찜)은 뒤로
    const aDate = a.finishDate ?? a.startDate ?? "";
    const bDate = b.finishDate ?? b.startDate ?? "";
    return bDate.localeCompare(aDate);
  };
}

export default async function ShelfPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    view?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  const raw = await searchParams;
  const filter: ShelfFilter = SHELF_FILTERS.includes(raw.status as ShelfFilter)
    ? (raw.status as ShelfFilter)
    : "all";
  const view = raw.view === "grid" ? "grid" : "shelf";
  const q = (raw.q ?? "").trim();
  const sort: ShelfSort = SHELF_SORTS.includes(raw.sort as ShelfSort)
    ? (raw.sort as ShelfSort)
    : "recent";
  const params: ShelfParams = { status: filter, view, q, sort };

  const books = listBooks();
  const keyword = q.toLowerCase();
  const filtered = books
    .filter((b) => filter === "all" || b.status === filter)
    .filter(
      (b) =>
        keyword === "" ||
        b.title.toLowerCase().includes(keyword) ||
        b.author.toLowerCase().includes(keyword)
    )
    .sort(compareBooks(sort));

  const counts = {
    all: books.length,
    reading: books.filter((b) => b.status === "reading").length,
    finished: books.filter((b) => b.status === "finished").length,
    wishlist: books.filter((b) => b.status === "wishlist").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">나의 서재</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          지금까지 {counts.finished}권을 완독했어요. 책등을 클릭하면 상세
          페이지로 이동합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* 상태 필터 */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {SHELF_FILTERS.map((f) => (
            <Link
              key={f}
              href={shelfUrl({ ...params, status: f })}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "전체" : STATUS_LABEL[f as BookStatus]}
              <span className="ml-1 text-xs text-muted-foreground">
                {counts[f]}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 검색 · 정렬 */}
          <ShelfControls params={params} />

          {/* 뷰 전환 */}
          <div className="flex gap-1">
            <Button
              variant={view === "shelf" ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={shelfUrl({ ...params, view: "shelf" })}>
                <Library className="size-4" />
                책장
              </Link>
            </Button>
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={shelfUrl({ ...params, view: "grid" })}>
                <LayoutGrid className="size-4" />
                그리드
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <Library className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            아직 서재에 책이 없어요. 첫 책을 등록해보세요!
          </p>
          <Button asChild>
            <Link href="/books/new">첫 책 등록하기</Link>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            {q
              ? `‘${q}’에 해당하는 책이 없어요.`
              : "조건에 맞는 책이 없어요."}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">전체 보기</Link>
          </Button>
        </div>
      ) : view === "shelf" ? (
        <Bookshelf books={filtered} />
      ) : (
        <BookGrid books={filtered} />
      )}
    </div>
  );
}
