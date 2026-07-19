"use client";

import { useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AladinBook } from "@/lib/aladin";
import { lookupPagesAction, searchBooksAction } from "./actions";
import type { BookFormPrefill } from "./book-form";

export function SearchTab({
  onSelect,
}: {
  onSelect: (prefill: BookFormPrefill) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AladinBook[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();
  const [selecting, startSelect] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim() === "" || searching) return;
    startSearch(async () => {
      const res = await searchBooksAction(query);
      if (res.error !== undefined) {
        setError(res.error);
        setResults([]);
      } else {
        setError(null);
        setResults(res.items);
      }
      setSearched(true);
    });
  }

  function handleSelect(book: AladinBook) {
    if (selecting) return;
    startSelect(async () => {
      const totalPages = await lookupPagesAction(book.isbn13);
      onSelect({
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        coverImageUrl: book.coverImageUrl,
        totalPages,
      });
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="책 제목 또는 저자를 검색하세요"
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={searching || query.trim() === ""}>
          {searching ? <Loader2 className="size-4 animate-spin" /> : "검색"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {!searched && !error ? (
        <p className="text-sm text-muted-foreground">
          알라딘에서 책을 검색해요. 결과에 없으면 직접 등록 탭을 이용하세요.
        </p>
      ) : (
        !error && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              검색 결과 {results.length}건
            </p>
            {results.map((book) => (
              <Card key={book.isbn13}>
                <CardContent className="flex items-center gap-4">
                  {book.coverImageUrl ? (
                    // 외부 커버 썸네일 — 도메인이 다양해 next/image 대신 img 사용
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.coverImageUrl}
                      alt=""
                      className="w-14 shrink-0 rounded-sm shadow-sm"
                    />
                  ) : (
                    <div className="aspect-[2/3] w-14 shrink-0 rounded-sm bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{book.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {book.author}
                      {book.publisher && ` · ${book.publisher}`}
                      {book.pubDate && ` · ${book.pubDate.slice(0, 4)}`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={selecting}
                    onClick={() => handleSelect(book)}
                  >
                    {selecting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "선택"
                    )}
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
        )
      )}
    </div>
  );
}
