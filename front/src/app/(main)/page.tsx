import Link from "next/link";
import { LayoutGrid, Library } from "lucide-react";
import { books, STATUS_LABEL, type BookStatus } from "@/lib/mock-data";
import { Bookshelf } from "@/components/bookshelf/bookshelf";
import { BookGrid } from "@/components/bookshelf/book-grid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FILTERS = ["all", "reading", "finished", "wishlist"] as const;
type Filter = (typeof FILTERS)[number];

export default async function ShelfPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; view?: string }>;
}) {
  const params = await searchParams;
  const filter: Filter = FILTERS.includes(params.status as Filter)
    ? (params.status as Filter)
    : "all";
  const view = params.view === "grid" ? "grid" : "shelf";

  const filtered =
    filter === "all" ? books : books.filter((b) => b.status === filter);

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
          지금까지 {counts.finished}권을 완독했어요. 책등을 클릭하면 상세 페이지로 이동합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* 상태 필터 */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {FILTERS.map((f) => (
            <Link
              key={f}
              href={f === "all" ? `/?view=${view}` : `/?status=${f}&view=${view}`}
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

        {/* 뷰 전환 */}
        <div className="flex gap-1">
          <Button
            variant={view === "shelf" ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={filter === "all" ? "/" : `/?status=${filter}`}>
              <Library className="size-4" />
              책장
            </Link>
          </Button>
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link
              href={
                filter === "all"
                  ? "/?view=grid"
                  : `/?status=${filter}&view=grid`
              }
            >
              <LayoutGrid className="size-4" />
              그리드
            </Link>
          </Button>
        </div>
      </div>

      {view === "shelf" ? (
        <Bookshelf books={filtered} />
      ) : (
        <BookGrid books={filtered} />
      )}
    </div>
  );
}
