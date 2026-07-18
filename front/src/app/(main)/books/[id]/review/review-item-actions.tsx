"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PendingButton } from "@/components/pending-button";
import { toast } from "@/components/toaster";
import { deleteReviewAction, type DeleteReviewState } from "./actions";

const initialState: DeleteReviewState = { message: null };

export function ReviewItemActions({
  bookId,
  reviewId,
}: {
  bookId: string;
  reviewId: string;
}) {
  const [state, formAction] = useActionState(deleteReviewAction, initialState);

  useEffect(() => {
    if (state.message) toast(state.message);
  }, [state]);

  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" aria-label="수정" asChild>
        <Link href={`/books/${bookId}/review/${reviewId}/edit`}>
          <Pencil className="size-4" />
        </Link>
      </Button>
      <form
        action={formAction}
        onSubmit={(e) => {
          if (!confirm("이 독후감을 삭제할까요?")) e.preventDefault();
        }}
      >
        <input type="hidden" name="reviewId" value={reviewId} />
        <PendingButton variant="ghost" size="icon" aria-label="삭제">
          <Trash2 className="size-4" />
        </PendingButton>
      </form>
    </div>
  );
}
