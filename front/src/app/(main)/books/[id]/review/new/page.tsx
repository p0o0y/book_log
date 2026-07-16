import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBook } from "@/lib/mock-data";
import { BookCover } from "@/components/book-cover";
import { StatusBadge } from "@/components/status-badge";
import { StarRatingInput } from "@/components/star-rating-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function NewReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/books/${book.id}`}>
          <ArrowLeft className="size-4" />
          책 상세로 돌아가기
        </Link>
      </Button>

      {/* 대상 책 요약 */}
      <Card>
        <CardContent className="flex items-center gap-4">
          <BookCover book={book} className="w-16 shrink-0 p-1.5 [&_p]:text-[8px]" />
          <div>
            <StatusBadge status={book.status} className="mb-1" />
            <p className="font-bold">{book.title}</p>
            <p className="text-sm text-muted-foreground">{book.author}</p>
          </div>
        </CardContent>
      </Card>

      <h1 className="text-2xl font-black">독후감 쓰기</h1>

      <form className="space-y-6">
        <div className="space-y-2">
          <Label>별점</Label>
          <StarRatingInput />
        </div>

        <div className="space-y-2">
          <Label htmlFor="one-liner">한줄평</Label>
          <Input
            id="one-liner"
            placeholder="이 책을 한 문장으로 표현한다면?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">본문</Label>
          <Textarea
            id="content"
            rows={12}
            placeholder="자유롭게 감상을 남겨보세요. 마크다운을 지원할 예정이에요."
            className="min-h-64"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={`/books/${book.id}`}>취소</Link>
          </Button>
          <Button type="button">저장하기</Button>
        </div>
      </form>
    </div>
  );
}
