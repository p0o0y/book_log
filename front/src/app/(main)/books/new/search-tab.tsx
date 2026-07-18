"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Book } from "@/lib/types";
import type { BookFormPrefill } from "./book-form";

export function SearchTab({
  books,
  onSelect,
}: {
  books: Book[];
  onSelect: (prefill: BookFormPrefill) => void;
}) {
  const [query, setQuery] = useState("");

  const keyword = query.trim().toLowerCase();
  const results =
    keyword === ""
      ? []
      : books.filter(
          (b) =>
            b.title.toLowerCase().includes(keyword) ||
            b.author.toLowerCase().includes(keyword)
        );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="책 제목 또는 저자를 검색하세요"
            className="pl-9"
          />
        </div>
      </div>

      {keyword === "" ? (
        <p className="text-sm text-muted-foreground">
          검색어를 입력하면 결과가 표시돼요. 결과에 없으면 직접 등록 탭을
          이용하세요.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            검색 결과 {results.length}건
          </p>
          {results.map((book) => (
            <Card key={book.id}>
              <CardContent className="flex items-center gap-4">
                <BookCover
                  book={book}
                  className="w-14 shrink-0 p-1.5 [&_p]:text-[7px]"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{book.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {book.author}
                    {book.publisher && ` · ${book.publisher}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() =>
                    onSelect({
                      title: book.title,
                      author: book.author,
                      publisher: book.publisher,
                      coverImageUrl: book.coverImageUrl,
                      totalPages: book.totalPages,
                    })
                  }
                >
                  선택
                </Button>
              </CardContent>
            </Card>
          ))}
          {results.length === 0 && (
            <p className="text-sm text-muted-foreground">
              일치하는 책이 없어요. 직접 등록 탭에서 등록해주세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
