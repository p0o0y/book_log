import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, PenLine, Play, Star } from "lucide-react";
import { getBook, listReviews, listYoutubeVideos } from "@/lib/store";
import { BookCover } from "@/components/book-cover";
import { StatusBadge } from "@/components/status-badge";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BookActions } from "./book-actions";
import { ProgressForm } from "./progress-form";
import { ReviewItemActions } from "./review/review-item-actions";
import { VideoDeleteButton, VideoForm } from "./video-form";

export const dynamic = "force-dynamic";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  const [bookReviews, videos] = await Promise.all([
    listReviews(book.id),
    listYoutubeVideos(book.id),
  ]);
  const progress =
    book.status === "reading" && book.currentPage && book.totalPages
      ? Math.round((book.currentPage / book.totalPages) * 100)
      : null;

  return (
    <div className="space-y-8">
      {/* 책 정보 */}
      <section className="flex flex-col gap-6 sm:flex-row">
        <BookCover book={book} className="w-40 shrink-0 sm:w-48" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-1.5">
            <StatusBadge status={book.status} />
            {book.isWishlisted && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                <Star className="size-3 fill-current" />찜
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black">{book.title}</h1>
          <p className="text-muted-foreground">
            {book.author}
            {book.publisher && ` · ${book.publisher}`}
          </p>
          {book.finishDate && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarCheck className="size-4" />
              {book.finishDate} 완독
            </p>
          )}
          {progress !== null && (
            <div className="max-w-sm space-y-1.5 pt-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">읽기 진행률</span>
                <span className="text-muted-foreground">
                  {book.currentPage} / {book.totalPages}쪽 ({progress}%)
                </span>
              </div>
              <Progress value={progress} />
            </div>
          )}
          {book.status === "reading" && book.totalPages && (
            <div className="pt-1">
              <ProgressForm
                bookId={book.id}
                currentPage={book.currentPage}
                totalPages={book.totalPages}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button asChild>
              <Link href={`/books/${book.id}/review/new`}>
                <PenLine className="size-4" />
                독후감 쓰기
              </Link>
            </Button>
            <BookActions
              bookId={book.id}
              status={book.status}
              isWishlisted={book.isWishlisted}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* 독후감 목록 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          내 독후감{" "}
          <span className="text-base font-normal text-muted-foreground">
            {bookReviews.length}편
          </span>
        </h2>
        {bookReviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
              <p>아직 작성한 독후감이 없어요. 첫 독후감을 남겨보세요!</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/books/${book.id}/review/new`}>
                  첫 독후감 쓰기
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          bookReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5">
                    {review.rating && <StarRating rating={review.rating} />}
                    <CardTitle className="text-lg">
                      &ldquo;{review.oneLiner}&rdquo;
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {review.createdAt}
                    </p>
                  </div>
                  <ReviewItemActions bookId={book.id} reviewId={review.id} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line leading-relaxed">
                  {review.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <Separator />

      {/* 관련 유튜브 영상 — URL 붙여넣기로 직접 등록 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">관련 유튜브 영상</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            이 책과 관련된 영상 링크를 모아둘 수 있어요.
          </p>
        </div>
        <VideoForm bookId={book.id} />
        {videos.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              아직 등록한 영상이 없어요. 유튜브 링크를 붙여넣어 추가해보세요.
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {videos.map((video) => (
              <div key={video.id} className="group relative w-64 shrink-0">
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg shadow-sm"
                  style={
                    video.thumbnailUrl
                      ? undefined
                      : {
                          background: `linear-gradient(135deg, ${video.thumbnailColor ?? "#444"} 0%, #1a1a1a 100%)`,
                        }
                  }
                >
                  {video.thumbnailUrl && (
                    // 유튜브 썸네일 CDN — next/image 원격 설정 대신 img 사용
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnailUrl}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                  )}
                  <span className="relative flex size-12 items-center justify-center rounded-full bg-black/60 transition-transform group-hover:scale-110">
                    <Play className="size-5 fill-white text-white" />
                  </span>
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white">
                      {video.duration}
                    </span>
                  )}
                </a>
                <VideoDeleteButton videoId={video.id} />
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug">
                  {video.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {video.channel}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
