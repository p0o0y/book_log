"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "@/components/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Book } from "@/lib/types";
import { saveBook, type BookFormState } from "./actions";

export interface BookFormPrefill {
  title?: string;
  author?: string;
  publisher?: string;
  coverImageUrl?: string;
  totalPages?: number;
}

const initialState: BookFormState = { error: null };

/** 책 등록/수정 공용 폼 — book을 넘기면 수정 모드 */
export function BookForm({
  prefill,
  book,
}: {
  prefill?: BookFormPrefill;
  book?: Book;
}) {
  const [state, formAction, pending] = useActionState(saveBook, initialState);
  const router = useRouter();
  const defaults: BookFormPrefill = book ?? prefill ?? {};

  useEffect(() => {
    if (state.redirectTo) {
      if (state.message) toast(state.message);
      router.push(state.redirectTo);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      {book && <input type="hidden" name="bookId" value={book.id} />}
      <div className="space-y-2">
        <Label htmlFor="title">
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="책 제목"
          aria-describedby={state.error ? "book-form-error" : undefined}
          defaultValue={defaults.title}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="author">
          저자 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="author"
          name="author"
          placeholder="저자명"
          aria-describedby={state.error ? "book-form-error" : undefined}
          defaultValue={defaults.author}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="publisher">출판사 (선택)</Label>
        <Input
          id="publisher"
          name="publisher"
          placeholder="출판사"
          defaultValue={defaults.publisher}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="coverImageUrl">표지 이미지 URL (선택)</Label>
        <Input
          id="coverImageUrl"
          name="coverImageUrl"
          placeholder="https://..."
          defaultValue={defaults.coverImageUrl}
        />
        <p className="text-xs text-muted-foreground">
          이미지가 없으면 대표색 기반 플레이스홀더 책등이 사용돼요.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="totalPages">총 페이지 수 (선택)</Label>
          <Input
            id="totalPages"
            name="totalPages"
            type="number"
            min={1}
            placeholder="예: 320"
            defaultValue={defaults.totalPages}
          />
        </div>
        <div className="space-y-2">
          <Label>상태</Label>
          <Select name="status" defaultValue={book?.status ?? "reading"}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reading">읽는 중</SelectItem>
              <SelectItem value="finished">완독</SelectItem>
              <SelectItem value="wishlist">읽고 싶은 책 (찜)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">시작일 (선택)</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={book?.startDate}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="finishDate">완독일 (선택)</Label>
          <Input
            id="finishDate"
            name="finishDate"
            type="date"
            defaultValue={book?.finishDate}
          />
        </div>
      </div>
      {state.error && (
        <p
          id="book-form-error"
          role="alert"
          aria-live="polite"
          className="text-sm font-medium text-destructive"
        >
          {state.error}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : book ? "저장하기" : "등록하기"}
        </Button>
      </div>
    </form>
  );
}
