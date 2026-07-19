import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBook } from "@/lib/store";
import { BookCover } from "@/components/book-cover";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewForm } from "../review-form";

export const dynamic = "force-dynamic";

export default async function NewReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBook(id);
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

      <ReviewForm bookId={book.id} />
    </div>
  );
}
