"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/toaster";
import { updateProgress, type ProgressFormState } from "./actions";

const initialState: ProgressFormState = { error: null };

/** 읽는 중인 책의 현재 페이지 갱신 폼 */
export function ProgressForm({
  bookId,
  currentPage,
  totalPages,
}: {
  bookId: string;
  currentPage?: number;
  totalPages?: number;
}) {
  const [state, formAction, pending] = useActionState(
    updateProgress,
    initialState
  );

  useEffect(() => {
    if (state.message) toast(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input type="hidden" name="bookId" value={bookId} />
        <Input
          name="currentPage"
          type="number"
          min={0}
          max={totalPages}
          defaultValue={currentPage}
          aria-label="현재 페이지"
          aria-describedby={state.error ? "progress-form-error" : undefined}
          className="w-28"
        />
        <span className="text-sm text-muted-foreground">쪽까지 읽음</span>
        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          {pending ? "저장 중..." : "진행률 저장"}
        </Button>
      </div>
      {state.error && (
        <p
          id="progress-form-error"
          role="alert"
          aria-live="polite"
          className="text-sm font-medium text-destructive"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
