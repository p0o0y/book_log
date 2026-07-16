import Link from "next/link";
import { BookOpen, BookmarkPlus, CheckCircle2, Star } from "lucide-react";
import { books, reviews } from "@/lib/mock-data";
import { BookCover } from "@/components/book-cover";
import { StarRating } from "@/components/star-rating";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월"];

export default function DashboardPage() {
  const finished = books.filter((b) => b.status === "finished");
  const finishedThisYear = finished.filter((b) =>
    b.finishDate?.startsWith("2026")
  );
  const reading = books.filter((b) => b.status === "reading");
  const wishlist = books.filter((b) => b.status === "wishlist");

  const rated = reviews.filter((r) => r.rating);
  const avgRating =
    rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length;

  // 월별 완독 수 (2026년)
  const monthly = MONTH_LABELS.map((label, i) => ({
    label,
    count: finishedThisYear.filter(
      (b) => b.finishDate && new Date(b.finishDate).getMonth() === i
    ).length,
  }));
  const maxCount = Math.max(...monthly.map((m) => m.count), 1);

  const recentFinished = [...finished]
    .sort((a, b) => (b.finishDate ?? "").localeCompare(a.finishDate ?? ""))
    .slice(0, 5);

  const stats = [
    { label: "올해 읽은 책", value: `${finishedThisYear.length}권`, icon: CheckCircle2 },
    { label: "읽는 중", value: `${reading.length}권`, icon: BookOpen },
    { label: "찜한 책", value: `${wishlist.length}권`, icon: BookmarkPlus },
    { label: "평균 별점", value: avgRating.toFixed(1), icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          2026년 나의 독서 기록 요약이에요.
        </p>
      </div>

      {/* 통계 타일 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="size-5 text-primary" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* 월별 완독 차트 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>월별 완독</CardTitle>
            <CardDescription>2026년 1월 – 7월</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-44 items-end gap-3">
              {monthly.map((m) => (
                <div
                  key={m.label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                  title={`${m.label}: ${m.count}권`}
                >
                  {m.count > 0 && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {m.count}
                    </span>
                  )}
                  <div
                    className="w-full max-w-9 rounded-t bg-primary"
                    style={{
                      height: `${(m.count / maxCount) * 100}%`,
                      minHeight: m.count > 0 ? 8 : 2,
                      opacity: m.count > 0 ? 1 : 0.15,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 최근 완독 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>최근 완독한 책</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentFinished.map((book) => {
              const review = reviews.find(
                (r) => r.bookId === book.id && r.rating
              );
              return (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-accent"
                >
                  <BookCover
                    book={book}
                    className="w-9 shrink-0 rounded-[2px] p-1 shadow-sm [&_p]:hidden"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{book.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {book.finishDate} 완독
                    </p>
                  </div>
                  {review?.rating && <StarRating rating={review.rating} />}
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
