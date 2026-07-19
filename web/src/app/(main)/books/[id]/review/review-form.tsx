"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "@/components/toaster";
import { StarRatingInput } from "@/components/star-rating-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Review } from "@/lib/types";
import { saveReview, type ReviewFormState } from "./actions";

const initialState: ReviewFormState = { error: null };

/** 독후감 작성/수정 공용 폼 — review를 넘기면 수정 모드 */
export function ReviewForm({
  bookId,
  review,
}: {
  bookId: string;
  review?: Review;
}) {
  const [state, formAction, pending] = useActionState(saveReview, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.redirectTo) {
      if (state.message) toast(state.message);
      router.push(state.redirectTo);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="bookId" value={bookId} />
      {review && <input type="hidden" name="reviewId" value={review.id} />}

      <div className="space-y-2">
        <Label>별점</Label>
        <StarRatingInput name="rating" defaultValue={review?.rating ?? 0} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="oneLiner">한줄평</Label>
        <Input
          id="oneLiner"
          name="oneLiner"
          placeholder="이 책을 한 문장으로 표현한다면?"
          aria-describedby={state.error ? "review-form-error" : undefined}
          defaultValue={review?.oneLiner}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">본문</Label>
        <Textarea
          id="content"
          name="content"
          rows={12}
          placeholder="자유롭게 감상을 남겨보세요. 마크다운을 지원할 예정이에요."
          className="min-h-64"
          defaultValue={review?.content}
        />
      </div>

      {state.error && (
        <p
          id="review-form-error"
          role="alert"
          aria-live="polite"
          className="text-sm font-medium text-destructive"
        >
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href={`/books/${bookId}`}>취소</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : "저장하기"}
        </Button>
      </div>
    </form>
  );
}
