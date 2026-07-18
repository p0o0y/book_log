import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBook } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { BookForm } from "../../new/book-form";

export const dynamic = "force-dynamic";

export default async function EditBookPage({
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

      <div>
        <h1 className="text-2xl font-black">책 정보 수정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {book.title} — {book.author}
        </p>
      </div>

      <BookForm book={book} />
    </div>
  );
}
